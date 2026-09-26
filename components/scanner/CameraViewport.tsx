"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flashlight, FlashlightOff, Grid, Camera } from "lucide-react";

export function CameraViewport() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ocr" | "barcode">("ocr");
  const [torchOn, setTorchOn] = useState(false);
  const [gridVisible, setGridVisible] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = () => {
    setIsCapturing(true);
    setTimeout(() => {
      router.push("/scanner/processing?item=nutrichoice-digestive");
    }, 600);
  };

  return (
    <div className="flex flex-col gap-space-md w-full max-w-lg mx-auto">
      {/* Viewport Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-on-surface tracking-tight">
            Scan food label
          </h1>
          <p className="text-xs text-on-surface-variant">
            Capture the ingredient deck or nutrition facts panel.
          </p>
        </div>
        <div className="flex items-center gap-space-xs">
          <button
            onClick={() => setTorchOn(!torchOn)}
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors active:scale-95"
            aria-label="Toggle Torch"
          >
            {torchOn ? (
              <Flashlight className="w-5 h-5 text-amber-600" />
            ) : (
              <FlashlightOff className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => setGridVisible(!gridVisible)}
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors active:scale-95"
            aria-label="Toggle Guidelines"
          >
            <Grid className={`w-5 h-5 ${gridVisible ? "text-primary" : "text-outline"}`} />
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex self-center bg-surface-container-high p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("ocr")}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "ocr"
              ? "bg-surface-container-lowest text-on-surface shadow-xs"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Ingredients OCR
        </button>
        <button
          onClick={() => setActiveTab("barcode")}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "barcode"
              ? "bg-surface-container-lowest text-on-surface shadow-xs"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Barcode
        </button>
      </div>

      {/* Camera Viewport Frame */}
      <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-inverse-surface shadow-lg flex flex-col justify-between p-space-md select-none border border-outline-variant/30">
        {/* Background Simulated Feed */}
        <div
          className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ${
            torchOn ? "brightness-110 contrast-105" : "brightness-90 opacity-70"
          }`}
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBi2z5SYmcnnhXtC1iM9InR4Id5Cpm_TFgcT4hHtn9QGkX3P8PB0_IgPoVkM3_6aARvBWHGKoar_h3SvwGxdspRFBYdCNy7LcelQ49arG4xSxHUFbkTqzET8YVM3u5ZqdaM9EXV8oRqgmlaVXGth9Gq2niPOTRxJhYThoAHp2vOIaekNA8IhNP0UWXAo0YOr2de091Oy2yCjST425WvQUg7uxrj3Kuf39xUHrw2pdqKQzV4rQeu7_M')`,
          }}
        />

        {/* Alignment Grid Overlay */}
        {gridVisible && (
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20">
            <div className="border border-white/40 m-1 rounded-xs" />
            <div className="border border-white/40 m-1 rounded-xs" />
            <div className="border border-white/40 m-1 rounded-xs" />
            <div className="border border-white/40 m-1 rounded-xs" />
            <div className="border border-white/40 m-1 rounded-xs" />
            <div className="border border-white/40 m-1 rounded-xs" />
            <div className="border border-white/40 m-1 rounded-xs" />
            <div className="border border-white/40 m-1 rounded-xs" />
            <div className="border border-white/40 m-1 rounded-xs" />
          </div>
        )}

        {/* Sweeping Optical Scan Line */}
        <div className="absolute inset-x-4 h-[2px] bg-secondary-fixed opacity-80 shadow-[0_0_12px_rgba(181,236,238,1)] pointer-events-none animate-laser-sweep" />

        {/* Top Guidance Status Chip */}
        <div className="relative z-10 self-center">
          <div className="bg-inverse-surface/85 backdrop-blur-md px-3.5 py-1 rounded-full flex items-center gap-2 shadow-sm border border-white/10">
            <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-ping" />
            <span className="font-clinical-mono text-xs text-inverse-on-surface">
              Hold steady · Ensure label is in frame
            </span>
          </div>
        </div>

        {/* Center Reticle / Target Brackets */}
        <div className="relative z-10 my-auto self-center w-64 h-52 flex flex-col items-center justify-between p-2 pointer-events-none">
          <div className="w-full flex justify-between">
            <div className="w-6 h-6 border-t-2 border-l-2 border-secondary-fixed rounded-tl-lg" />
            <div className="w-6 h-6 border-t-2 border-r-2 border-secondary-fixed rounded-tr-lg" />
          </div>

          <div className="bg-inverse-surface/75 backdrop-blur-md px-3 py-1 rounded-lg text-center max-w-[210px] border border-white/10">
            <p className="text-xs text-inverse-on-surface font-medium">
              {activeTab === "ocr"
                ? "Align ingredient list or nutritional table"
                : "Point at food barcode"}
            </p>
          </div>

          <div className="w-full flex justify-between">
            <div className="w-6 h-6 border-b-2 border-l-2 border-secondary-fixed rounded-bl-lg" />
            <div className="w-6 h-6 border-b-2 border-r-2 border-secondary-fixed rounded-br-lg" />
          </div>
        </div>

        {/* Bottom Sensor Indicator Bar */}
        <div className="relative z-10 flex justify-between items-end">
          <div className="flex items-center gap-1.5 bg-inverse-surface/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-clinical-mono text-[11px] text-inverse-on-surface">
              AUTO-FOCUS 98.4%
            </span>
          </div>
          <div className="bg-inverse-surface/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/10">
            <span className="font-clinical-mono text-[11px] text-secondary-fixed font-semibold">
              ISO 100
            </span>
          </div>
        </div>
      </div>

      {/* Shutter Capture Button */}
      <div className="flex flex-col items-center gap-2 mt-1">
        <button
          onClick={handleCapture}
          disabled={isCapturing}
          className="w-18 h-18 rounded-full border-4 border-primary p-1 flex items-center justify-center active:scale-95 transition-all shadow-md group disabled:opacity-50"
        >
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center group-hover:bg-surface-tint transition-colors">
            <Camera className="w-6 h-6 text-on-primary" />
          </div>
        </button>
        <span className="text-xs text-on-surface-variant font-medium">
          {isCapturing ? "Ingesting frame..." : "Tap to analyze label"}
        </span>
      </div>
    </div>
  );
}
