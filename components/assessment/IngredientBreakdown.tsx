"use client";

import { useState } from "react";
import { ChevronDown, ListChecks } from "lucide-react";
import { IngredientItem } from "@/types";

interface IngredientBreakdownProps {
  ingredients: IngredientItem[];
}

export function IngredientBreakdown({ ingredients }: IngredientBreakdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div id="acc-ingredients" className="bg-surface-container-low rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-space-md flex items-center justify-between text-left hover:bg-surface-container transition-colors"
      >
        <div className="flex items-start gap-space-xs">
          <ListChecks className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-on-surface">
                Ingredient Breakdown
              </h2>
              <span className="font-clinical-mono text-[10px] text-tertiary bg-surface-container px-2 py-0.5 rounded-full font-semibold">
                {ingredients.length} ITEMS
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Verified order of declared volume &amp; chemical additives
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-on-surface-variant transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-space-md pb-space-md pt-space-xs border-t border-surface-container-highest/60 flex flex-col gap-2">
          {ingredients.map((ing) => {
            const isHigh = ing.riskSeverity === "high" || ing.riskSeverity === "critical";
            const isMod = ing.riskSeverity === "moderate";

            return (
              <div
                key={ing.id}
                className="bg-surface-container-lowest p-space-sm rounded-lg flex items-start justify-between gap-space-sm shadow-xs border border-outline-variant/10"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-clinical-mono text-[10px] text-outline font-semibold">
                      #{ing.declaredOrder}
                    </span>
                    <span className="text-xs font-semibold text-on-surface">
                      {ing.name}
                    </span>
                    {ing.eNumber && (
                      <span className="font-clinical-mono text-[9px] px-1.5 py-0.2 rounded bg-surface-container text-tertiary">
                        {ing.eNumber}
                      </span>
                    )}
                  </div>
                  {ing.clinicalNote && (
                    <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                      {ing.clinicalNote}
                    </p>
                  )}
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    isHigh
                      ? "bg-red-100 text-red-900"
                      : isMod
                      ? "bg-amber-100 text-amber-900"
                      : "bg-emerald-50 text-emerald-800"
                  }`}
                >
                  {isHigh ? "High Impact" : isMod ? "Moderate" : "Safe"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
