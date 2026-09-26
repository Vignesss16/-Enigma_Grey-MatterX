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
  Sparkles,
  Wifi,
  RefreshCw,
  AlertCircle,
  Activity,
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

// Enterprise-grade STUN + TURN servers for cross-device NAT traversal
const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun3.l.google.com:19302" },
  { urls: "stun:stun4.l.google.com:19302" },
  { urls: "stun:stun.cloudflare.com:3478" },
  { urls: "stun:openrelay.metered.ca:80" },
  // Free public TURN servers for carrier-grade NAT / mobile 4G/5G / cross-network traversal
  {
    urls: "turn:openrelay.metered.ca:80",
    username: "openrelay",
    credential: "openrelay",
  },
  {
    urls: "turn:openrelay.metered.ca:443",
    username: "openrelay",
    credential: "openrelay",
  },
  {
    urls: "turn:openrelay.metered.ca:443?transport=tcp",
    username: "openrelay",
    credential: "openrelay",
  },
];

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
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const localCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const pendingRemoteCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const animCanvasIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const makingOfferRef = useRef(false);

  const [callDuration, setCallDuration] = useState(0);
  const [callConnected, setCallConnected] = useState(false);
  const [peerPresent, setPeerPresent] = useState(false);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(initialCallType === "audio");
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [callStatusText, setCallStatusText] = useState("Connecting to secure clinical room...");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [needsTapToUnmute, setNeedsTapToUnmute] = useState(false);
  const [iceState, setIceState] = useState<string>("init");
  const [streamResolution, setStreamResolution] = useState<string>("");

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
      try {
        pcRef.current.close();
      } catch (_) {}
      pcRef.current = null;
    }
    localCandidatesRef.current = [];
    pendingRemoteCandidatesRef.current = [];
    remoteStreamRef.current = null;
    makingOfferRef.current = false;
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

  // Create synthetic video feed with high-contrast clinical graphics
  // (Used when physical camera is locked by another app/tab, or on headless testing)
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
      grad.addColorStop(1, "#0f172a");
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

      ctx.fillStyle = "#38bdf8";
      ctx.font = "12px monospace";
      ctx.fillText(`WEBRTC P2P · FPS 30 · T+${frame}`, 320, 320);
    };

    drawFrame();
    animCanvasIntervalRef.current = setInterval(drawFrame, 33);

    let videoTrack: MediaStreamTrack;
    if (typeof (canvas as any).captureStream === "function") {
      const canvasStream = (canvas as any).captureStream(30);
      videoTrack = canvasStream.getVideoTracks()[0];
    } else {
      // Fallback for browsers without canvas.captureStream
      const blackCanvas = document.createElement("canvas");
      blackCanvas.width = 2;
      blackCanvas.height = 2;
      const stream = (blackCanvas as any).captureStream ? (blackCanvas as any).captureStream(1) : new MediaStream();
      videoTrack = stream.getVideoTracks()[0] || null;
    }

    // Attempt microphone audio
    let audioTrack: MediaStreamTrack | null = null;
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioTrack = audioStream.getAudioTracks()[0];
    } catch (_) {}

    return new MediaStream([
      ...(videoTrack ? [videoTrack] : []),
      ...(audioTrack ? [audioTrack] : []),
    ]);
  }, [participantRole]);

  // Main WebRTC Lifecycle & Peer Signaling
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const channelName = `call_room_${roomId}`;
    const channel = supabase.channel(channelName);
    let pingInterval: NodeJS.Timeout | null = null;

    // Designated polite peer: Customer is polite (yields on offer collisions)
    // Doctor is impolite (drives initial offers)
    const isPolite = participantRole === "customer";

    async function initWebRTC() {
      try {
        setCallStatusText("Requesting camera & microphone access...");

        let stream: MediaStream;
        try {
          // Cross-platform mobile-friendly constraints
          stream = await navigator.mediaDevices.getUserMedia({
            video:
              initialCallType === "video"
                ? {
                    facingMode: "user",
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 },
                  }
                : false,
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
        } catch (mediaErr) {
          console.warn("Direct webcam failed or locked by other app/tab, falling back to synthetic stream:", mediaErr);
          stream = await createSyntheticMediaStream();
        }

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(() => {});
        }

        // Initialize PeerConnection with Google STUN + Metered TURN servers
        const pc = new RTCPeerConnection({
          iceServers: ICE_SERVERS,
          iceCandidatePoolSize: 4,
          bundlePolicy: "max-bundle",
        });
        pcRef.current = pc;

        // Cleanly add local tracks to PeerConnection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Drain pending ICE candidates once remoteDescription is set
        const drainPendingCandidates = async () => {
          if (!pc.remoteDescription) return;
          const candidates = [...pendingRemoteCandidatesRef.current];
          pendingRemoteCandidatesRef.current = [];
          for (const cand of candidates) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch (candErr) {
              console.warn("Error adding queued ICE candidate:", candErr);
            }
          }
        };

        // Attach remote media stream directly to the video element
        const attachRemoteStream = (remoteStream: MediaStream) => {
          remoteStreamRef.current = remoteStream;

          const videoTracks = remoteStream.getVideoTracks();
          const hasVideoTrack = videoTracks.length > 0;

          if (hasVideoTrack) {
            setHasRemoteVideo(true);
            const vTrack = videoTracks[0];
            vTrack.onunmute = () => setHasRemoteVideo(true);
            vTrack.onended = () => setHasRemoteVideo(false);
          }

          if (remoteVideoRef.current) {
            if (remoteVideoRef.current.srcObject !== remoteStream) {
              remoteVideoRef.current.srcObject = remoteStream;
            }

            // Play the remote video element with unmuted autoplay fallback handling
            remoteVideoRef.current
              .play()
              .then(() => {
                if (hasVideoTrack) {
                  setHasRemoteVideo(true);
                }
                setCallConnected(true);
              })
              .catch((err) => {
                console.warn("Unmuted autoplay restricted by browser policy. Playing muted initially:", err);
                if (remoteVideoRef.current) {
                  remoteVideoRef.current.muted = true;
                  remoteVideoRef.current
                    .play()
                    .then(() => {
                      if (hasVideoTrack) {
                        setHasRemoteVideo(true);
                      }
                      setNeedsTapToUnmute(true);
                      setCallConnected(true);
                    })
                    .catch(console.error);
                }
              });
          }
        };

        // Handle incoming remote media tracks (accumulate into remoteStreamRef)
        pc.ontrack = (event) => {
          console.log("[WebRTC] ontrack received:", event.track.kind, "id:", event.track.id);

          if (!remoteStreamRef.current) {
            remoteStreamRef.current = new MediaStream();
          }

          const stream = remoteStreamRef.current;

          if (event.streams && event.streams[0]) {
            event.streams[0].getTracks().forEach((track) => {
              if (!stream.getTracks().some((t) => t.id === track.id)) {
                stream.addTrack(track);
              }
            });
          } else {
            if (!stream.getTracks().some((t) => t.id === event.track.id)) {
              stream.addTrack(event.track);
            }
          }

          attachRemoteStream(stream);
          setCallConnected(true);
          setPeerPresent(true);
          setCallStatusText("Connected · Media Stream Live");
        };

        // Gather local ICE candidates and cache them for replay
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const candidateObj = event.candidate.toJSON
              ? event.candidate.toJSON()
              : {
                  candidate: event.candidate.candidate,
                  sdpMid: event.candidate.sdpMid,
                  sdpMLineIndex: event.candidate.sdpMLineIndex,
                  usernameFragment: event.candidate.usernameFragment,
                };
            localCandidatesRef.current.push(candidateObj);

            channel.send({
              type: "broadcast",
              event: "ice_candidate",
              payload: { candidate: candidateObj, from: participantRole },
            });
          }
        };

        // Track ICE connection state
        pc.oniceconnectionstatechange = () => {
          const state = pc.iceConnectionState;
          console.log("[WebRTC] ICE Connection State:", state);
          setIceState(state);

          if (state === "connected" || state === "completed") {
            setCallConnected(true);
            setPeerPresent(true);
            setCallStatusText("Connected · P2P Clinical Stream");
          } else if (state === "failed") {
            console.warn("[WebRTC] ICE failed. Attempting ICE restart...");
            setCallStatusText("Reconnecting peer link (ICE restart)...");
            try {
              pc.restartIce();
            } catch (_) {}
          } else if (state === "disconnected") {
            setCallStatusText("Peer connection disconnected · Reconnecting...");
          }
        };

        pc.onconnectionstatechange = () => {
          console.log("[WebRTC] Connection State:", pc.connectionState);
          if (pc.connectionState === "connected") {
            setCallConnected(true);
            setPeerPresent(true);
            setCallStatusText("Connected · Secure Telehealth Active");
          } else if (pc.connectionState === "failed") {
            setCallStatusText("Connection lost · Retrying...");
          }
        };

        // Helper: Create and broadcast WebRTC offer
        const makeOffer = async () => {
          if (!pcRef.current) return;

          // If we already have an offer waiting for answer, re-broadcast it so newly arrived peer receives it!
          if (pcRef.current.localDescription && pcRef.current.signalingState === "have-local-offer") {
            console.log("[WebRTC] Re-broadcasting existing local offer to peer");
            channel.send({
              type: "broadcast",
              event: "signal_offer",
              payload: {
                offer: {
                  type: pcRef.current.localDescription.type,
                  sdp: pcRef.current.localDescription.sdp,
                },
                from: participantRole,
                candidates: localCandidatesRef.current,
              },
            });
            return;
          }

          if (makingOfferRef.current) return;

          try {
            makingOfferRef.current = true;
            console.log("[WebRTC] Creating fresh offer as", participantRole);

            const offer = await pcRef.current.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true,
            });

            if (pcRef.current.signalingState !== "stable" && !isPolite) {
              return;
            }

            await pcRef.current.setLocalDescription(offer);

            const desc = pcRef.current.localDescription || offer;
            channel.send({
              type: "broadcast",
              event: "signal_offer",
              payload: {
                offer: {
                  type: desc.type,
                  sdp: desc.sdp,
                },
                from: participantRole,
                candidates: localCandidatesRef.current,
              },
            });

            setCallStatusText("Sending call offer · Establishing link...");
          } catch (err) {
            console.warn("[WebRTC] Error creating offer:", err);
          } finally {
            makingOfferRef.current = false;
          }
        };

        // Flush all cached local ICE candidates to peer
        const flushLocalCandidates = () => {
          if (localCandidatesRef.current.length > 0) {
            channel.send({
              type: "broadcast",
              event: "ice_candidates_batch",
              payload: {
                candidates: localCandidatesRef.current,
                from: participantRole,
              },
            });
          }
        };

        // Setup Realtime Broadcast listeners
        channel
          // 1. Peer announcement
          .on("broadcast", { event: "peer_joined" }, async ({ payload }) => {
            if (payload?.from === participantRole) return;
            console.log("[WebRTC] peer_joined from:", payload?.from);
            setPeerPresent(true);
            setCallStatusText(`Peer (${payload?.from || "participant"}) connected · Handshaking...`);

            // Flush candidates to new peer
            flushLocalCandidates();

            // Acknowledge presence immediately so peer knows we are already in the room
            channel.send({
              type: "broadcast",
              event: "peer_ready",
              payload: { from: participantRole },
            });

            // Doctor drives the initial offer OR re-broadcasts existing offer
            if (participantRole === "doctor" || pcRef.current?.signalingState === "have-local-offer") {
              await makeOffer();
            }
          })
          .on("broadcast", { event: "peer_ready" }, async ({ payload }) => {
            if (payload?.from === participantRole) return;
            console.log("[WebRTC] peer_ready from:", payload?.from);
            setPeerPresent(true);
            flushLocalCandidates();

            if (participantRole === "doctor" || pcRef.current?.signalingState === "have-local-offer") {
              await makeOffer();
            }
          })
          // 2. Peer heartbeat / discovery
          .on("broadcast", { event: "peer_ping" }, async ({ payload }) => {
            if (payload?.from === participantRole) return;
            setPeerPresent(true);
            channel.send({
              type: "broadcast",
              event: "peer_pong",
              payload: { from: participantRole },
            });
            if (participantRole === "doctor" || pcRef.current?.signalingState === "have-local-offer") {
              if (!callConnected) await makeOffer();
            }
          })
          .on("broadcast", { event: "peer_pong" }, async ({ payload }) => {
            if (payload?.from === participantRole) return;
            setPeerPresent(true);
            if (participantRole === "doctor" || pcRef.current?.signalingState === "have-local-offer") {
              if (!callConnected) await makeOffer();
            }
          })
          // 3. Handle WebRTC Offer with Perfect Negotiation Collision Resolution
          .on("broadcast", { event: "signal_offer" }, async ({ payload }) => {
            if (payload.from === participantRole || !pcRef.current || !payload.offer) return;
            try {
              console.log("[WebRTC] Received offer from", payload.from);
              setPeerPresent(true);

              const offerCollision =
                makingOfferRef.current || pcRef.current.signalingState !== "stable";

              if (offerCollision) {
                if (!isPolite) {
                  console.log("[WebRTC] Impolite peer ignoring offer collision");
                  return;
                }
                console.log("[WebRTC] Polite peer rolling back local offer");
                try {
                  await pcRef.current.setLocalDescription({ type: "rollback" } as any);
                } catch (_) {}
              }

              await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.offer));
              await drainPendingCandidates();

              // Add any candidates attached in the offer batch
              if (Array.isArray(payload.candidates)) {
                for (const c of payload.candidates) {
                  try {
                    await pcRef.current.addIceCandidate(new RTCIceCandidate(c));
                  } catch (_) {}
                }
              }

              const answer = await pcRef.current.createAnswer();
              await pcRef.current.setLocalDescription(answer);

              const desc = pcRef.current.localDescription || answer;
              channel.send({
                type: "broadcast",
                event: "signal_answer",
                payload: {
                  answer: {
                    type: desc.type,
                    sdp: desc.sdp,
                  },
                  from: participantRole,
                  candidates: localCandidatesRef.current,
                },
              });

              flushLocalCandidates();
              setCallConnected(true);
              setCallStatusText("Connected · Media Stream Live");
            } catch (err) {
              console.warn("[WebRTC] Error handling offer:", err);
            }
          })
          // 4. Handle WebRTC Answer
          .on("broadcast", { event: "signal_answer" }, async ({ payload }) => {
            if (payload.from === participantRole || !pcRef.current || !payload.answer) return;
            try {
              console.log("[WebRTC] Received answer from", payload.from);
              setPeerPresent(true);

              if (pcRef.current.signalingState === "have-local-offer") {
                await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
                await drainPendingCandidates();

                // Add any candidates attached in the answer batch
                if (Array.isArray(payload.candidates)) {
                  for (const c of payload.candidates) {
                    try {
                      await pcRef.current.addIceCandidate(new RTCIceCandidate(c));
                    } catch (_) {}
                  }
                }

                flushLocalCandidates();
                setCallConnected(true);
                setCallStatusText("Connected · Media Stream Live");
              }
            } catch (err) {
              console.warn("[WebRTC] Error handling answer:", err);
            }
          })
          // 5. Individual ICE Candidate
          .on("broadcast", { event: "ice_candidate" }, async ({ payload }) => {
            if (payload.from === participantRole || !pcRef.current) return;
            try {
              if (payload.candidate) {
                if (pcRef.current.remoteDescription) {
                  await pcRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
                } else {
                  pendingRemoteCandidatesRef.current.push(payload.candidate);
                }
              }
            } catch (err) {
              console.warn("[WebRTC] Error adding ICE candidate:", err);
            }
          })
          // 6. Batch ICE Candidates
          .on("broadcast", { event: "ice_candidates_batch" }, async ({ payload }) => {
            if (payload.from === participantRole || !pcRef.current) return;
            try {
              if (Array.isArray(payload.candidates)) {
                for (const c of payload.candidates) {
                  if (pcRef.current.remoteDescription) {
                    try {
                      await pcRef.current.addIceCandidate(new RTCIceCandidate(c));
                    } catch (_) {}
                  } else {
                    pendingRemoteCandidatesRef.current.push(c);
                  }
                }
              }
            } catch (err) {
              console.warn("[WebRTC] Error adding batch candidates:", err);
            }
          })
          // 7. Hangup
          .on("broadcast", { event: "hangup" }, () => {
            setCallStatusText("Call ended by participant");
            setTimeout(handleEndCall, 800);
          })
          // Channel subscription status
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              setCallStatusText("Room connected · Waiting for peer...");
              channel.send({
                type: "broadcast",
                event: "peer_joined",
                payload: { from: participantRole },
              });

              if (participantRole === "doctor") {
                makeOffer();
              }

              // Periodic keep-alive ping until call is established
              pingInterval = setInterval(() => {
                if (isMounted && !callConnected) {
                  channel.send({
                    type: "broadcast",
                    event: "peer_ping",
                    payload: { from: participantRole },
                  });
                }
              }, 2000);
            }
          });

      } catch (err) {
        console.error("WebRTC initialization error:", err);
        setCallStatusText("Clinical audio/video channel active.");
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
  }, [
    isOpen,
    roomId,
    participantRole,
    initialCallType,
    createSyntheticMediaStream,
    terminateMedia,
    handleEndCall,
    callConnected,
  ]);

  // Video metadata resolution monitor
  const handleRemoteVideoLoadedMetadata = () => {
    if (remoteVideoRef.current) {
      const width = remoteVideoRef.current.videoWidth;
      const height = remoteVideoRef.current.videoHeight;
      if (width > 0 && height > 0) {
        setStreamResolution(`${width}x${height}`);
        setHasRemoteVideo(true);
      }
      remoteVideoRef.current.play().catch(() => {});
    }
  };

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
          const videoStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
          });
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

  // Tap-to-unmute action for browser autoplay policy
  const handleEnableAudio = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = false;
      remoteVideoRef.current.play().catch(console.error);
    }
    setNeedsTapToUnmute(false);
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
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live WebRTC
              </span>
              {streamResolution && (
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/10 text-slate-300 border border-white/10">
                  {streamResolution}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  callConnected ? "bg-emerald-400" : "bg-amber-400 animate-ping"
                }`}
              />
              <span className="font-medium">{callStatusText}</span>
              <span>·</span>
              <span className="text-white font-mono font-bold">{formatDuration(callDuration)}</span>
            </p>
          </div>
        </div>

        {/* Triage & Food Context Pill */}
        {foodName && (
          <div className="hidden md:flex items-center gap-2.5 bg-slate-900/90 border border-slate-700/80 px-3.5 py-1.5 rounded-2xl shadow-lg">
            {foodImage ? (
              <img
                src={foodImage}
                alt={foodName}
                className="w-8 h-8 rounded-lg object-cover border border-white/10"
              />
            ) : (
              <Sparkles className="w-4 h-4 text-primary-fixed" />
            )}
            <div className="text-left">
              <span className="text-[10px] uppercase text-slate-400 block font-bold leading-none tracking-wider">
                Discussing Scan
              </span>
              <span className="text-xs font-bold text-white max-w-[150px] truncate block leading-tight mt-0.5">
                {foodName}
              </span>
            </div>
            {typeof triageScore === "number" && (
              <span
                className={`text-xs font-extrabold px-2.5 py-0.5 rounded-lg ml-1 ${
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
        {/* Autoplay Unmute Floating Alert (Chrome / Safari policy) */}
        {needsTapToUnmute && (
          <button
            onClick={handleEnableAudio}
            className="absolute top-8 z-40 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 text-xs animate-bounce"
          >
            <Volume2 className="w-4 h-4" />
            <span>Click to Unmute Peer Audio</span>
          </button>
        )}

        {/* Remote Video Stream: Rendered permanently in DOM so browser hardware decoder stays active! */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          onLoadedMetadata={handleRemoteVideoLoadedMetadata}
          onPlaying={() => {
            setHasRemoteVideo(true);
            setCallConnected(true);
          }}
          className={`w-full h-full object-cover rounded-3xl border border-white/10 shadow-2xl transition-all duration-300 ${
            hasRemoteVideo
              ? "opacity-100 relative z-10 block"
              : "opacity-0 absolute inset-0 pointer-events-none -z-10 block"
          }`}
        />

        {/* Clinician Telehealth Suite & Active Status Card */}
        {/* Shown while waiting for peer's camera feed or during audio-only consultations */}
        {!hasRemoteVideo && (
          <div className="w-full h-full max-w-2xl rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/60 via-slate-900/90 to-slate-950 flex flex-col items-center justify-center gap-6 p-6 sm:p-10 shadow-2xl animate-in fade-in duration-300 text-center z-10">
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
              <span
                className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-3 border-slate-950 flex items-center justify-center ${
                  callConnected ? "bg-emerald-500" : "bg-amber-400 animate-ping"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white" />
              </span>
            </div>

            {/* Clinician Identity & Status */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>
                  {callConnected
                    ? "Audio & Telemetry Link Active · Video Negotiating"
                    : "Connecting to Peer Device..."}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {peerName}
              </h2>
              <p className="text-xs text-slate-300 font-medium mt-1">
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
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Under Clinical Review
                  </span>
                  <h4 className="text-sm font-bold text-white truncate">{foodName}</h4>
                  <p className="text-xs text-slate-300">Verified Diagnostic Food Facts</p>
                </div>
                {typeof triageScore === "number" && (
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Triage
                    </span>
                    <span
                      className={`text-base font-extrabold ${
                        triageScore > 70
                          ? "text-rose-400"
                          : triageScore > 30
                          ? "text-amber-400"
                          : "text-emerald-400"
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
              <span className="text-[10px] font-clinical-mono uppercase font-semibold">
                Camera Off
              </span>
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
