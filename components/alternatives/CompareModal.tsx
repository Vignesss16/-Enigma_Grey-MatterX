"use client";

import { X, GitCompare } from "lucide-react";

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CompareModal({ isOpen, onClose }: CompareModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex flex-col justify-end p-margin animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-2xl border border-outline-variant/30 flex flex-col gap-space-md max-w-lg mx-auto w-full max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <GitCompare className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-on-surface">
              Original vs. Safer Picks
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-space-sm text-on-surface text-xs">
          {/* Original Product */}
          <div className="bg-surface-container-low rounded-xl p-space-sm flex flex-col gap-1 border border-outline-variant/15">
            <div className="flex justify-between font-semibold">
              <span className="text-error">NutriChoice Original</span>
              <span className="text-error font-clinical-mono">High Risk Factor</span>
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              Carbohydrates: 22.4g per serving · Contains Maltitol Syrup (GI 35-52) &amp; Artificial Leavening Polyols.
            </p>
          </div>

          {/* Top Safer Alternative */}
          <div className="bg-emerald-50/60 rounded-xl p-space-sm flex flex-col gap-1 border border-emerald-200">
            <div className="flex justify-between font-semibold">
              <span className="text-emerald-900">Top Match: Seed Thins</span>
              <span className="text-emerald-700 font-clinical-mono">96% Compatibility</span>
            </div>
            <p className="text-emerald-900/80 leading-relaxed">
              Carbohydrates: 4.5g per serving · 0g synthetic sweeteners · 100% naturally derived plant proteins and fiber.
            </p>
          </div>

          {/* Second Alternative */}
          <div className="bg-surface-container-low rounded-xl p-space-sm flex flex-col gap-1 border border-outline-variant/15">
            <div className="flex justify-between font-semibold">
              <span className="text-primary">True Elements Oats Crackers</span>
              <span className="text-primary font-clinical-mono">94% Compatibility</span>
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              Carbohydrates: 8.2g per serving · Zero maltitol or refined flours · 95mg sodium.
            </p>
          </div>
        </div>

        <div className="pt-space-xs">
          <button
            onClick={onClose}
            className="w-full min-h-[44px] bg-primary text-on-primary font-medium text-xs rounded-xl flex items-center justify-center hover:bg-surface-tint active:scale-[0.99] transition-all"
          >
            Dismiss Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
