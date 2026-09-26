"use client";

import { Info } from "lucide-react";
import { DiningOutDish } from "@/types";

interface DishAnalysisCardProps {
  dish: DiningOutDish;
}

export function DishAnalysisCard({ dish }: DishAnalysisCardProps) {
  return (
    <div className="flex flex-col gap-space-md">
      {/* Visual reference card */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-surface-container-lowest shadow-sm border border-outline-variant/20">
        <div className="relative w-full h-44 bg-surface-container-high overflow-hidden">
          <img
            src={dish.imageUrl}
            alt={dish.dishName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/40 to-transparent" />
          <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-surface-container-lowest">
            <div>
              <span className="font-clinical-mono text-[10px] tracking-wider uppercase opacity-80">
                Evaluating Dish
              </span>
              <p className="text-lg font-bold text-surface-container-lowest leading-snug">
                {dish.dishName}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-surface-container-lowest/20 backdrop-blur-md text-surface-container-lowest font-clinical-mono text-xs font-semibold">
              EST. {dish.estimatedCalories} kcal
            </span>
          </div>
        </div>

        {/* Confidence Indicator Panel */}
        <div className="p-3.5 bg-surface-container-low flex items-start gap-3 border-t border-outline-variant/10">
          <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 text-tertiary">
            <Info className="w-4 h-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-on-surface">
                Information available: {dish.confidenceLevel}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-medium">
                Standard culinary heuristic
              </span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {dish.uncertaintyDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Potential Concerns List */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-on-surface">
            Potential Concerns
          </h2>
          <span className="text-[10px] font-clinical-mono text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
            TARGET: DIABETES &amp; HYPERTENSION
          </span>
        </div>

        {dish.concerns.map((concern, idx) => {
          const isHigh = concern.level === "high" || concern.level === "critical";
          const isMod = concern.level === "moderate";

          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant/15 flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isHigh ? "bg-red-500" : isMod ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                  />
                  <span className="text-xs font-bold text-on-surface">
                    {concern.title}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    isHigh
                      ? "bg-red-50 text-red-900"
                      : isMod
                      ? "bg-amber-50 text-amber-900"
                      : "bg-emerald-50 text-emerald-900"
                  }`}
                >
                  {isHigh ? "High concern" : isMod ? "Moderate concern" : "Low concern"}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {concern.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
