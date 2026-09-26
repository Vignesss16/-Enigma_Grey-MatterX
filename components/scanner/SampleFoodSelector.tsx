"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Upload } from "lucide-react";

export function SampleFoodSelector() {
  const samples = [
    {
      id: "nutrichoice-digestive",
      title: "NutriChoice Digestive",
      subtitle: "3 Flags: High GI + Maltitol Polyols",
      badge: "Flagged",
      color: "border-amber-300 bg-amber-50/50 hover:bg-amber-50",
      badgeClass: "bg-amber-100 text-amber-900",
    },
    {
      id: "instant-noodles",
      title: "Maggi Masala Noodles",
      subtitle: "1 Flag: Sodium Spike (840mg)",
      badge: "High Sodium",
      color: "border-red-300 bg-red-50/50 hover:bg-red-50",
      badgeClass: "bg-red-100 text-red-900",
    },
    {
      id: "peanut-chikki",
      title: "Peanut Chikki Bar",
      subtitle: "1 Critical: Severe Allergen Trigger",
      badge: "Allergen",
      color: "border-red-400 bg-red-50/60 hover:bg-red-50",
      badgeClass: "bg-red-200 text-red-950 font-bold",
    },
  ];

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-space-sm pt-space-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-primary">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Quick Benchmark Presets
          </span>
        </div>
        <label className="text-xs font-medium text-primary hover:underline cursor-pointer flex items-center gap-1">
          <Upload className="w-3.5 h-3.5" />
          <span>Upload photo</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                window.location.href = "/scanner/processing?item=nutrichoice-digestive";
              }
            }}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {samples.map((sample) => (
          <Link
            key={sample.id}
            href={`/scanner/processing?item=${sample.id}`}
            className={`p-3 rounded-xl border transition-all flex items-center justify-between shadow-xs ${sample.color}`}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-on-surface">
                  {sample.title}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${sample.badgeClass}`}>
                  {sample.badge}
                </span>
              </div>
              <span className="text-xs text-on-surface-variant mt-0.5">
                {sample.subtitle}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-primary font-semibold">
              <span>Run Diagnostic</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
