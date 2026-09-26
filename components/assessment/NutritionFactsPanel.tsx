"use client";

import { useState } from "react";
import { ChevronDown, BarChart2 } from "lucide-react";
import { NutritionFacts } from "@/types";

interface NutritionFactsPanelProps {
  nutrition: NutritionFacts;
}

export function NutritionFactsPanel({ nutrition }: NutritionFactsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div id="acc-nutrition" className="bg-surface-container-low rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-space-md flex items-center justify-between text-left hover:bg-surface-container transition-colors"
      >
        <div className="flex items-start gap-space-xs">
          <BarChart2 className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-on-surface">
                Nutrition Facts Panel
              </h2>
              <span className="font-clinical-mono text-[10px] text-tertiary bg-surface-container px-2 py-0.5 rounded-full font-semibold">
                SERVING: {nutrition.servingSize}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Glycemic load: {nutrition.glycemicLoadScore} · Sodium: {nutrition.sodiumMg}mg
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
        <div className="px-space-md pb-space-md pt-space-xs border-t border-surface-container-highest/60">
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/15 flex flex-col gap-2 font-mono text-xs">
            <div className="flex justify-between font-bold text-sm border-b pb-1 text-on-surface">
              <span>Calories</span>
              <span>{nutrition.calories} kcal</span>
            </div>

            <div className="flex justify-between text-on-surface border-b border-dashed py-1">
              <span>Total Carbohydrates</span>
              <span>{nutrition.totalCarbohydratesGrams}g</span>
            </div>

            <div className="flex justify-between pl-4 text-on-surface-variant py-0.5">
              <span>Dietary Fiber</span>
              <span>{nutrition.dietaryFiberGrams}g</span>
            </div>

            <div className="flex justify-between pl-4 text-on-surface-variant py-0.5">
              <span>Total Sugars</span>
              <span>{nutrition.totalSugarsGrams}g</span>
            </div>

            <div className="flex justify-between pl-4 text-amber-900 bg-amber-50 px-2 py-0.5 rounded font-semibold">
              <span>Sugar Alcohols (Maltitol Polyols)</span>
              <span>{nutrition.sugarAlcoholsPolyolsGrams}g</span>
            </div>

            <div className="flex justify-between font-semibold text-primary py-1 border-b">
              <span>Net Carbohydrates</span>
              <span>{nutrition.netCarbohydratesGrams}g</span>
            </div>

            <div className="flex justify-between text-on-surface border-b border-dashed py-1">
              <span>Protein</span>
              <span>{nutrition.proteinGrams}g</span>
            </div>

            <div className="flex justify-between text-on-surface border-b border-dashed py-1">
              <span>Total Fat (Saturated: {nutrition.saturatedFatGrams}g)</span>
              <span>{nutrition.totalFatGrams}g</span>
            </div>

            <div className="flex justify-between font-semibold text-on-surface py-1">
              <span>Sodium</span>
              <span>{nutrition.sodiumMg}mg</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
