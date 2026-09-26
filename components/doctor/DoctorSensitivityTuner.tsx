"use client";

import Link from "next/link";
import { Sliders, AlertOctagon, Heart, Zap } from "lucide-react";

export function DoctorSensitivityTuner() {
  return (
    <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-outline-variant/20 flex flex-col gap-space-md">
      <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/15">
        <div className="flex items-center gap-space-xs">
          <Sliders className="w-4 h-4 text-primary" />
          <h3 className="text-base font-semibold text-on-surface">
            Active Sensitivity Baseline
          </h3>
        </div>
        <Link
          href="/profile"
          className="font-clinical-mono text-xs text-primary font-semibold hover:underline"
        >
          EDIT CEILINGS
        </Link>
      </div>

      {/* Parameter 1: Carb & GI Profile */}
      <div className="flex flex-col gap-1.5 p-space-sm rounded-xl bg-surface-container-low/70 border border-outline-variant/15">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Carbohydrate GI Profile</span>
          </span>
          <span className="font-clinical-mono text-[10px] text-[#92400E] font-semibold bg-[#FEF3C7] px-2 py-0.5 rounded">
            Low GI &lt; 55 Priority
          </span>
        </div>
        <p className="text-[11px] text-on-surface-variant leading-relaxed">
          Flag hidden starches: Maltodextrin, Modified Tapioca, Refined Wheat (Maida), Invert Syrups.
        </p>
        <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-1 overflow-hidden">
          <div className="bg-primary h-1.5 rounded-full" style={{ width: "48%" }} />
        </div>
      </div>

      {/* Parameter 2: Sodium ceiling */}
      <div className="flex flex-col gap-1.5 p-space-sm rounded-xl bg-surface-container-low/70 border border-outline-variant/15">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-red-600" />
            <span>Sodium Ceiling</span>
          </span>
          <span className="font-clinical-mono text-[10px] text-[#991B1B] font-semibold bg-[#FEE2E2] px-2 py-0.5 rounded">
            1,500 mg / day
          </span>
        </div>
        <p className="text-[11px] text-on-surface-variant leading-relaxed">
          Calculated per Stage 1 Hypertension threshold. Single serving limit capped at 350mg.
        </p>
        <div className="flex items-center justify-between font-clinical-mono text-xs text-on-surface-variant pt-0.5">
          <span>Today's Accumulated Intake:</span>
          <span className="font-semibold text-on-surface">620 mg (41%)</span>
        </div>
      </div>

      {/* Parameter 3: Documented Allergens */}
      <div className="flex flex-col gap-1.5 p-space-sm rounded-xl bg-surface-container-low/70 border border-outline-variant/15">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-on-surface">Documented Allergens</span>
          <span className="font-clinical-mono text-[10px] text-white bg-error px-2 py-0.5 rounded font-bold">
            SEVERE LOCKDOWN
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <AlertOctagon className="w-4 h-4 text-error shrink-0" />
          <span className="text-xs font-semibold text-on-surface">
            Peanut &amp; Groundnut Derivatives
          </span>
        </div>
        <span className="text-[11px] text-on-surface-variant">
          Immediate zero-tolerance alert on shared processing lines.
        </span>
      </div>
    </div>
  );
}
