"use client";

import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

export function SummaryStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
      {/* Stat 1: Evaluated */}
      <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-xs border border-outline-variant/20 hover:border-primary/25 transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <span className="font-clinical-mono text-[11px] font-semibold text-tertiary uppercase tracking-wider">
              Monthly Food Scans
            </span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-bold tracking-tight text-on-surface">
                42
              </span>
              <span className="text-xs font-medium text-on-surface-variant">items screened</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-outline-variant/15 flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
            31 Verified Safe
          </span>
          <span className="text-outline-variant">·</span>
          <span className="inline-flex items-center gap-1.5 text-amber-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
            11 Flagged Risks
          </span>
        </div>
      </div>

      {/* Stat 2: Primary Risk Vector */}
      <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-xs border border-outline-variant/20 hover:border-primary/25 transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <span className="font-clinical-mono text-[11px] font-semibold text-tertiary uppercase tracking-wider">
              Top Risk Identified
            </span>
            <div className="mt-1.5">
              <h4 className="text-base font-semibold text-on-surface leading-snug">
                Refined Flour &amp; Sodium
              </h4>
              <p className="text-xs text-secondary font-medium mt-0.5">
                Exceeds 400 mg sodium threshold
              </p>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-outline-variant/15 flex items-center justify-between text-xs text-on-surface-variant">
          <span className="font-medium text-on-surface-variant">Primary Spike Driver</span>
          <span className="font-clinical-mono text-primary font-semibold">73% of alerts</span>
        </div>
      </div>

      {/* Stat 3: Information Confidence */}
      <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-xs border border-outline-variant/20 hover:border-primary/25 transition-all flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <span className="font-clinical-mono text-[11px] font-semibold text-tertiary uppercase tracking-wider">
              Clinical Accuracy
            </span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-bold tracking-tight text-primary">
                96.4%
              </span>
              <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container tracking-wide">
                GRADE A
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-outline-variant/15 flex items-center justify-between text-xs text-on-surface-variant">
          <span className="font-medium text-on-surface-variant">Evidence-Based Rules</span>
          <span className="font-clinical-mono text-tertiary font-medium">Zero Hallucinations</span>
        </div>
      </div>
    </div>
  );
}
