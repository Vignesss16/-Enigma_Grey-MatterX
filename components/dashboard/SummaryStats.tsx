"use client";

import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

export function SummaryStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
      {/* Stat 1: Evaluated */}
      <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-outline-variant/20 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <span className="font-clinical-mono text-xs text-tertiary uppercase tracking-wider">
              Evaluated This Month
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold tracking-tight text-on-surface">
                42
              </span>
              <span className="text-xs text-on-surface-variant">foods logged</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 pt-2.5 border-t border-outline-variant/15 flex items-center justify-between text-xs font-medium">
          <span className="text-emerald-700">31 Compliant (Safe)</span>
          <span className="text-outline-variant">•</span>
          <span className="text-red-700 font-semibold">11 Flagged Triggers</span>
        </div>
      </div>

      {/* Stat 2: Primary Risk Vector */}
      <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-outline-variant/20 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <span className="font-clinical-mono text-xs text-tertiary uppercase tracking-wider">
              Primary Risk Vector
            </span>
            <div className="mt-1">
              <h4 className="text-base font-semibold text-on-surface leading-snug">
                Hidden Refined Flour
              </h4>
              <p className="text-xs text-secondary font-medium">
                &amp; Sodium Density Spike (&gt;400mg)
              </p>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 pt-2.5 border-t border-outline-variant/15 flex items-center justify-between text-xs text-on-surface-variant">
          <span>Glycemic variability driver</span>
          <span className="font-clinical-mono text-primary font-semibold">73% of flags</span>
        </div>
      </div>

      {/* Stat 3: Information Confidence */}
      <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-outline-variant/20 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <span className="font-clinical-mono text-xs text-tertiary uppercase tracking-wider">
              Clinical Confidence
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold tracking-tight text-primary">
                96.4%
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container">
                GRADE A
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 pt-2.5 border-t border-outline-variant/15 flex items-center justify-between text-xs text-on-surface-variant">
          <span className="truncate">High-fidelity OCR + Rule Match</span>
          <span className="font-clinical-mono text-tertiary">0 inferences</span>
        </div>
      </div>
    </div>
  );
}
