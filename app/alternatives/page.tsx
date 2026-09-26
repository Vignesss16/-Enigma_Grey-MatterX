"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GitCompare, ArrowLeft, CheckCircle2 } from "lucide-react";
import { MobileHeader } from "@/components/navigation/MobileHeader";
import { AlternativesStatStrip } from "@/components/alternatives/AlternativesStatStrip";
import { AlternativeCard } from "@/components/alternatives/AlternativeCard";
import { GlycemicLoadPanel } from "@/components/alternatives/GlycemicLoadPanel";
import { CompareModal } from "@/components/alternatives/CompareModal";
import { SAFER_ALTERNATIVES } from "@/lib/mock-data";

export default function SaferAlternativesPage() {
  const router = useRouter();
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSwap = (productName: string) => {
    setToastMessage(`Swapped to ${productName} in food log`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  return (
    <>
      <MobileHeader title="Safer Alternatives" showBack />

      <div className="px-gutter lg:px-space-xl py-space-sm max-w-2xl mx-auto flex flex-col gap-space-md">
        {/* 1. Overview Stat Strip (Evaluated 3 Found / Max Fit 96% / Hidden Polyols 0g) */}
        <AlternativesStatStrip />

        {/* 2. The Three Alternative Cards */}
        <div className="flex flex-col gap-space-sm">
          {SAFER_ALTERNATIVES.map((product) => (
            <AlternativeCard
              key={product.id}
              product={product}
              onSwap={handleSwap}
            />
          ))}
        </div>

        {/* 3. Relative Glycemic Load Panel (Located ONLY here at the bottom after the 3 alternative cards) */}
        <GlycemicLoadPanel />

        {/* 4. Dual Primary Action Stack */}
        <div className="flex flex-col gap-space-sm mt-space-xs pb-space-lg">
          <button
            onClick={() => setIsCompareOpen(true)}
            className="w-full min-h-[46px] px-4 py-3 bg-primary text-on-primary text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm hover:bg-surface-tint active:scale-[0.99] transition-all"
          >
            <GitCompare className="w-4 h-4 text-primary-fixed" />
            <span>Compare with original</span>
          </button>

          <button
            onClick={() => router.back()}
            className="w-full min-h-[46px] px-4 py-3 bg-surface-container text-on-surface text-xs font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors active:scale-[0.99]"
          >
            <ArrowLeft className="w-4 h-4 text-outline" />
            <span>Return to scan result</span>
          </button>
        </div>

        {/* Interactive Comparison Slide-Up Sheet */}
        <CompareModal
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
        />

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-20 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-full shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <CheckCircle2 className="w-4 h-4 text-primary-fixed" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </>
  );
}
