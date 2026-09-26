"use client";

import { GitBranch, User, AlertTriangle, Lightbulb, CheckCircle2 } from "lucide-react";

export function DoctorExplainabilitySpotlight() {
  return (
    <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-outline-variant/20 flex flex-col gap-space-md relative overflow-hidden">
      <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/15">
        <div className="flex items-center gap-space-xs">
          <GitBranch className="w-4 h-4 text-primary" />
          <h3 className="text-base font-semibold text-on-surface">
            Explainability Spotlight
          </h3>
        </div>
        <span className="font-clinical-mono text-[10px] text-tertiary uppercase font-bold bg-surface-container px-2 py-0.5 rounded">
          TRACE LOG #8842-1
        </span>
      </div>

      <p className="text-xs text-on-surface-variant">
        Why NutriChoice Sugar-Free received an{" "}
        <span className="font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
          Amber Concern Flag
        </span>
        :
      </p>

      {/* Visual Flowchart Node Connection */}
      <div className="flex flex-col gap-3 relative pl-2">
        {/* Flow Line */}
        <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-surface-container-highest" />

        {/* Node 1: Profile Condition */}
        <div className="flex items-start gap-3 relative z-10">
          <div className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 shadow-xs">
            <User className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="flex flex-col p-2.5 rounded-lg bg-surface-container-low w-full border border-outline-variant/15">
            <div className="flex justify-between items-center">
              <span className="font-clinical-mono text-[10px] text-primary uppercase font-bold">
                1. Patient Health Profile
              </span>
              <span className="text-[10px] text-outline font-clinical-mono">BASE</span>
            </div>
            <p className="text-xs text-on-surface font-semibold mt-0.5">
              Type-2 Diabetes Target (GL &lt; 10)
            </p>
            <span className="text-[11px] text-on-surface-variant">
              Monitors sharp postprandial glucose excursions.
            </span>
          </div>
        </div>

        {/* Node 2: Ingredient Identification */}
        <div className="flex items-start gap-3 relative z-10">
          <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
          </div>
          <div className="flex flex-col p-2.5 rounded-lg bg-surface-container-low w-full border border-outline-variant/15">
            <div className="flex justify-between items-center">
              <span className="font-clinical-mono text-[10px] text-amber-800 uppercase font-bold">
                2. Ingredient Deception Check
              </span>
              <span className="text-[10px] text-amber-800 font-clinical-mono">MATCH</span>
            </div>
            <p className="text-xs text-on-surface font-semibold mt-0.5">
              Refined Wheat Flour &amp; Maltitol Syrup
            </p>
            <span className="text-[11px] text-on-surface-variant">
              Maltitol has a GI of 35-52, spiking glucose despite "zero sugar" claims.
            </span>
          </div>
        </div>

        {/* Node 3: Clinical Decision */}
        <div className="flex items-start gap-3 relative z-10">
          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <div className="flex flex-col p-2.5 rounded-lg bg-surface-container-low w-full border border-outline-variant/15">
            <div className="flex justify-between items-center">
              <span className="font-clinical-mono text-[10px] text-emerald-800 uppercase font-bold">
                3. CDS Recommendation
              </span>
              <span className="text-[10px] text-emerald-800 font-clinical-mono">SWAP</span>
            </div>
            <p className="text-xs text-on-surface font-semibold mt-0.5">
              Recommend Seed Thins or Rolled Oats Crackers
            </p>
            <span className="text-[11px] text-on-surface-variant">
              96% match, 4.5g net carbs, zero polyols, zero maltitol.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
