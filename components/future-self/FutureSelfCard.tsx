"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Bot,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Send,
  Loader2,
  AlertCircle,
  Clock,
  UserCheck,
  Upload,
  Camera,
  X,
} from "lucide-react";

interface FutureSelfProps {
  currentFood: {
    name: string;
    brand?: string;
    category?: string;
    ingredients?: any[];
    nutrition?: any;
    allergens?: string[];
    overallStatus?: string;
    clinicalFlags?: any[];
  };
  userProfile?: {
    conditions?: any[];
    allergies?: string[];
    dietaryPreferences?: string[];
    healthGoals?: string[];
    customLimits?: Record<string, any>;
  };
  riskAnalysis?: {
    concerns?: string[];
    severity?: string;
    reasons?: string[];
  };
  context?: string; // "home" | "restaurant" | "buffet" | "tiffin" | "packaged"
  avatarImageUrl?: string;
}

export function FutureSelfCard({
  currentFood,
  userProfile,
  riskAnalysis,
  context = "packaged",
  avatarImageUrl,
}: FutureSelfProps) {
  const [stage, setStage] = useState<"initial" | "loading" | "processing" | "completed" | "error">("initial");
  const [responseText, setResponseText] = useState<string>("");
  const [talkId, setTalkId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customPhotoBase64, setCustomPhotoBase64] = useState<string | null>(null);

  // Video & audio state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Interactive follow-up conversation state
  const [userQuestion, setUserQuestion] = useState<string>("");
  const [conversationHistory, setConversationHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [isSubmittingFollowup, setIsSubmittingFollowup] = useState<boolean>(false);

  const activeAvatarImage =
    customPhotoBase64 ||
    avatarImageUrl ||
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80";

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCustomPhotoBase64(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Initiate Future Self Talk
  const triggerFutureSelfTalk = async (question: string = "") => {
    setStage("loading");
    setErrorMessage(null);
    setVideoUrl(null);
    setTalkId(null);

    const formattedProfile = userProfile || {
      conditions: ["General Wellness"],
      healthGoals: ["Balanced Nutrition"],
    };

    const formattedRisk = riskAnalysis || {
      concerns: currentFood.clinicalFlags?.map((f: any) => f.title) || [],
      severity: currentFood.overallStatus || "analyzed",
    };

    try {
      const res = await fetch("/api/future-self", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile: formattedProfile,
          currentFood,
          riskAnalysis: formattedRisk,
          userQuestion: question || "Before I make this food choice, what should I think about?",
          context,
          conversationHistory,
          userImageBase64: customPhotoBase64 || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok && !data.text) {
        throw new Error(data.error || data.message || "Failed to contact Future Self.");
      }

      setResponseText(data.text || "");

      // Append exchange to history
      if (question) {
        setConversationHistory((prev) => [
          ...prev,
          { role: "user", content: question },
          { role: "assistant", content: data.text || "" },
        ]);
      } else {
        setConversationHistory([{ role: "assistant", content: data.text || "" }]);
      }

      if (data.talkId) {
        setTalkId(data.talkId);
        setStage("processing");
      } else {
        // D-ID talk not initiated, fallback to text response gracefully
        setStage("error");
        setErrorMessage(data.error || "Video avatar generation unavailable. Showing text response.");
      }
    } catch (err: any) {
      console.error("Future Self error:", err);
      setStage("error");
      setErrorMessage(err.message || "Your Future Self is unavailable right now.");
    }
  };

  // Elapsed timer state for video rendering
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);

  // Poll D-ID status when talkId exists and stage is processing
  useEffect(() => {
    if (!talkId || stage !== "processing") return;

    let attempts = 0;
    const maxAttempts = 120; // 120 * 3s = 360s (6 minutes timeout for high-res D-ID rendering)
    const startTime = Date.now();

    // Timer ticker for UI feedback
    const timerInterval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const res = await fetch(`/api/future-self/${talkId}`);
        const data = await res.json();

        if (data.status === "done" && data.videoUrl) {
          setVideoUrl(data.videoUrl);
          setStage("completed");
          clearInterval(interval);
          clearInterval(timerInterval);
        } else if (data.status === "error") {
          setStage("error");
          const errDetail = typeof data.error === "string" 
            ? data.error 
            : data.error?.description || data.error?.message || "D-ID video render returned error.";
          setErrorMessage(errDetail);
          clearInterval(interval);
          clearInterval(timerInterval);
        } else if (attempts >= maxAttempts) {
          setStage("error");
          setErrorMessage("D-ID video generation is taking longer than usual (> 6 mins). Your video may still be rendering on D-ID.");
          clearInterval(interval);
          clearInterval(timerInterval);
        }
      } catch (err) {
        console.error("Polling talk status error:", err);
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(timerInterval);
    };
  }, [talkId, stage]);

  // Check status manually for existing talkId (without spending credits)
  const checkExistingTalkStatus = async () => {
    if (!talkId) return;
    setIsCheckingStatus(true);
    try {
      const res = await fetch(`/api/future-self/${talkId}`);
      const data = await res.json();
      if (data.status === "done" && data.videoUrl) {
        setVideoUrl(data.videoUrl);
        setStage("completed");
        setErrorMessage(null);
      } else if (data.status === "processing" || data.status === "created" || data.status === "started") {
        setStage("processing");
      } else if (data.status === "error") {
        setErrorMessage(data.error || "D-ID video render failed.");
      } else {
        setErrorMessage(`Status: ${data.status}. Video is not ready yet.`);
      }
    } catch (err: any) {
      console.error("Error checking talk status manually:", err);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Handle Video controls
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const restartVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Handle Follow-Up Question Submission
  const handleFollowupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuestion.trim() || isSubmittingFollowup) return;

    const q = userQuestion.trim();
    setUserQuestion("");
    setIsSubmittingFollowup(true);
    await triggerFutureSelfTalk(q);
    setIsSubmittingFollowup(false);
  };

  return (
    <div className="w-full bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-surface-container rounded-2xl border border-primary/20 shadow-lg overflow-hidden transition-all">
      {/* Header Banner */}
      <div className="px-5 py-4 bg-gradient-to-r from-primary/10 via-teal-500/10 to-primary/5 border-b border-primary/15 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shadow-inner">
            <Sparkles className="w-4 h-4 animate-pulse text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider font-clinical-mono">
                FUTURE YOU
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary border border-primary/25">
                5–10 Years Ahead
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Scenario visualization & personal decision support
            </p>
          </div>
        </div>

        {/* Context Chip */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-medium border border-outline-variant/20">
          <Clock className="w-3 h-3 text-primary" />
          <span className="capitalize">{context} context</span>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 flex flex-col gap-4">
        {/* Avatar Photo Selector */}
        {stage === "initial" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between bg-surface-container-high/60 p-2.5 rounded-xl border border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/40 shrink-0 relative">
                  <img src={activeAvatarImage} alt="Avatar portrait" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">Avatar Photo</p>
                  <p className="text-[10px] text-on-surface-variant">
                    {customPhotoBase64 ? "Custom photo uploaded" : "Default Future Self portrait"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 bg-surface-container-lowest hover:bg-surface-container text-on-surface text-[11px] font-semibold rounded-lg border border-outline-variant/30 flex items-center gap-1.5 cursor-pointer transition-colors">
                  <Upload className="w-3 h-3 text-primary" />
                  <span>Upload Photo</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
                {customPhotoBase64 && (
                  <button
                    onClick={() => setCustomPhotoBase64(null)}
                    className="p-1.5 text-on-surface-variant hover:text-error transition-colors"
                    title="Remove custom photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 py-3 px-4 bg-primary/5 rounded-xl border border-primary/15">
              <div className="flex-1 text-center sm:text-left">
                <p className="text-xs font-semibold text-on-surface">
                  “Before you make this food choice, your future self wants to talk to you.”
                </p>
                <p className="text-[11px] text-on-surface-variant mt-1">
                  Reflect on how {currentFood.name || "this meal"} fits into your long-term health goals.
                </p>
              </div>
              <button
                onClick={() => triggerFutureSelfTalk()}
                className="px-5 py-2.5 bg-primary text-on-primary text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-md active:scale-95 shrink-0"
              >
                <UserCheck className="w-4 h-4" />
                <span>Talk to Future Me</span>
              </button>
            </div>
          </div>
        )}

        {/* Avatar Display Frame (for loading, processing, completed, or error states) */}
        {stage !== "initial" && (
          <div className="flex flex-col gap-4">
            {/* Visual Frame */}
            <div className="relative w-full aspect-video max-h-72 rounded-xl overflow-hidden bg-black border border-outline-variant/30 shadow-inner flex flex-col items-center justify-center">
              {/* Completed Video Player */}
              {stage === "completed" && videoUrl ? (
                <>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    autoPlay
                    playsInline
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay Controls */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs">
                    <div className="flex items-center gap-2">
                      <button onClick={togglePlay} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button onClick={restartVideo} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <span className="text-[10px] text-white/80 font-medium">Future Self speaking...</span>
                    </div>
                    <button onClick={toggleMute} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                      {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>
                </>
              ) : (
                /* Avatar Image + Status Overlay */
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <img
                    src={activeAvatarImage}
                    alt="Future Self"
                    className={`w-full h-full object-cover ${stage === "loading" || stage === "processing" ? "opacity-40 filter blur-[1px]" : "opacity-80"}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center justify-center p-4 text-center">
                    {stage === "loading" && (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
                        <p className="text-xs font-bold text-white tracking-wide">
                          Future You is getting ready...
                        </p>
                        <p className="text-[10px] text-white/70">Generating Groq script & uploading avatar photo</p>
                      </div>
                    )}

                    {stage === "processing" && (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full border-2 border-teal-400 border-t-transparent animate-spin flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-teal-300" />
                        </div>
                        <p className="text-xs font-bold text-white tracking-wide animate-pulse">
                          Future You is speaking...
                        </p>
                        <p className="text-[10px] text-white/70">
                          D-ID AI rendering video ({Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s elapsed)
                        </p>
                        <p className="text-[9px] text-teal-300/80 italic">
                          Custom photo avatars typically take 3 to 5 minutes to generate.
                        </p>
                      </div>
                    )}

                    {stage === "error" && (
                      <div className="flex flex-col items-center gap-2 max-w-sm">
                        <AlertCircle className="w-7 h-7 text-amber-400" />
                        <p className="text-xs font-bold text-white">Your Future Self video status</p>
                        <p className="text-[10px] text-white/80">{errorMessage || "Showing text response below."}</p>

                        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                          {talkId && (
                            <button
                              onClick={checkExistingTalkStatus}
                              disabled={isCheckingStatus}
                              className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50"
                            >
                              {isCheckingStatus ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Sparkles className="w-3.5 h-3.5" />
                              )}
                              <span>Check Video Status (0 Credits)</span>
                            </button>
                          )}
                          <button
                            onClick={() => triggerFutureSelfTalk()}
                            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold rounded-lg backdrop-blur flex items-center gap-1.5 transition-all"
                          >
                            <RotateCcw className="w-3 h-3" /> Re-generate Video
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Spoken Text Transcript Box */}
            {responseText && (
              <div className="p-4 bg-surface-container-lowest rounded-xl border border-primary/20 shadow-sm relative">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-primary" />
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider font-clinical-mono">
                    Spoken by Future You (Groq AI)
                  </span>
                </div>
                <blockquote className="text-xs font-medium text-on-surface leading-relaxed italic pl-3 border-l-2 border-primary/40">
                  “{responseText}”
                </blockquote>
              </div>
            )}

            {/* Interactive Follow-Up Chat Form */}
            <form onSubmit={handleFollowupSubmit} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                placeholder="Ask Future You a follow-up (e.g. 'What if I only eat half?')..."
                disabled={stage === "loading" || stage === "processing"}
                className="flex-1 px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!userQuestion.trim() || stage === "loading" || stage === "processing"}
                className="px-4 py-2.5 bg-primary text-on-primary text-xs font-semibold rounded-xl flex items-center gap-1.5 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shrink-0"
              >
                {isSubmittingFollowup ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Ask</span>
                    <Send className="w-3 h-3" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
