"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Loader2, Sparkles } from "lucide-react";
import { MobileHeader } from "@/components/navigation/MobileHeader";

function ScanProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemId = searchParams.get("item") || "nutrichoice-digestive";

  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    { title: "Ingredients detected", detail: "24 chemical & derivative items parsed", pct: "100%" },
    { title: "Nutrition facts detected", detail: "Per 100g & standard serving calibrated", pct: "Valid" },
    { title: "Health profile synchronized", detail: "Type-2 Diabetes & Hypertension thresholds", pct: "Mapped" },
    { title: "Compound & Sweetener scan", detail: "Identifying hidden polyols, maltitol & sodium loads...", pct: "Scanning" },
  ];

  useEffect(() => {
    const t1 = setTimeout(() => setStepIndex(1), 700);
    const t2 = setTimeout(() => setStepIndex(2), 1500);
    const t3 = setTimeout(() => setStepIndex(3), 2200);
    const t4 = setTimeout(() => {
      router.push(`/assessment/${itemId}`);
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [itemId, router]);

  return (
    <div className="px-gutter py-space-md space-y-space-lg max-w-md mx-auto">
      {/* Scanning Visual Card with Animated Precision Laser Beam */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-surface-container shadow-sm border border-outline-variant/20 flex items-center justify-center">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuByh3mb1ORRRUurY2Tfbvzl_4u_OMisql1jjVWkWO29FDixkAHEp0RjJgJQ67YYIwSQywQhphksMso6kDgm00xK5aGGCXd08dKsgkb_efS5BkKGS-CY87s1nAcjl9KzK1WTAbz1l1lSVeNrAos4ZjXt6koe-esp_Q3cXayBEkLrUslFR-Ek-1-pEJH8yK4B1NNP7HbLooL3aIS0vKUPXyRAborp_3NI6VDpj3wpyVzoDsM0K33qzJk"
          alt="Scanning package"
          className="w-full h-full object-cover opacity-90"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-highest/80 via-transparent to-surface-container-highest/30 pointer-events-none" />

        {/* Active Scanner Sweep Overlay */}
        <div className="absolute inset-0 flex flex-col justify-start pointer-events-none overflow-hidden">
          <div className="w-full h-1 bg-primary-fixed shadow-[0_0_12px_#8ad3d5] animate-laser-sweep" />
        </div>

        {/* Live OCR Matrix Targeting Reticles */}
        <div className="absolute top-space-sm left-space-sm bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-sm border border-white/20">
          <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
          <span className="font-clinical-mono text-[10px] text-secondary font-semibold uppercase tracking-wider">
            OCR Matrix Active
          </span>
        </div>

        <div className="absolute bottom-space-sm right-space-sm bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-white/20">
          <span className="font-clinical-mono text-[10px] text-on-surface font-medium">
            Batch #482-D
          </span>
        </div>
      </div>

      {/* Primary Status Headline */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary-container/50 text-on-secondary-container">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="font-clinical-mono text-[10px] font-semibold uppercase tracking-wider">
            Clinical Evidence Pipeline
          </span>
        </div>
        <h2 className="text-xl font-bold text-on-surface tracking-tight">
          Analyzing label data
        </h2>
        <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
          Cross-referencing ingredients against Ananya's chronic care profile...
        </p>
      </div>

      {/* Verification Checklist Protocol */}
      <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm border border-outline-variant/20 space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-outline-variant/15">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
            Diagnostic Steps
          </span>
          <span className="font-clinical-mono text-xs text-secondary font-semibold">
            {Math.min(stepIndex + 1, 4)} of 4 Complete
          </span>
        </div>

        {steps.map((step, idx) => {
          const isCompleted = stepIndex > idx;
          const isCurrent = stepIndex === idx;

          return (
            <div
              key={idx}
              className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-lowest shadow-xs border border-outline-variant/10 transition-all"
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isCompleted
                    ? "bg-secondary-container text-primary font-bold"
                    : isCurrent
                    ? "bg-primary-container text-on-primary-container"
                    : "bg-surface-container text-outline"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5" />
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span className="text-[10px] font-clinical-mono">{idx + 1}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-on-surface truncate">
                    {step.title}
                  </p>
                  <span className="font-clinical-mono text-[11px] text-secondary font-medium">
                    {step.pct}
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  {step.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ScanProcessingPage() {
  return (
    <>
      <MobileHeader title="Ingredient Analysis" showBack />
      <Suspense fallback={<div className="p-8 text-center text-xs text-outline">Loading diagnostic pipeline...</div>}>
        <ScanProcessingContent />
      </Suspense>
    </>
  );
}
