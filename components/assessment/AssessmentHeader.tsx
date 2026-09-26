"use client";

import { FoodProduct } from "@/types";

interface AssessmentHeaderProps {
  food: FoodProduct;
}

export function AssessmentHeader({ food }: AssessmentHeaderProps) {
  const flagsCount = food.clinicalFlags.length;

  return (
    <div className="bg-surface-container-low p-space-md rounded-xl shadow-sm border border-outline-variant/20 relative overflow-hidden">
      <div className="flex items-start justify-between gap-space-sm">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-space-xs mb-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-clinical-mono text-[10px] tracking-wider uppercase font-semibold">
              FOOD ASSESSMENT
            </span>
            <span className="inline-flex items-center gap-1 text-on-surface-variant font-clinical-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Verified OCR
            </span>
          </div>

          <h1 className="text-xl font-bold text-on-surface tracking-tight truncate">
            {food.name}
          </h1>

          <p className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
            <span>{food.brand} · {food.category}</span>
            <span>•</span>
            <span className="text-primary font-medium font-clinical-mono">
              Batch {food.batchNumber || "#9042"}
            </span>
          </p>
        </div>

        {/* Studio Product Thumbnail */}
        <div className="w-16 h-16 rounded-xl bg-surface-container overflow-hidden flex-shrink-0 relative shadow-sm border border-outline-variant/20">
          <img
            src={food.imageUrl}
            alt={food.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-1 right-1 bg-surface-container-lowest/90 px-1 py-0.5 rounded text-[9px] font-clinical-mono text-on-surface font-semibold shadow-xs">
            SCAN
          </div>
        </div>
      </div>

      {/* Status banner */}
      <div className="mt-space-md pt-space-xs border-t border-surface-container-highest flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
          </span>
          <span className="text-xs sm:text-sm font-semibold text-amber-900">
            {food.overallStatus === "flagged"
              ? `ATTENTION — ${flagsCount} areas need a closer look`
              : "COMPLIANT — Aligned with active profile"}
          </span>
        </div>
        <span className="font-clinical-mono text-xs px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-semibold">
          {flagsCount} Flags
        </span>
      </div>
    </div>
  );
}
