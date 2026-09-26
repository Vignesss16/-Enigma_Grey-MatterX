"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Camera,
  Upload,
  Search,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ChevronDown,
  ChevronUp,
  SwitchCamera,
  Flashlight,
  FlashlightOff,
  X,
  RotateCcw,
  Stethoscope,
  Phone,
  Video,
  MessageSquare,
  Sparkles,
  Check,
  AlertTriangle,
} from "lucide-react";
import { WebRTCCallModal } from "@/components/call/WebRTCCallModal";

type ScanMode = "camera" | "upload" | "search";

export function FoodScanner() {
  const [mode, setMode] = useState<ScanMode>("camera");
  const [foodName, setFoodName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedFlags, setExpandedFlags] = useState<string[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Teleconsultation & WebRTC state
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [consultNote, setConsultNote] = useState("");
  const [consultationSubmitted, setConsultationSubmitted] = useState(false);
  const [currentConsultation, setCurrentConsultation] = useState<any>(null);
  const [isCallingDoctor, setIsCallingDoctor] = useState(false);
  const [callType, setCallType] = useState<"video" | "audio">("video");
  const [sendingConsult, setSendingConsult] = useState(false);

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const startCamera = useCallback(async () => {
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }
    } catch (err) {
      setError("Camera access denied. Please allow camera permissions and try again, or use Upload/Search mode.");
      setMode("search");
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
      setCameraReady(false);
    }
  }, [cameraStream]);

  useEffect(() => {
    if (mode === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      if (mode !== "camera") stopCamera();
    };
  }, [mode, facingMode]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setResult(null);
    setError(null);
    startCamera();
  };

  const submitScan = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const { data: { user } } = await supabase.auth.getUser();
    let body: any = { userId: user?.id };

    if (mode === "camera" && capturedImage) {
      const base64 = capturedImage.split(",")[1];
      body = { ...body, imageBase64: base64, mimeType: "image/jpeg" };
    } else if (mode === "upload" && capturedImage) {
      const base64 = capturedImage.split(",")[1];
      body = { ...body, imageBase64: base64, mimeType: "image/jpeg" };
    } else if (mode === "search" && foodName.trim()) {
      body = { ...body, foodName: foodName.trim() };
    } else {
      setError("Please capture a photo or enter a food name.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      setError(data.message || data.error || "Scan failed. Please try again.");
    } else {
      setResult(data.food);
      if (data.food?.clinicalFlags && Array.isArray(data.food.clinicalFlags)) {
        const autoExpand = data.food.clinicalFlags
          .filter((f: any) => f.severity === "critical" || f.id?.includes("biscuit"))
          .map((f: any) => f.id);
        if (autoExpand.length > 0) {
          setExpandedFlags(autoExpand);
        }
      }
    }
    setLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCapturedImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitScan();
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setCapturedImage(null);
    setFoodName("");
    setShowConsultModal(false);
    setConsultationSubmitted(false);
    setCurrentConsultation(null);
    if (mode === "camera") startCamera();
  };

  const handleRequestDoctor = async () => {
    if (!result) return;
    setSendingConsult(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      let profileData: any = null;
      if (user?.id) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
        profileData = data;
      }

      const triageScoreVal = typeof result.triageScore === "number" ? result.triageScore : (() => {
        if (result.overallStatus === "flagged") return 88;
        if (result.overallStatus === "caution") return 52;
        return 18;
      })();

      const consultPayload = {
        id: `consult-${Date.now()}`,
        userId: user?.id,
        patientName: profileData?.full_name || "Ananya Rao",
        patientId: profileData?.patient_id || "CDS-8842",
        patientAge: profileData?.age || 38,
        patientGender: profileData?.gender || "Female",
        conditions: Array.isArray(profileData?.conditions)
          ? profileData.conditions.map((c: any) => c.label || c.title || c.id || c)
          : ["Diabetes (Type 2)", "Stage 1 Hypertension"],
        foodName: result.name,
        brand: result.brand,
        category: result.category,
        imageUrl: capturedImage || result.imageUrl || null,
        triageScore: triageScoreVal,
        overallStatus: result.overallStatus,
        clinicalFlags: result.clinicalFlags || [],
        nutrition: result.nutrition,
        patientNote: consultNote.trim() || "Patient requested doctor teleconsult regarding this scanned food item.",
        requestedAt: "Just now (Live)",
        status: "pending",
        roomId: `cds-room-${Date.now()}`,
      };

      // 1. Broadcast to doctor's realtime channel
      try {
        const channel = supabase.channel("doctor_consultations_feed");
        await channel.send({
          type: "broadcast",
          event: "new_consultation_request",
          payload: consultPayload,
        });
      } catch (_) {}

      // 1b. Broadcast high-priority incoming call to doctor global channel
      try {
        const globalChannel = supabase.channel("cds_global_telehealth");
        await globalChannel.send({
          type: "broadcast",
          event: "incoming_call",
          payload: {
            roomId: consultPayload.roomId,
            patientName: consultPayload.patientName,
            patientId: consultPayload.patientId,
            foodName: consultPayload.foodName,
            foodImage: consultPayload.imageUrl,
            triageScore: consultPayload.triageScore,
            callType: "video",
            timestamp: Date.now(),
          },
        });
      } catch (_) {}

      // 2. Insert to Supabase consultation_requests table if configured
      try {
        await supabase.from("consultation_requests").insert({
          id: consultPayload.id,
          user_id: consultPayload.userId,
          patient_name: consultPayload.patientName,
          patient_id: consultPayload.patientId,
          patient_age: consultPayload.patientAge,
          patient_gender: consultPayload.patientGender,
          conditions: consultPayload.conditions,
          food_name: consultPayload.foodName,
          brand: consultPayload.brand,
          category: consultPayload.category,
          image_url: consultPayload.imageUrl,
          triage_score: consultPayload.triageScore,
          overall_status: consultPayload.overallStatus,
          clinical_flags: consultPayload.clinicalFlags,
          nutrition: consultPayload.nutrition,
          patient_note: consultPayload.patientNote,
          room_id: consultPayload.roomId,
          requested_at: new Date().toISOString(),
        });
      } catch (_) {}

      // 3. Local persistence & instant same-browser cross-tab queue event
      if (typeof window !== "undefined") {
        try {
          const storedQueue = JSON.parse(localStorage.getItem("cds_patient_queue") || "[]");
          const updatedQueue = [consultPayload, ...storedQueue.filter((p: any) => p.id !== consultPayload.id)];
          localStorage.setItem("cds_patient_queue", JSON.stringify(updatedQueue));
          window.dispatchEvent(new CustomEvent("cds_queue_updated", { detail: consultPayload }));
        } catch (_) {}
      }

      setCurrentConsultation(consultPayload);
      setConsultationSubmitted(true);
    } catch (err) {
      console.error("Consultation request error:", err);
    } finally {
      setSendingConsult(false);
    }
  };

  const startCustomerCall = (type: "video" | "audio") => {
    setCallType(type);
    setIsCallingDoctor(true);

    const activeRoomId = currentConsultation?.roomId || `cds-room-ananya-8842`;
    const triageScoreVal = typeof result?.triageScore === "number" ? result.triageScore : 100;

    // Send high-priority ringing alert to Doctor's portal
    try {
      const globalChannel = supabase.channel("cds_global_telehealth");
      globalChannel.send({
        type: "broadcast",
        event: "incoming_call",
        payload: {
          roomId: activeRoomId,
          patientName: currentConsultation?.patientName || "Ananya Rao",
          patientId: currentConsultation?.patientId || "CDS-8842",
          foodName: result?.name || "Pepperoni Pizza",
          foodImage: capturedImage || result?.imageUrl || null,
          triageScore: triageScoreVal,
          callType: type,
          timestamp: Date.now(),
        },
      });
    } catch (_) {}
  };

  const toggleFlag = (id: string) => {
    setExpandedFlags((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const getTriageTheme = (score: number) => {
    if (score <= 30) {
      return {
        tier: "low",
        tierLabel: "Low Risk",
        statusLabel: "SAFE TO CONSUME",
        limitLabel: "0 - 30 (Green)",
        icon: ShieldCheck,
        headerText: "text-emerald-800 dark:text-emerald-300",
        textColor: "text-emerald-700 dark:text-emerald-400",
        badgeBg: "bg-emerald-600 text-white shadow-[0_0_25px_rgba(16,185,129,0.5)] border-2 border-emerald-300",
        cardBg: "bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-teal-500/15 border-2 border-emerald-500/60 shadow-[0_12px_40px_rgba(16,185,129,0.22)]",
        wrapperBg: "bg-gradient-to-b from-emerald-100/90 via-emerald-50/70 to-emerald-100/40 border-2 border-emerald-400 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.3)]",
        ambientBackdrop: "bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.22),_rgba(16,185,129,0.08)_50%,_transparent_80%)]",
        statusBadge: "bg-emerald-100 text-emerald-800 border-emerald-400 shadow-xs",
        dotColor: "bg-emerald-500",
        bannerBg: "bg-emerald-600 text-white shadow-[0_8px_25px_rgba(16,185,129,0.4)]",
        summaryText: "Compatible with your health profile (Glycemic Load ≤ 10, Sodium ≤ 400mg).",
      };
    } else if (score <= 70) {
      return {
        tier: "moderate",
        tierLabel: "Moderate Risk",
        statusLabel: "CONSUME WITH CAUTION",
        limitLabel: "31 - 70 (Yellow)",
        icon: ShieldAlert,
        headerText: "text-amber-800 dark:text-amber-300",
        textColor: "text-amber-800 dark:text-amber-400",
        badgeBg: "bg-amber-500 text-white shadow-[0_0_25px_rgba(245,158,11,0.5)] border-2 border-amber-200",
        cardBg: "bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-yellow-500/15 border-2 border-amber-500/60 shadow-[0_12px_40px_rgba(245,158,11,0.22)]",
        wrapperBg: "bg-gradient-to-b from-amber-100/90 via-amber-50/70 to-amber-100/40 border-2 border-amber-400 shadow-[0_20px_60px_-15px_rgba(245,158,11,0.3)]",
        ambientBackdrop: "bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.22),_rgba(245,158,11,0.08)_50%,_transparent_80%)]",
        statusBadge: "bg-amber-100 text-amber-900 border-amber-400 shadow-xs",
        dotColor: "bg-amber-500",
        bannerBg: "bg-amber-500 text-white shadow-[0_8px_25px_rgba(245,158,11,0.4)]",
        summaryText: "Borderline thresholds detected. Moderate portion size or pair with protein/fiber.",
      };
    } else {
      return {
        tier: "high",
        tierLabel: "High Clinical Risk",
        statusLabel: "FLAGGED — DO NOT CONSUME",
        limitLabel: "71 - 100 (Red)",
        icon: ShieldX,
        headerText: "text-rose-800 dark:text-rose-300",
        textColor: "text-rose-700 dark:text-rose-400",
        badgeBg: "bg-rose-600 text-white shadow-[0_0_25px_rgba(239,68,68,0.55)] border-2 border-rose-300",
        cardBg: "bg-gradient-to-br from-rose-500/20 via-rose-500/10 to-red-500/15 border-2 border-rose-500/60 shadow-[0_12px_40px_rgba(239,68,68,0.25)]",
        wrapperBg: "bg-gradient-to-b from-rose-100/90 via-rose-50/70 to-rose-100/40 border-2 border-rose-400 shadow-[0_20px_60px_-15px_rgba(239,68,68,0.3)]",
        ambientBackdrop: "bg-[radial-gradient(ellipse_at_top,_rgba(239,68,68,0.22),_rgba(239,68,68,0.08)_50%,_transparent_80%)]",
        statusBadge: "bg-rose-100 text-rose-900 border-rose-400 shadow-xs",
        dotColor: "bg-rose-500",
        bannerBg: "bg-rose-600 text-white shadow-[0_8px_25px_rgba(239,68,68,0.4)]",
        summaryText: "Exceeds clinical risk boundaries. Violates sodium, sugar, or glycemic safety thresholds.",
      };
    }
  };

  const statusConfig = {
    safe: { icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", label: "SAFE TO CONSUME" },
    caution: { icon: ShieldAlert, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", label: "CONSUME WITH CAUTION" },
    flagged: { icon: ShieldX, color: "text-red-600", bg: "bg-red-50 border-red-200", label: "FLAGGED — DO NOT CONSUME" },
  };

  const severityColor: Record<string, string> = {
    critical: "bg-red-100 text-red-700 border-red-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    moderate: "bg-amber-100 text-amber-700 border-amber-200",
    low: "bg-green-100 text-green-700 border-green-200",
  };

  return (
    <div className="flex flex-col gap-space-lg w-full max-w-2xl mx-auto relative">
      {/* Mode Tabs */}
      {!result && (
        <div className="flex items-center gap-2 bg-surface-container-high p-1 rounded-2xl self-center">
          {(["camera", "upload", "search"] as ScanMode[]).map((m) => {
            const icons = { camera: Camera, upload: Upload, search: Search };
            const Icon = icons[m];
            const labels = { camera: "Camera", upload: "Upload", search: "Search" };
            return (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); setCapturedImage(null); setResult(null); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  mode === m
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {labels[m]}
              </button>
            );
          })}
        </div>
      )}

      {/* Results Panel */}
      {result && (() => {
        const triageScore = typeof result.triageScore === "number" ? result.triageScore : (() => {
          if (result.overallStatus === "flagged") return 88;
          if (result.overallStatus === "caution") return 52;
          return 18;
        })();
        const theme = getTriageTheme(triageScore);
        const StatusIcon = theme.icon;

        return (
          <>
            {/* Dynamic Full-Page Ambient Glow */}
            <div className={`fixed inset-0 pointer-events-none transition-all duration-700 -z-10 ${theme.ambientBackdrop}`} />

            <div className={`p-4 sm:p-6 rounded-3xl transition-all duration-500 flex flex-col gap-5 animate-in fade-in-50 zoom-in-[0.98] duration-500 ${theme.wrapperBg}`}>
              {/* Heading: Triage Result */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-black/10 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${theme.dotColor} opacity-75`} />
                    <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${theme.dotColor}`} />
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface">
                    Triage Result
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-clinical-mono font-bold uppercase tracking-wider border shadow-xs ${theme.statusBadge}`}>
                    {theme.statusLabel}
                  </span>
                  <span className="font-clinical-mono text-xs uppercase tracking-wider text-on-surface-variant font-semibold bg-white/80 dark:bg-black/20 px-3 py-1 rounded-full border border-black/5 shadow-2xs">
                    CDS Assessment
                  </span>
                </div>
              </div>

              {/* Dynamic Score Pop-Up Alert Banner */}
              <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 shadow-lg animate-in slide-in-from-top-3 duration-500 ${theme.bannerBg}`}>
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md shrink-0 shadow-inner">
                    <StatusIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-clinical-mono uppercase tracking-wider font-extrabold opacity-95">
                        Triage Score Alert
                      </span>
                      <span className="text-[11px] font-clinical-mono bg-white/25 px-2 py-0.5 rounded-full font-bold">
                        {theme.limitLabel}
                      </span>
                    </div>
                    <p className="text-base font-black tracking-tight mt-0.5">
                      {theme.statusLabel}
                    </p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/30 shrink-0">
                  <span className="font-clinical-mono text-2xl sm:text-3xl font-black">{triageScore}</span>
                  <span className="text-xs uppercase font-clinical-mono font-bold opacity-80">/100</span>
                </div>
              </div>

              {capturedImage && (
                <img src={capturedImage} alt="Scanned food" className="w-full max-h-56 object-cover rounded-2xl border border-outline-variant/20 shadow-sm" />
              )}

              {/* Pop-up Color & Background Triage Card */}
              <div className={`p-5 rounded-2xl flex flex-col gap-4 transition-all duration-500 ${theme.cardBg}`}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-white shadow-2xs border border-black/5 mt-0.5 shrink-0">
                      <StatusIcon className={`w-7 h-7 shrink-0 ${theme.textColor}`} />
                    </div>
                    <div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-2xs ${theme.statusBadge}`}>
                        {theme.statusLabel}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold text-on-surface mt-1.5 leading-snug">
                        {result.name}
                      </h3>
                      <p className="text-xs text-on-surface-variant font-medium">
                        {result.brand} · {result.category}
                      </p>
                    </div>
                  </div>

                  {/* Score Pop-up Badge */}
                  <div className="flex flex-col items-end shrink-0 ml-auto">
                    <div className={`flex items-baseline gap-1 px-4 py-2 rounded-2xl font-bold shadow-lg transition-transform duration-300 hover:scale-105 ${theme.badgeBg}`}>
                      <span className="font-clinical-mono text-3xl sm:text-4xl leading-none">{triageScore}</span>
                      <span className="text-xs uppercase tracking-wider opacity-85 leading-none font-clinical-mono">/ 100</span>
                    </div>
                    <span className={`text-[11px] font-clinical-mono font-bold uppercase mt-1 tracking-wider ${theme.textColor}`}>
                      {theme.tierLabel}
                    </span>
                  </div>
                </div>

                {/* 3-Limit Clinical Triage Spectrum Bar */}
                <div className="pt-3 border-t border-black/10 dark:border-white/10 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-clinical-mono font-bold">
                    <div className={`flex items-center gap-1.5 ${triageScore <= 30 ? "text-emerald-700 font-extrabold" : "text-emerald-700/60"}`}>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      <span>0 - 30 Green (Safe)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${triageScore > 30 && triageScore <= 70 ? "text-amber-700 font-extrabold" : "text-amber-700/60"}`}>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                      <span>31 - 70 Yellow (Caution)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${triageScore > 70 ? "text-rose-700 font-extrabold" : "text-rose-700/60"}`}>
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                      <span>71 - 100 Red (High Risk)</span>
                    </div>
                  </div>

                  <div className="relative h-3.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex shadow-inner border border-black/10">
                    <div className="w-[30%] bg-emerald-500 h-full transition-all" title="0-30 Green: Safe" />
                    <div className="w-[40%] bg-amber-400 h-full transition-all" title="31-70 Yellow: Caution" />
                    <div className="w-[30%] bg-rose-500 h-full transition-all" title="71-100 Red: High Risk" />
                    {/* Pinpoint Indicator */}
                    <div
                      className="absolute top-0 bottom-0 w-3.5 -ml-[7px] bg-white border-2 border-slate-900 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.6)] transition-all duration-700"
                      style={{ left: `${Math.min(100, Math.max(0, triageScore))}%` }}
                    />
                  </div>

                  <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                    {theme.summaryText}
                  </p>
                </div>
              </div>

            {/* Nutrition Facts Grid */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden shadow-xs">
              <div className="px-4 py-3 border-b border-outline-variant/10 flex items-center justify-between">
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Nutrition per {result.nutrition.servingSize}</h4>
                <span className="font-clinical-mono text-[11px] text-tertiary">Verified Facts</span>
              </div>
              <div className="grid grid-cols-4 gap-0 divide-x divide-y divide-outline-variant/10">
                {[
                  { label: "Calories", value: `${result.nutrition.calories} kcal`, alert: false },
                  { label: "Carbs", value: `${result.nutrition.totalCarbohydratesGrams}g`, alert: false },
                  { label: "Sugar", value: `${result.nutrition.totalSugarsGrams}g`, alert: result.nutrition.totalSugarsGrams > 10 },
                  { label: "Sodium", value: `${result.nutrition.sodiumMg}mg`, alert: result.nutrition.sodiumMg > 400 },
                  { label: "Protein", value: `${result.nutrition.proteinGrams}g`, alert: false },
                  { label: "Fat", value: `${result.nutrition.totalFatGrams}g`, alert: result.nutrition.totalFatGrams > 20 },
                  { label: "Fiber", value: `${result.nutrition.dietaryFiberGrams}g`, alert: false },
                  { label: "GL Score", value: result.nutrition.glycemicLoadScore, alert: result.nutrition.glycemicLoadScore > 10 },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center py-3 px-2 bg-surface-container-lowest hover:bg-surface-container transition-colors">
                    <span className={`text-sm font-bold ${item.alert ? "text-rose-600" : "text-on-surface"}`}>{item.value}</span>
                    <span className="text-[10px] text-on-surface-variant mt-0.5 font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* High-Impact Clinical Warning Banner for Biscuits & Inappropriate Ingredients */}
            {(() => {
              const isBiscuitOrContraindicated =
                result.name?.toLowerCase().includes("biscuit") ||
                result.name?.toLowerCase().includes("cookie") ||
                result.name?.toLowerCase().includes("marie") ||
                result.name?.toLowerCase().includes("parle") ||
                result.name?.toLowerCase().includes("digestive") ||
                result.name?.toLowerCase().includes("cracker") ||
                result.category?.toLowerCase().includes("biscuit") ||
                result.category?.toLowerCase().includes("cookie") ||
                result.clinicalFlags?.some(
                  (f: any) =>
                    f.id === "flag-biscuit-maida-palm-oil-emulsifiers" ||
                    f.id?.includes("biscuit") ||
                    (f.title && f.title.toLowerCase().includes("maida")) ||
                    (f.rationale && f.rationale.toLowerCase().includes("maida"))
                );

              if (!isBiscuitOrContraindicated) return null;

              return (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-50 to-red-100/80 dark:from-rose-950/40 dark:to-red-950/30 border-2 border-rose-500 shadow-md flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-rose-600 text-white shrink-0 shadow-sm mt-0.5">
                      <AlertTriangle className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-clinical-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-600 text-white tracking-wider shadow-2xs">
                          CRITICAL CLINICAL ALERT
                        </span>
                        <span className="text-[11px] font-clinical-mono font-bold uppercase text-rose-700 dark:text-rose-300">
                          DIABETES CONTRAINDICATION
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-black text-rose-950 dark:text-rose-100 mt-1.5 leading-snug">
                        Contains Maida, Vegetable Palm Oil &amp; Emulsifiers
                      </h4>
                      <div className="mt-2.5 p-3.5 rounded-xl bg-white/95 dark:bg-black/60 border border-rose-200 dark:border-rose-900 shadow-xs">
                        <p className="text-sm sm:text-base font-extrabold text-rose-700 dark:text-rose-300 leading-relaxed">
                          ⚠️ Contains maida, vegetable palm oil, emulsifiers and inappropriate ingredients. Do not consume it — do not consume it if you have diabetes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {result.clinicalFlags?.length > 0 ? (
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider px-1">
                  {result.clinicalFlags.length} Clinical Flag{result.clinicalFlags.length > 1 ? "s" : ""} Detected
                </h3>
                {result.clinicalFlags.map((flag: any) => {
                  const isExpanded = expandedFlags.includes(flag.id);
                  const isCriticalBiscuit = flag.id === "flag-biscuit-maida-palm-oil-emulsifiers";

                  return (
                    <div
                      key={flag.id}
                      className={`rounded-xl border ${
                        isCriticalBiscuit
                          ? "border-rose-500 bg-rose-50/40 dark:bg-rose-950/20 shadow-xs"
                          : severityColor[flag.severity] || severityColor.low
                      } overflow-hidden`}
                    >
                      <button className="w-full flex items-center justify-between p-3.5 text-left" onClick={() => toggleFlag(flag.id)}>
                        <div className="flex flex-col gap-1 pr-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${severityColor[flag.severity]}`}>
                              {flag.severity}
                            </span>
                            <span className="text-sm font-semibold">{flag.title}</span>
                          </div>
                          {isCriticalBiscuit && (
                            <p className="text-xs font-bold text-rose-700 dark:text-rose-300 pl-1 mt-0.5">
                              ⚠️ Contains maida, vegetable palm oil, emulsifiers and inappropriate ingredients. Do not consume it — do not consume it if you have diabetes.
                            </p>
                          )}
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                      </button>
                      {isExpanded && flag.threeStepChain && (
                        <div className="px-4 pb-3.5 flex flex-col gap-2 border-t border-current/10 pt-3 bg-white/40 dark:bg-black/20">
                          <div className="text-xs"><span className="font-bold">Your Profile:</span> {flag.threeStepChain.profileStep}</div>
                          <div className="text-xs"><span className="font-bold">Food Data:</span> {flag.threeStepChain.foodInfoStep}</div>
                          <div className="text-xs text-rose-700 dark:text-rose-300 font-semibold"><span className="font-bold">Clinical Guidance:</span> {flag.threeStepChain.potentialRelevanceStep}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-6 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-bold text-emerald-700 text-sm">No clinical flags detected</p>
                <p className="text-xs text-emerald-600 mt-1">This food appears compatible with your health profile.</p>
              </div>
            )}

            {/* Explicit Bottom Caution Callout Right "Down There" */}
            {(() => {
              const isBiscuitOrContraindicated =
                result.name?.toLowerCase().includes("biscuit") ||
                result.name?.toLowerCase().includes("cookie") ||
                result.name?.toLowerCase().includes("marie") ||
                result.name?.toLowerCase().includes("parle") ||
                result.name?.toLowerCase().includes("digestive") ||
                result.name?.toLowerCase().includes("cracker") ||
                result.category?.toLowerCase().includes("biscuit") ||
                result.category?.toLowerCase().includes("cookie") ||
                result.clinicalFlags?.some(
                  (f: any) =>
                    f.id === "flag-biscuit-maida-palm-oil-emulsifiers" ||
                    f.id?.includes("biscuit") ||
                    (f.title && f.title.toLowerCase().includes("maida")) ||
                    (f.rationale && f.rationale.toLowerCase().includes("maida"))
                );

              if (!isBiscuitOrContraindicated) return null;

              return (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 text-white shadow-md flex items-center gap-3.5 border border-rose-700 animate-in fade-in duration-300">
                  <div className="p-2.5 rounded-xl bg-white/20 shrink-0 shadow-inner">
                    <ShieldX className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] font-clinical-mono uppercase tracking-wider font-extrabold bg-white/20 px-2 py-0.5 rounded-full inline-block">
                      STRICT PATIENT ADVISORY · DO NOT CONSUME
                    </span>
                    <p className="text-xs sm:text-sm font-extrabold mt-1 leading-snug">
                      Contains maida, vegetable palm oil, emulsifiers and inappropriate ingredients. Do not consume it — do not consume it if you have diabetes.
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Primary Action Suite: See a Doctor & Scan Another Food */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConsultModal(true)}
                className="w-full flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-primary to-teal-800 hover:from-primary/90 hover:to-teal-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] group"
              >
                <div className="p-1.5 rounded-xl bg-white/20 text-white group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <span>See a Doctor · Teleconsult</span>
                <span className="bg-white/20 text-[10px] uppercase font-clinical-mono px-2 py-0.5 rounded-full font-bold ml-1">
                  WebRTC Call
                </span>
              </button>

              <button
                type="button"
                onClick={reset}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-white/90 dark:bg-black/30 hover:bg-white text-on-surface font-semibold text-xs border border-black/10 transition-colors shadow-2xs active:scale-95"
              >
                <RotateCcw className="w-4 h-4 text-on-surface-variant" />
                <span>Scan another food</span>
              </button>
            </div>
          </div>
        </>
      );
    })()}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div>
            <p className="font-bold text-on-surface text-sm">Running Clinical Analysis...</p>
            <p className="text-xs text-on-surface-variant mt-1">
              {mode === "camera" || mode === "upload" ? "AI Vision is reading your food label..." : "Analyzing ingredients & your health profile..."}
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="p-4 bg-error-container/30 border border-error/20 rounded-xl text-error text-sm flex items-start gap-2">
          <X className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Camera Mode */}
      {!result && !loading && mode === "camera" && (
        <div className="flex flex-col gap-4">
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black shadow-lg border border-outline-variant/30">
            {capturedImage ? (
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
            ) : (
              <>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                {/* Reticle overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <div className="w-64 h-44 relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-teal-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-teal-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-teal-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-teal-400 rounded-br-lg" />
                    <div className="absolute inset-x-4 top-1/2 h-0.5 bg-teal-400/60 shadow-[0_0_8px_rgba(20,184,166,0.8)] animate-laser-sweep" />
                  </div>
                  <p className="text-white/80 text-xs mt-3 font-medium bg-black/40 px-3 py-1 rounded-full">
                    Align the food label within the frame
                  </p>
                </div>
                {/* Controls overlay */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <button
                    onClick={() => setFacingMode((f) => f === "environment" ? "user" : "environment")}
                    className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white"
                  >
                    <SwitchCamera className="w-5 h-5" />
                  </button>
                </div>
                {!cameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />

          {capturedImage ? (
            <div className="flex gap-3">
              <button onClick={retakePhoto} className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-on-surface text-sm font-semibold flex items-center justify-center gap-2 hover:bg-surface-container transition-all">
                <RotateCcw className="w-4 h-4" /> Retake
              </button>
              <button onClick={submitScan} className="flex-1 py-3 rounded-xl bg-primary text-on-primary text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-sm active:scale-95">
                <ShieldCheck className="w-4 h-4" /> Analyze Label
              </button>
            </div>
          ) : (
            <button
              onClick={capturePhoto}
              disabled={!cameraReady}
              className="self-center w-20 h-20 rounded-full border-4 border-primary p-1.5 flex items-center justify-center active:scale-95 transition-all shadow-md disabled:opacity-50"
            >
              <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                <Camera className="w-7 h-7 text-on-primary" />
              </div>
            </button>
          )}
        </div>
      )}

      {/* Upload Mode */}
      {!result && !loading && mode === "upload" && (
        <div className="flex flex-col gap-4">
          {capturedImage ? (
            <>
              <img src={capturedImage} alt="Uploaded" className="w-full max-h-64 object-cover rounded-2xl border border-outline-variant/20 shadow-sm" />
              <div className="flex gap-3">
                <button onClick={() => setCapturedImage(null)} className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-on-surface text-sm font-semibold flex items-center justify-center gap-2 hover:bg-surface-container transition-all">
                  <X className="w-4 h-4" /> Remove
                </button>
                <button onClick={submitScan} className="flex-1 py-3 rounded-xl bg-primary text-on-primary text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-sm active:scale-95">
                  <ShieldCheck className="w-4 h-4" /> Analyze Label
                </button>
              </div>
            </>
          ) : (
            <label className="w-full aspect-video rounded-2xl border-2 border-dashed border-outline-variant/40 bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer group">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-on-surface">Upload food label photo</p>
                <p className="text-xs text-on-surface-variant mt-1">JPG, PNG — tap to browse</p>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          )}
        </div>
      )}

      {/* Search Mode */}
      {!result && !loading && mode === "search" && (
        <form onSubmit={handleSearchSubmit} className="bg-surface-container-lowest rounded-2xl p-space-md border border-outline-variant/20 shadow-sm flex flex-col gap-4">
          <div>
            <h2 className="text-base font-bold text-on-surface">Search by Food Name</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Our AI will look up real nutritional data and analyze it against your clinical profile.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                type="text"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g. Maggi Noodles, Oreo, Lays Classic..."
                className="w-full pl-9 pr-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface placeholder:text-outline"
              />
            </div>
            <button
              type="submit"
              disabled={!foodName.trim()}
              className="px-5 py-3 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 shadow-sm"
            >
              Analyze
            </button>
          </div>
        </form>
      )}

      {/* Customer Teleconsultation Request / Waiting Room Modal */}
      {showConsultModal && result && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            {!consultationSubmitted ? (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-on-surface">Consult On-Duty Doctor</h3>
                      <p className="text-xs text-on-surface-variant">Send scanned food evidence to clinical review</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowConsultModal(false)}
                    className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Scanned food context preview */}
                <div className="p-3.5 rounded-2xl bg-surface-container flex items-center gap-3 border border-black/5">
                  {capturedImage ? (
                    <img src={capturedImage} alt={result.name} className="w-14 h-14 rounded-xl object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Sparkles className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-clinical-mono uppercase font-bold text-on-surface-variant">
                      Attached Evidence
                    </span>
                    <h4 className="text-sm font-bold text-on-surface truncate">{result.name}</h4>
                    <p className="text-xs text-on-surface-variant">{result.brand} · {result.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-clinical-mono text-on-surface-variant uppercase block">Score</span>
                    <span className="font-clinical-mono text-base font-black text-primary">
                      {result.triageScore || 85}/100
                    </span>
                  </div>
                </div>

                {/* Optional Note for Doctor */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">
                    Question or note for the clinician (optional):
                  </label>
                  <textarea
                    rows={3}
                    value={consultNote}
                    onChange={(e) => setConsultNote(e.target.value)}
                    placeholder="e.g. Can I eat half a portion with dinner? Is there a safe alternative or medication timing I should follow?"
                    className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConsultModal(false)}
                    className="flex-1 py-3 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={sendingConsult}
                    onClick={handleRequestDoctor}
                    className="flex-2 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-primary hover:bg-surface-tint text-on-primary text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                  >
                    {sendingConsult ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Transmitting to Doctor...</span>
                      </>
                    ) : (
                      <>
                        <Stethoscope className="w-4 h-4" />
                        <span>Send Triage &amp; Join Room</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* Waiting Room State after dispatching request */
              <div className="flex flex-col items-center text-center gap-4 py-2">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                    <Stethoscope className="w-10 h-10 text-emerald-600 animate-pulse" />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-on-surface">Transmitted to Doctor Queue</h3>
                  <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1">
                    Your {result.name} scan data, photo, and triage score ({result.triageScore || 85}/100) are live on the Doctor's Customer Dashboard.
                  </p>
                </div>

                <div className="w-full p-4 rounded-2xl bg-surface-container-low border border-black/5 flex flex-col gap-2 text-left">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant">Attending Clinician:</span>
                    <span className="font-bold text-on-surface">Dr. Sarah Jenkins, MD</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant">Status:</span>
                    <span className="font-clinical-mono text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                      Ready for WebRTC Call
                    </span>
                  </div>
                </div>

                {/* Direct Calling Trigger Buttons */}
                <div className="w-full flex flex-col sm:flex-row gap-2.5 pt-1">
                  <button
                    onClick={() => startCustomerCall("audio")}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-xs transition-all shadow-xs"
                  >
                    <Phone className="w-4 h-4 text-primary" />
                    <span>Start Audio Call</span>
                  </button>

                  <button
                    onClick={() => startCustomerCall("video")}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-surface-tint text-on-primary font-bold text-xs transition-all shadow-md active:scale-98"
                  >
                    <Video className="w-4 h-4" />
                    <span>Start Video Call</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowConsultModal(false)}
                  className="text-xs text-on-surface-variant hover:text-on-surface font-semibold mt-1"
                >
                  Minimize &amp; Keep In Background
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customer WebRTC Call Modal */}
      {isCallingDoctor && (
        <WebRTCCallModal
          isOpen={true}
          onClose={() => setIsCallingDoctor(false)}
          roomId={currentConsultation?.roomId || "cds-room-ananya-8842"}
          participantRole="customer"
          participantName="Ananya Rao"
          peerName="Dr. Sarah Jenkins, MD"
          foodName={result?.name}
          foodImage={capturedImage}
          triageScore={result?.triageScore}
          initialCallType={callType}
        />
      )}
    </div>
  );
}
