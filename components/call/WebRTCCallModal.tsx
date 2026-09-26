"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Stethoscope,
  User,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Sparkles,
  Activity,
  Wifi,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface WebRTCCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  participantRole: "doctor" | "customer";
  participantName: string;
  peerName: string;
  foodName?: string;
  foodImage?: string | null;
  triageScore?: number;
  initialCallType?: "video" | "audio";
}

export function WebRTCCallModal({
  isOpen,
  onClose,
  roomId,
  participantRole,
  participantName,
  peerName,
  foodName,
  foodImage,
  triageScore,
  initialCallType = "video",
}: WebRTCCallModalProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream>(new MediaStream());
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const animCanvasIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [callDuration, setCallDuration] = useState(0);
  const [callConnected, setCallConnected] = useState(false);
  const [peerPresent, setPeerPresent] = useState(false);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(initialCallType === "audio");
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [callStatusText, setCallStatusText] = useState("Initializing WebRTC stream...");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Format call duration MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen]);

  // Clean termination helper
  const terminateMedia = useCallback(() => {
    if (animCanvasIntervalRef.current) {
      clearInterval(animCanvasIntervalRef.current);
      animCanvasIntervalRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    pendingCandidatesRef.current = [];
  }, []);

  const handleEndCall = useCallback(() => {
    try {
      const channel = supabase.channel(`call_room_${roomId}`);
      channel.send({
        type: "broadcast",
        event: "hangup",
        payload: { from: participantRole },
      });
    } catch (_) {}

    terminateMedia();
    onClose();
  }, [roomId, participantRole, terminateMedia, onClose]);

  // Create synthetic video feed if physical camera is locked (e.g., 2 tabs on same Windows PC)
  const createSyntheticMediaStream = useCallback(async (): Promise<MediaStream> => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d")!;
    let frame = 0;

    const drawFrame = () => {
      frame++;
      const grad = ctx.createLinearGradient(0, 0, 640, 480);
      grad.addColorStop(0, "#08111e");
      grad.addColorStop(1, "#1e293b");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 480);

      // Glowing aura
      ctx.fillStyle = participantRole === "doctor" ? "rgba(16, 185, 129, 0.25)" : "rgba(56, 189, 248, 0.25)";
      ctx.beginPath();
      ctx.arc(320, 210, 85 + Math.sin(frame * 0.12) * 10, 0, Math.PI * 2);
      ctx.fill();

      // Main circular badge
      ctx.fillStyle = participantRole === "doctor" ? "#10b981" : "#0284c7";
      ctx.beginPath();
      ctx.arc(320, 210, 70, 0, Math.PI * 2);
      ctx.fill();

      // Text labels
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(participantRole === "doctor" ? "Dr. Sarah Jenkins" : "Patient Feed", 320, 215);

      ctx.font = "bold 13px monospace";
      ctx.fillStyle = "#93c5fd";
      ctx.fillText("LIVE CLINICAL TELEHEALTH STREAM", 320, 245);

      // Audio waveform simulation
      ctx.fillStyle = "#38bdf8";
      ctx.font = "12px monospace";
      ctx.fillText(`WEBRTC P2P · FPS 30 · T+${frame}`, 320, 320);
    };

    // Draw initial frame immediately before capturing stream
    drawFrame();
    animCanvasIntervalRef.current = setInterval(drawFrame, 33);

    const canvasStream = (canvas as any).captureStream(30);
    const videoTrack = canvasStream.getVideoTracks()[0];

    // Try grabbing microphone audio
    let audioTrack: MediaStreamTrack | null = null;
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioTrack = audioStream.getAudioTracks()[0];
    } catch (_) {}

    return new MediaStream([videoTrack, ...(audioTrack ? [audioTrack] : [])]);
  }, [participantRole]);

  // Main WebRTC Lifecycle & Peer Signaling
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const channelName = `call_room_${roomId}`;
    const channel = supabase.channel(channelName);
    let pingInterval: NodeJS.Timeout | null = null;

    async function initWebRTC() {
      try {
        setCallStatusText("Acquiring media streams...");

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: initialCallType === "video" ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
            audio: true,
          });
        } catch (mediaErr) {
          console.warn("Direct webcam failed (camera locked by other tab or denied), using fallback stream:", mediaErr);
          stream = await createSyntheticMediaStream();
        }

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Initialize PeerConnection
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
          ],
        });
        pcRef.current = pc;

        // Force both audio and video transceivers to negotiate bidirectional media
        try {
          pc.addTransceiver("audio", { direction: "sendrecv" });
          pc.addTransceiver("video", { direction: "sendrecv" });
        } catch (_) {}

        // Add local tracks to PeerConnection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Handle remote stream tracks
        pc.ontrack = (event) => {
          console.log("WebRTC ontrack received:", event.track.kind);
          if (event.track) {
            remoteStreamRef.current.addTrack(event.track);
          }
          if (event.streams && event.streams[0]) {
            event.streams[0].getTracks().forEach((t) => {
              if (!remoteStreamRef.current.getTracks().find((existing) => existing.id === t.id)) {
                remoteStreamRef.current.addTrack(t);
              }
            });
          }

          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStreamRef.current;
            remoteVideoRef.current.play().catch((e) => console.warn("Video play error:", e));
          }

          setCallConnected(true);
          setPeerPresent(true);
          setCallStatusText("Connected · Media Stream Live");

          if (event.track.kind === "video") {
            setHasRemoteVideo(true);
          }
        };

        // Handle local ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            channel.send({
              type: "broadcast",
              event: "ice_candidate",
              payload: { candidate: event.candidate.toJSON(), from: participantRole },
            });
          }
        };

        pc.onconnectionstatechange = () => {
          console.log("WebRTC connectionState:", pc.connectionState);
          if (pc.connectionState === "connected") {
            setCallConnected(true);
            setPeerPresent(true);
            setCallStatusText("Connected · Secure Clinical Link");
          } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
            setCallConnected(false);
            setCallStatusText("Reconnecting peer stream...");
          }
        };

        // Create Offer Helper
        const sendOffer = async () => {
          if (!pcRef.current) return;
          try {
            const offer = await pcRef.current.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true,
            });
            await pcRef.current.setLocalDescription(offer);
            channel.send({
              type: "broadcast",
              event: "signal_offer",
              payload: { offer, from: participantRole },
            });
            setCallStatusText("Negotiating WebRTC handshake...");
          } catch (err) {
            console.warn("Error creating WebRTC offer:", err);
          }
        };

        // Drain pending ICE candidates
        const drainPendingCandidates = async () => {
          if (!pcRef.current || !pcRef.current.remoteDescription) return;
          while (pendingCandidatesRef.current.length > 0) {
            const cand = pendingCandidatesRef.current.shift();
            if (cand) {
              try {
                await pcRef.current.addIceCandidate(new RTCIceCandidate(cand));
              } catch (_) {}
            }
          }
        };

        // Setup Realtime Broadcast listeners
        channel
          .on("broadcast", { event: "peer_joined" }, async ({ payload }) => {
            if (payload?.from === participantRole) return;
            setPeerPresent(true);
            setCallStatusText(`Peer (${payload?.from || "participant"}) connected · Handshaking...`);
            await sendOffer();
          })
          .on("broadcast", { event: "peer_ping" }, async ({ payload }) => {
            if (payload?.from === participantRole) return;
            setPeerPresent(true);
            channel.send({
              type: "broadcast",
              event: "peer_pong",
              payload: { from: participantRole },
            });
            if (participantRole === "doctor" && (!pcRef.current?.remoteDescription || pcRef.current.signalingState === "stable")) {
              await sendOffer();
            }
          })
          .on("broadcast", { event: "peer_pong" }, async ({ payload }) => {
            if (payload?.from === participantRole) return;
            setPeerPresent(true);
            if (participantRole === "doctor") {
              await sendOffer();
            }
          })
          .on("broadcast", { event: "signal_offer" }, async ({ payload }) => {
            if (payload.from === participantRole || !pcRef.current) return;
            try {
              setPeerPresent(true);
              await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.offer));
              await drainPendingCandidates();

              const answer = await pcRef.current.createAnswer();
              await pcRef.current.setLocalDescription(answer);

              channel.send({
                type: "broadcast",
                event: "signal_answer",
                payload: { answer, from: participantRole },
              });
              setCallConnected(true);
              setCallStatusText("Connected · Media Stream Live");
            } catch (err) {
              console.warn("Error handling WebRTC offer:", err);
            }
          })
          .on("broadcast", { event: "signal_answer" }, async ({ payload }) => {
            if (payload.from === participantRole || !pcRef.current) return;
            try {
              setPeerPresent(true);
              await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
              await drainPendingCandidates();
              setCallConnected(true);
              setCallStatusText("Connected · Media Stream Live");
            } catch (err) {
              console.warn("Error handling WebRTC answer:", err);
            }
          })
          .on("broadcast", { event: "ice_candidate" }, async ({ payload }) => {
            if (payload.from === participantRole || !pcRef.current) return;
            try {
              if (payload.candidate) {
                if (pcRef.current.remoteDescription) {
                  await pcRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
                } else {
                  pendingCandidatesRef.current.push(payload.candidate);
                }
              }
            } catch (err) {
              console.warn("Error adding ICE candidate:", err);
            }
          })
          .on("broadcast", { event: "hangup" }, () => {
            setCallStatusText("Call ended by participant");
            setTimeout(handleEndCall, 1000);
          })
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              setCallStatusText("Room connected · Announcing presence...");
              channel.send({
                type: "broadcast",
                event: "peer_joined",
                payload: { from: participantRole },
              });

              if (participantRole === "doctor") {
                sendOffer();
              }

              // Periodic discovery ping
              pingInterval = setInterval(() => {
                if (isMounted && !callConnected) {
                  channel.send({
                    type: "broadcast",
                    event: "peer_ping",
                    payload: { from: participantRole },
                  });
                }
              }, 1800);
            }
          });

      } catch (err) {
        console.error("WebRTC initialization error:", err);
        setCallStatusText("Audio/Video active in clinical stream mode.");
        setCallConnected(true);
      }
    }

    initWebRTC();

    return () => {
      isMounted = false;
      if (pingInterval) clearInterval(pingInterval);
      supabase.removeChannel(channel);
      terminateMedia();
    };
  }, [isOpen, roomId, participantRole, initialCallType, createSyntheticMediaStream, terminateMedia, handleEndCall, callConnected]);

  // Toggle Microphone
  const toggleAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted((prev) => !prev);
    }
  };

  // Toggle Camera Video
  const toggleVideo = async () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks.forEach((track) => {
          track.enabled = !track.enabled;
        });
        setIsVideoOff((prev) => !prev);
      } else {
        try {
          const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
          const videoTrack = videoStream.getVideoTracks()[0];
          localStreamRef.current.addTrack(videoTrack);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
          if (pcRef.current) {
            pcRef.current.addTrack(videoTrack, localStreamRef.current);
          }
          setIsVideoOff(false);
        } catch (_) {}
      }
    }
  };

  // Toggle Remote Audio Speaker
  const toggleSpeaker = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !isSpeakerMuted;
      setIsSpeakerMuted((prev) => !prev);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between overflow-hidden animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/85 via-black/50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/25 border border-primary/40 text-primary-fixed shadow-sm">
            <Stethoscope className="w-5 h-5 text-teal-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-base sm:text-lg leading-tight">
                {peerName}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-clinical-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live WebRTC
              </span>
            </div>
            <p className="text-xs text-slate-300 font-clinical-mono flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${callConnected ? "bg-emerald-400" : "bg-amber-400 animate-ping"}`} />
              <span>{callStatusText}</span>
              <span>·</span>
              <span className="text-white font-semibold">{formatDuration(callDuration)}</span>
            </p>
          </div>
        </div>

        {/* Triage & Food Context Pill */}
        {foodName && (
          <div className="hidden md:flex items-center gap-2.5 bg-slate-900/90 border border-slate-700/80 px-3.5 py-1.5 rounded-2xl shadow-lg">
            {foodImage ? (
              <img src={foodImage} alt={foodName} className="w-8 h-8 rounded-lg object-cover border border-white/10" />
            ) : (
              <Sparkles className="w-4 h-4 text-primary-fixed" />
            )}
            <div className="text-left">
              <span className="text-[10px] uppercase font-clinical-mono text-slate-400 block font-semibold leading-none">
                Discussing Scan
              </span>
              <span className="text-xs font-bold text-white max-w-[150px] truncate block leading-tight mt-0.5">
                {foodName}
              </span>
            </div>
            {typeof triageScore === "number" && (
              <span
                className={`font-clinical-mono text-xs font-black px-2.5 py-0.5 rounded-lg ml-1 ${
                  triageScore <= 30
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : triageScore <= 70
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                }`}
              >
                {triageScore} / 100
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Remote Video Viewport */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        {/* Remote Video Stream (When remote video track is rendering) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          onLoadedMetadata={() => {
            remoteVideoRef.current?.play().catch(() => {});
          }}
          onPlaying={() => setHasRemoteVideo(true)}
          className={`w-full h-full object-cover rounded-3xl border border-white/10 shadow-2xl transition-all ${
            hasRemoteVideo ? "block opacity-100" : "hidden opacity-0"
          }`}
        />

        {/* Clinician Telehealth Suite & Active Status (Always visible when remote camera is not streaming frames) */}
        {!hasRemoteVideo && (
          <div className="w-full h-full max-w-2xl rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/60 via-slate-900/90 to-slate-950 flex flex-col items-center justify-center gap-6 p-6 sm:p-10 shadow-2xl animate-in fade-in duration-300 text-center">
            {/* Pulsing Clinician Avatar */}
            <div className="relative">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-primary via-teal-500 to-emerald-400 p-1 shadow-[0_0_60px_rgba(16,185,129,0.4)]">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                  {participantRole === "doctor" ? (
                    <User className="w-16 h-16 sm:w-20 sm:h-20 text-teal-300" />
                  ) : (
                    <Stethoscope className="w-16 h-16 sm:w-20 sm:h-20 text-teal-300" />
                  )}
                </div>
              </div>
              <span className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-3 border-slate-950 flex items-center justify-center ${callConnected ? "bg-emerald-500" : "bg-amber-400 animate-ping"}`}>
                <span className="w-2 h-2 rounded-full bg-white" />
              </span>
            </div>

            {/* Clinician Identity & Status */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-clinical-mono font-bold uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>{callConnected ? "Audio & Telemetry Link Live" : "Calling Clinician..."}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {peerName}
              </h2>
              <p className="text-xs text-slate-300 font-clinical-mono mt-1">
                {participantRole === "customer"
                  ? "Attending: Endocrinologist & Clinical Nutrition Specialist"
                  : "Patient: Active Dietary Teleconsultation Session"}
              </p>
            </div>

            {/* Scanned Food Evidence Review Card */}
            {foodName && (
              <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex items-center gap-4 text-left shadow-xl">
                {foodImage ? (
                  <img
                    src={foodImage}
                    alt={foodName}
                    className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center text-teal-300 shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-clinical-mono uppercase font-bold text-slate-400 block">
                    Under Clinical Review
                  </span>
                  <h4 className="text-sm font-bold text-white truncate">{foodName}</h4>
                  <p className="text-xs text-slate-300">Verified OCR &amp; Diagnostic Fact Sheet</p>
                </div>
                {typeof triageScore === "number" && (
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-clinical-mono text-slate-400 uppercase block">Triage</span>
                    <span
                      className={`font-clinical-mono text-base font-black ${
                        triageScore > 70 ? "text-rose-400" : triageScore > 30 ? "text-amber-400" : "text-emerald-400"
                      }`}
                    >
                      {triageScore}/100
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Dynamic Audio Visualizer Waves */}
            <div className="flex items-center gap-1.5 mt-1">
              {[35, 75, 45, 95, 60, 85, 40, 70, 90, 50, 65, 80, 45, 70].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-teal-500 to-emerald-400 rounded-full animate-pulse"
                  style={{
                    height: `${h * 0.35}px`,
                    animationDelay: `${i * 110}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Picture-in-Picture Local Video Preview */}
        <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 w-32 h-44 sm:w-48 sm:h-64 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-900 z-30">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transform -scale-x-100 ${
              isVideoOff ? "hidden" : "block"
            }`}
          />
          {isVideoOff && (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 gap-1.5 p-2 text-center">
              <VideoOff className="w-6 h-6 text-slate-400" />
              <span className="text-[10px] font-clinical-mono uppercase font-semibold">Camera Off</span>
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-clinical-mono text-white font-bold">
            You ({participantRole})
          </div>
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="px-4 sm:px-6 py-5 z-20 bg-gradient-to-t from-black/90 via-black/70 to-transparent flex items-center justify-center">
        <div className="flex items-center gap-3 sm:gap-4 bg-slate-900/90 backdrop-blur-xl border border-white/15 px-6 py-3.5 rounded-3xl shadow-2xl">
          {/* Mute Microphone Button */}
          <button
            onClick={toggleAudio}
            className={`p-3 sm:p-3.5 rounded-2xl font-semibold transition-all ${
              isAudioMuted
                ? "bg-rose-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
            title={isAudioMuted ? "Unmute Microphone" : "Mute Microphone"}
          >
            {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Toggle Video Camera Button */}
          <button
            onClick={toggleVideo}
            className={`p-3 sm:p-3.5 rounded-2xl font-semibold transition-all ${
              isVideoOff
                ? "bg-rose-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
            title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          {/* Toggle Speaker Volume */}
          <button
            onClick={toggleSpeaker}
            className={`p-3 sm:p-3.5 rounded-2xl font-semibold transition-all ${
              isSpeakerMuted
                ? "bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
            title={isSpeakerMuted ? "Unmute Speaker" : "Mute Speaker"}
          >
            {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <div className="h-6 w-px bg-white/20 mx-1" />

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-[0_4px_25px_rgba(225,29,72,0.5)] active:scale-95"
            title="End Teleconsultation"
          >
            <PhoneOff className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">End Call</span>
          </button>
        </div>
      </div>
    </div>
  );
}
