"use client";

import { ClinicalFlag } from "@/types";

interface RiskChipsProps {
  flags: ClinicalFlag[];
  onSelectFlag?: (flagId: string) => void;
}

export function RiskChips({ flags, onSelectFlag }: RiskChipsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
      <button
        onClick={() => onSelectFlag && onSelectFlag("acc-flags")}
        className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FEF3C7] text-[#92400E] text-xs font-semibold shadow-xs hover:bg-amber-100 active:scale-95 transition-all"
      >
        <span className="w-2 h-2 rounded-full bg-[#D97706]" />
        <span>Refined carbohydrates</span>
      </button>

      <button
        onClick={() => onSelectFlag && onSelectFlag("acc-ingredients")}
        className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-highest text-on-surface text-xs font-semibold shadow-xs hover:bg-surface-container active:scale-95 transition-all"
      >
        <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
        <span>Added sweeteners (Maltitol)</span>
      </button>

      <button
        onClick={() => onSelectFlag && onSelectFlag("acc-nutrition")}
        className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E8F5E9] text-[#1B5E20] text-xs font-semibold shadow-xs hover:bg-emerald-100 active:scale-95 transition-all"
      >
        <span className="w-2 h-2 rounded-full bg-[#10B981]" />
        <span>Sodium (Compliant)</span>
      </button>
    </div>
  );
}
