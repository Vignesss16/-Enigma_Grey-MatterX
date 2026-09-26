"use client";

export function GlycemicLoadPanel() {
  return (
    <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm border border-outline-variant/20 flex flex-col gap-space-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-on-surface">
          Relative Glycemic Load
        </h3>
        <span className="font-clinical-mono text-[10px] text-tertiary px-2 py-0.5 rounded bg-surface-container font-semibold">
          METRIC COMPARISON
        </span>
      </div>

      <div className="w-full bg-surface-container-lowest rounded-xl p-space-sm flex flex-col gap-space-xs border border-outline-variant/15">
        {/* Original Scanned Item */}
        <div className="flex items-center justify-between text-on-surface font-clinical-mono text-xs font-medium">
          <span className="text-error font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-error" />
            NutriChoice Digestive
          </span>
          <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[11px] font-bold">
            High (78%)
          </span>
        </div>
        <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-error h-full rounded-full transition-all duration-700"
            style={{ width: "78%" }}
          />
        </div>

        {/* Top Alternative */}
        <div className="flex items-center justify-between text-on-surface font-clinical-mono text-xs font-medium mt-space-xs">
          <span className="text-primary font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Top Alternative (Seed Thins)
          </span>
          <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold">
            Low (22%)
          </span>
        </div>
        <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-700"
            style={{ width: "22%" }}
          />
        </div>
      </div>

      <p className="text-xs text-on-surface-variant leading-relaxed">
        Based on carbohydrate and sugar-alcohol content of declared ingredients — not a blood sugar measurement.
      </p>
    </div>
  );
}
