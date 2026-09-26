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
} from "lucide-react";

type ScanMode = "camera" | "upload" | "search";

export function FoodScanner() {
  const [mode, setMode] = useState<ScanMode>("camera");
  const [foodName, setFoodName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedFlags, setExpandedFlags] = useState<string[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

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
    if (mode === "camera") startCamera();
  };

  const toggleFlag = (id: string) => {
    setExpandedFlags((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
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
    <div className="flex flex-col gap-space-lg w-full max-w-2xl mx-auto">
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
        const status = statusConfig[result.overallStatus as keyof typeof statusConfig] || statusConfig.safe;
        const StatusIcon = status.icon;
        return (
          <div className="flex flex-col gap-4">
            {capturedImage && (
              <img src={capturedImage} alt="Scanned food" className="w-full max-h-48 object-cover rounded-2xl border border-outline-variant/20 shadow-sm" />
            )}

            <div className={`flex items-center gap-3 p-4 rounded-2xl border ${status.bg}`}>
              <StatusIcon className={`w-8 h-8 shrink-0 ${status.color}`} />
              <div>
                <p className={`text-xs font-bold uppercase tracking-widest font-clinical-mono ${status.color}`}>{status.label}</p>
                <p className="text-base font-bold text-on-surface mt-0.5">{result.name}</p>
                <p className="text-xs text-on-surface-variant">{result.brand} · {result.category}</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-outline-variant/10">
                <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">Nutrition per {result.nutrition.servingSize}</h3>
              </div>
              <div className="grid grid-cols-4 gap-0 divide-x divide-y divide-outline-variant/10">
                {[
                  { label: "Calories", value: result.nutrition.calories, unit: "kcal" },
                  { label: "Carbs", value: `${result.nutrition.totalCarbohydratesGrams}g`, unit: "" },
                  { label: "Sugar", value: `${result.nutrition.totalSugarsGrams}g`, unit: "" },
                  { label: "Sodium", value: `${result.nutrition.sodiumMg}mg`, unit: "" },
                  { label: "Protein", value: `${result.nutrition.proteinGrams}g`, unit: "" },
                  { label: "Fat", value: `${result.nutrition.totalFatGrams}g`, unit: "" },
                  { label: "Fiber", value: `${result.nutrition.dietaryFiberGrams}g`, unit: "" },
                  { label: "GL Score", value: result.nutrition.glycemicLoadScore, unit: "" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center py-3 px-2 bg-surface-container-lowest hover:bg-surface-container transition-colors">
                    <span className="text-sm font-bold text-on-surface">{item.value}</span>
                    <span className="text-[10px] text-on-surface-variant mt-0.5">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {result.clinicalFlags?.length > 0 ? (
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider px-1">
                  {result.clinicalFlags.length} Clinical Flag{result.clinicalFlags.length > 1 ? "s" : ""} Detected
                </h3>
                {result.clinicalFlags.map((flag: any) => {
                  const isExpanded = expandedFlags.includes(flag.id);
                  return (
                    <div key={flag.id} className={`rounded-xl border ${severityColor[flag.severity] || severityColor.low} overflow-hidden`}>
                      <button className="w-full flex items-center justify-between p-3 text-left" onClick={() => toggleFlag(flag.id)}>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${severityColor[flag.severity]}`}>{flag.severity}</span>
                          <span className="text-sm font-semibold">{flag.title}</span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                      </button>
                      {isExpanded && flag.threeStepChain && (
                        <div className="px-4 pb-3 flex flex-col gap-2 border-t border-current/10 pt-3">
                          <div className="text-xs"><span className="font-bold">Your Profile:</span> {flag.threeStepChain.profileStep}</div>
                          <div className="text-xs"><span className="font-bold">Food Data:</span> {flag.threeStepChain.foodInfoStep}</div>
                          <div className="text-xs"><span className="font-bold">Risk:</span> {flag.threeStepChain.potentialRelevanceStep}</div>
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

            <button onClick={reset} className="flex items-center gap-2 self-center text-xs text-primary font-semibold mt-2 hover:underline">
              <RotateCcw className="w-3.5 h-3.5" /> Scan another food
            </button>
          </div>
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
    </div>
  );
}
