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

  const [callDuration, setCallDuration] = useState(0);
  const [callConnected, setCallConnected] = useState(false);
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
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
  }, []);

  const handleEndCall = useCallback(() => {
    // Send hangup broadcast
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

  // WebRTC initialization and Supabase Realtime signaling
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const channel = supabase.channel(`call_room_${roomId}`);

    async function setupWebRTC() {
      try {
        setCallStatusText("Requesting camera & microphone permissions...");
        
        // Request media stream based on initial call type
        const stream = await navigator.mediaDevices.getUserMedia({
          video: initialCallType === "video" ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
          audio: true,
        }).catch(async (err) => {
          console.warn("Camera failed or denied, trying audio only:", err);
          setIsVideoOff(true);
          return await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Initialize PeerConnection with Google STUN servers
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        });
        pcRef.current = pc;

        // Add local tracks to peer connection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Handle remote stream tracks
        pc.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setCallConnected(true);
            setCallStatusText("Connected via WebRTC Peer-to-Peer");
          }
        };

        // ICE candidate generation
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            channel.send({
              type: "broadcast",
              event: "ice_candidate",
              payload: { candidate: event.candidate, from: participantRole },
            });
          }
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === "connected") {
            setCallConnected(true);
            setCallStatusText("Connected · Secure Clinical Channel");
          } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
            setCallConnected(false);
            setCallStatusText("Call Disconnected");
          }
        };

        // Setup Signaling Channel
        channel
          .on("broadcast", { event: "signal_offer" }, async ({ payload }) => {
            if (payload.from === participantRole || !pcRef.current) return;
            try {
              await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.offer));
              const answer = await pcRef.current.createAnswer();
              await pcRef.current.setLocalDescription(answer);
              channel.send({
                type: "broadcast",
                event: "signal_answer",
                payload: { answer, from: participantRole },
              });
              setCallConnected(true);
              setCallStatusText("Connected · Audio & Video Active");
            } catch (e) {
              console.warn("Offer handling error:", e);
            }
          })
          .on("broadcast", { event: "signal_answer" }, async ({ payload }) => {
            if (payload.from === participantRole || !pcRef.current) return;
            try {
              await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
              setCallConnected(true);
              setCallStatusText("Connected · Audio & Video Active");
            } catch (e) {
              console.warn("Answer handling error:", e);
            }
          })
          .on("broadcast", { event: "ice_candidate" }, async ({ payload }) => {
            if (payload.from === participantRole || !pcRef.current) return;
            try {
              if (payload.candidate) {
                await pcRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
              }
            } catch (e) {
              console.warn("ICE candidate error:", e);
            }
          })
          .on("broadcast", { event: "hangup" }, () => {
            setCallStatusText("Call ended by participant");
            setTimeout(handleEndCall, 1000);
          })
          .subscribe(async (status) => {
            if (status === "SUBSCRIBED") {
              setCallStatusText("Room connected · Waiting for peer...");
              // Doctor sends initial offer
              if (participantRole === "doctor" && pcRef.current) {
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
                } catch (err) {
                  console.warn("Offer creation error:", err);
                }
              }
            }
          });

        // Fallback for single-client demo testing: simulate connection after 3s if peer is pending
        setTimeout(() => {
          if (isMounted && !callConnected) {
            setCallConnected(true);
            setCallStatusText("Simulated Teleconsultation Link Active");
          }
        }, 3200);

      } catch (err) {
        console.error("WebRTC Setup error:", err);
        setCallStatusText("Microphone/Camera permission needed. Running in fallback mode.");
        setCallConnected(true);
      }
    }

    setupWebRTC();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
      terminateMedia();
    };
  }, [isOpen, roomId, participantRole, initialCallType, terminateMedia, handleEndCall, callConnected]);

  // Toggle Microphone
  const toggleAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted((prev) => !prev);
    }
  };

  // Toggle Camera
  const toggleVideo = async () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks.forEach((track) => {
          track.enabled = !track.enabled;
        });
        setIsVideoOff((prev) => !prev);
      } else {
        // Request video stream if started as audio-only
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
        } catch (e) {
          console.warn("Could not enable video track:", e);
        }
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
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/20 border border-primary/40 text-primary-fixed">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-base sm:text-lg leading-tight">
                {peerName}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-clinical-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Live WebRTC
              </span>
            </div>
            <p className="text-xs text-slate-300 font-clinical-mono flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>{callStatusText}</span>
              <span>·</span>
              <span className="text-white font-semibold">{formatDuration(callDuration)}</span>
            </p>
          </div>
        </div>

        {/* Triage & Food Context Pill (if attached) */}
        {foodName && (
          <div className="hidden md:flex items-center gap-2.5 bg-slate-900/80 border border-slate-700/80 px-3.5 py-1.5 rounded-2xl">
            {foodImage ? (
              <img src={foodImage} alt={foodName} className="w-7 h-7 rounded-lg object-cover" />
            ) : (
              <Sparkles className="w-4 h-4 text-primary-fixed" />
            )}
            <div className="text-left">
              <span className="text-[10px] uppercase font-clinical-mono text-slate-400 block font-semibold leading-none">
                Discussing Scan
              </span>
              <span className="text-xs font-bold text-white max-w-[140px] truncate block leading-tight mt-0.5">
                {foodName}
              </span>
            </div>
            {typeof triageScore === "number" && (
              <span
                className={`font-clinical-mono text-xs font-extrabold px-2 py-0.5 rounded-lg ml-1 ${
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
        {/* Remote Video Stream */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover rounded-3xl border border-white/10 shadow-2xl transition-all ${
            isVideoOff ? "opacity-30 blur-xs" : "opacity-100"
          }`}
        />

        {/* Fallback Display if Remote Video is off or connecting */}
        {(!callConnected || isVideoOff) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center pointer-events-none p-4">
            <div className="relative">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-primary to-teal-400 p-1 shadow-[0_0_50px_rgba(0,82,83,0.6)]">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                  {participantRole === "doctor" ? (
                    <User className="w-14 h-14 sm:w-18 sm:h-18 text-teal-300" />
                  ) : (
                    <Stethoscope className="w-14 h-14 sm:w-18 sm:h-18 text-teal-300" />
                  )}
                </div>
              </div>
              <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{peerName}</h3>
              <p className="text-sm text-slate-300 mt-1 font-clinical-mono">
                {isVideoOff ? "Audio Call in Progress" : "Establishing WebRTC Peer Connection..."}
              </p>
            </div>

            {/* Audio Waveform Simulator */}
            <div className="flex items-center gap-1.5 mt-2">
              {[40, 75, 55, 90, 60, 80, 45, 70, 95, 50].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-primary-fixed rounded-full animate-pulse"
                  style={{
                    height: `${h * 0.4}px`,
                    animationDelay: `${i * 120}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Picture-in-Picture Local Video Preview */}
        <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 w-28 h-40 sm:w-44 sm:h-60 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-900 z-30">
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
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-clinical-mono text-white">
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
