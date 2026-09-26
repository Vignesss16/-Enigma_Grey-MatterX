"use client";

import Link from "next/link";
import { Sliders, AlertOctagon, Heart, Zap } from "lucide-react";

export function DoctorSensitivityTuner() {
  return (
    <div className="rounded-2xl bg-surface-container-lowest p-4 sm:p-5 shadow-xs border border-outline-variant/20 flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Sliders className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-on-surface tracking-tight">
            Active Sensitivity Baseline
          </h3>
        </div>
        <Link
          href="/profile"
          className="text-xs text-primary font-bold hover:underline"
        >
          Edit Ceilings
        </Link>
      </div>

      {/* Parameter 1: Carb & GI Profile */}
      <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-surface-container-low/70 border border-outline-variant/15">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Carbohydrate GI Profile</span>
          </span>
          <span className="text-[11px] text-amber-900 font-semibold bg-amber-100 border border-amber-200/80 px-2 py-0.5 rounded-lg">
            Low GI &lt; 55 Priority
          </span>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Flag hidden starches: Maltodextrin, Modified Tapioca, Refined Wheat (Maida), Invert Syrups.
        </p>
        <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-1 overflow-hidden">
          <div className="bg-primary h-1.5 rounded-full" style={{ width: "48%" }} />
        </div>
      </div>

      {/* Parameter 2: Sodium ceiling */}
      <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-surface-container-low/70 border border-outline-variant/15">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-600" />
            <span>Sodium Ceiling</span>
          </span>
          <span className="text-[11px] text-rose-900 font-semibold bg-rose-100 border border-rose-200/80 px-2 py-0.5 rounded-lg">
            1,500 mg / day
          </span>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Calculated per Stage 1 Hypertension threshold. Single serving limit capped at 350mg.
        </p>
        <div className="flex items-center justify-between text-xs text-on-surface-variant pt-0.5">
          <span>Today's Accumulated Intake:</span>
          <span className="font-bold text-on-surface">620 mg (41%)</span>
        </div>
      </div>

      {/* Parameter 3: Documented Allergens */}
      <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-surface-container-low/70 border border-outline-variant/15">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-on-surface">Documented Allergens</span>
          <span className="text-[11px] text-white bg-error px-2 py-0.5 rounded-lg font-bold">
            Severe Lockdown
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <AlertOctagon className="w-4 h-4 text-error shrink-0" />
          <span className="text-xs font-bold text-on-surface">
            Peanut &amp; Groundnut Derivatives
          </span>
        </div>
        <span className="text-xs text-on-surface-variant">
          Immediate zero-tolerance alert on shared processing lines.
        </span>
      </div>
    </div>
  );
}
