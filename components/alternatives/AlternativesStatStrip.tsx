"use client";

export function AlternativesStatStrip() {
  return (
    <div className="grid grid-cols-3 gap-space-xs">
      <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-xs border border-outline-variant/15 flex flex-col items-center text-center">
        <span className="font-clinical-mono text-[11px] text-outline">
          Evaluated
        </span>
        <span className="text-sm sm:text-base font-bold text-primary mt-0.5">
          3 Found
        </span>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-xs border border-outline-variant/15 flex flex-col items-center text-center">
        <span className="font-clinical-mono text-[11px] text-outline">
          Max Fit
        </span>
        <span className="text-sm sm:text-base font-bold text-primary mt-0.5">
          96%
        </span>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-xs border border-outline-variant/15 flex flex-col items-center text-center">
        <span className="font-clinical-mono text-[11px] text-outline">
          Hidden Polyols
        </span>
        <span className="text-sm sm:text-base font-bold text-primary mt-0.5">
          0g Detected
        </span>
      </div>
    </div>
  );
}
