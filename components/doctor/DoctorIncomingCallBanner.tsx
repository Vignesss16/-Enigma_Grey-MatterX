"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  PhoneCall,
  Video,
  Phone,
  PhoneOff,
  User,
  Sparkles,
  AlertTriangle,
  Stethoscope,
  Volume2,
  VolumeX,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { WebRTCCallModal } from "@/components/call/WebRTCCallModal";

export interface IncomingCallPayload {
  roomId: string;
  patientName: string;
  patientId: string;
  patientAge?: number;
  patientGender?: string;
  conditions?: string[];
  foodName: string;
  foodImage?: string | null;
  triageScore: number;
  callType: "video" | "audio";
  timestamp: number;
}

export function DoctorIncomingCallBanner() {
  const [incomingCall, setIncomingCall] = useState<IncomingCallPayload | null>(null);
  const [activeCall, setActiveCall] = useState<{
    payload: IncomingCallPayload;
    callType: "video" | "audio";
  } | null>(null);
  const [isRinging, setIsRinging] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ringtoneIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Synthesize soft clinical ringtone using Web Audio API (cross-browser, no audio asset dependency)
  const playRingtoneChime = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "triangle";

      osc1.frequency.setValueAtTime(520, ctx.currentTime); // C5 harmonic
      osc2.frequency.setValueAtTime(660, ctx.currentTime); // E5 harmonic

      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.65);
      osc2.stop(ctx.currentTime + 0.65);
    } catch (_) {}
  }, []);

  const startRingtone = useCallback(() => {
    setIsRinging(true);
    playRingtoneChime();
    if (ringtoneIntervalRef.current) clearInterval(ringtoneIntervalRef.current);
    ringtoneIntervalRef.current = setInterval(playRingtoneChime, 1800);
  }, [playRingtoneChime]);

  const stopRingtone = useCallback(() => {
    setIsRinging(false);
    if (ringtoneIntervalRef.current) {
      clearInterval(ringtoneIntervalRef.current);
      ringtoneIntervalRef.current = null;
    }
  }, []);

  // Listen globally across doctor sessions on the broadcast channel
  useEffect(() => {
    const channel = supabase.channel("cds_global_telehealth");

    channel
      .on("broadcast", { event: "incoming_call" }, ({ payload }) => {
        if (payload && payload.roomId) {
          setIncomingCall(payload as IncomingCallPayload);
          startRingtone();
        }
      })
      .on("broadcast", { event: "cancel_call" }, () => {
        stopRingtone();
        setIncomingCall(null);
      })
      .subscribe();

    return () => {
      stopRingtone();
      supabase.removeChannel(channel);
    };
  }, [startRingtone, stopRingtone]);

  const handleAcceptCall = (type: "video" | "audio") => {
    stopRingtone();
    if (incomingCall) {
      setActiveCall({
        payload: incomingCall,
        callType: type,
      });
      setIncomingCall(null);
    }
  };

  const handleDeclineCall = () => {
    stopRingtone();
    if (incomingCall) {
      try {
        const channel = supabase.channel(`call_room_${incomingCall.roomId}`);
        channel.send({
          type: "broadcast",
          event: "hangup",
          payload: { reason: "declined" },
        });
      } catch (_) {}
    }
    setIncomingCall(null);
  };

  return (
    <>
      {/* High-Impact Incoming Call Ringing Dialog */}
      {incomingCall && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-3xl p-6 shadow-2xl border-2 border-emerald-500/50 flex flex-col items-center text-center gap-5 animate-in zoom-in-95 duration-300">
            {/* Animated Call Ringing Beacon */}
            <div className="relative mt-2">
              <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.5)]">
                <PhoneCall className="w-10 h-10 text-emerald-600 animate-bounce" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500" />
              </span>
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-clinical-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                Incoming Teleconsultation Call
              </span>
              <h2 className="text-2xl font-black text-on-surface tracking-tight mt-1">
                {incomingCall.patientName}
              </h2>
              <p className="text-xs text-on-surface-variant font-clinical-mono mt-0.5">
                {incomingCall.patientId} · Patient is calling now
              </p>
            </div>

            {/* Food Triage Case Context */}
            <div className="w-full p-4 rounded-2xl bg-surface-container-low border border-black/5 flex items-center gap-3.5 text-left">
              {incomingCall.foodImage ? (
                <img
                  src={incomingCall.foodImage}
                  alt={incomingCall.foodName}
                  className="w-14 h-14 rounded-xl object-cover border border-black/10 shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-clinical-mono uppercase font-bold text-on-surface-variant block">
                  Scanned Food Subject
                </span>
                <h4 className="text-sm font-bold text-on-surface truncate">
                  {incomingCall.foodName}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`font-clinical-mono text-xs font-black px-2 py-0.5 rounded-md ${
                      incomingCall.triageScore <= 30
                        ? "bg-emerald-100 text-emerald-800"
                        : incomingCall.triageScore <= 70
                        ? "bg-amber-100 text-amber-900"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    Score: {incomingCall.triageScore} / 100
                  </span>
                </div>
              </div>
            </div>

            {/* Calling Action Buttons */}
            <div className="w-full flex flex-col gap-2.5 pt-1">
              <div className="flex items-center gap-2.5">
                {/* Accept Audio Call */}
                <button
                  onClick={() => handleAcceptCall("audio")}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-xs transition-all shadow-xs active:scale-98"
                >
                  <Phone className="w-4 h-4 text-primary" />
                  <span>Answer Audio</span>
                </button>

                {/* Accept Video Call */}
                <button
                  onClick={() => handleAcceptCall("video")}
                  className="flex-2 flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-98"
                >
                  <Video className="w-4 h-4" />
                  <span>Answer Video Call</span>
                </button>
              </div>

              {/* Decline Call */}
              <button
                onClick={handleDeclineCall}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Decline Call</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active WebRTC Call Modal for Doctor */}
      {activeCall && (
        <WebRTCCallModal
          isOpen={true}
          onClose={() => setActiveCall(null)}
          roomId={activeCall.payload.roomId}
          participantRole="doctor"
          participantName="Dr. Sarah Jenkins, MD"
          peerName={activeCall.payload.patientName}
          foodName={activeCall.payload.foodName}
          foodImage={activeCall.payload.foodImage}
          triageScore={activeCall.payload.triageScore}
          initialCallType={activeCall.callType}
        />
      )}
    </>
  );
}
