"use client";

import { useState } from "react";
import { ChevronDown, GitBranch, ArrowDown } from "lucide-react";
import { ClinicalFlag } from "@/types";

interface ClinicalChainAccordionProps {
  flags: ClinicalFlag[];
}

export function ClinicalChainAccordion({ flags }: ClinicalChainAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const primaryFlag = flags[0];

  if (!primaryFlag) return null;

  return (
    <div id="acc-flags" className="bg-surface-container-low rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-space-md flex items-center justify-between text-left hover:bg-surface-container transition-colors"
      >
        <div className="flex items-start gap-space-xs">
          <GitBranch className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-on-surface">
                Why this was flagged
              </h2>
              <span className="font-clinical-mono text-[10px] text-primary font-bold bg-primary-fixed/40 px-2 py-0.5 rounded-full">
                CLINICAL CDS
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              See how your profile connects to this ingredient
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
          {/* Step 1 */}
          <div className="bg-surface-container-lowest p-space-sm rounded-lg flex items-start gap-space-sm shadow-xs border border-outline-variant/15 mt-1">
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="font-clinical-mono text-xs font-bold">1</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-clinical-mono text-[10px] text-on-surface-variant block uppercase tracking-wider font-semibold">
                Your Profile
              </span>
              <span className="text-xs font-bold text-on-surface">
                Diabetes (Type 2 Target Baseline)
              </span>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {primaryFlag.threeStepChain.profileStep}
              </p>
            </div>
          </div>

          {/* Connector Arrow */}
          <div className="flex justify-center -my-1 z-10">
            <div className="bg-surface-container-highest text-on-surface-variant rounded-full p-1 flex items-center justify-center">
              <ArrowDown className="w-3 h-3 text-outline" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-surface-container-lowest p-space-sm rounded-lg flex items-start gap-space-sm shadow-xs border border-outline-variant/15">
            <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="font-clinical-mono text-xs font-bold">2</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-clinical-mono text-[10px] text-amber-900 block uppercase tracking-wider font-semibold">
                Food Information
              </span>
              <span className="text-xs font-bold text-on-surface">
                Refined wheat flour listed prominently
              </span>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {primaryFlag.threeStepChain.foodInfoStep}
              </p>
            </div>
          </div>

          {/* Connector Arrow */}
          <div className="flex justify-center -my-1 z-10">
            <div className="bg-surface-container-highest text-on-surface-variant rounded-full p-1 flex items-center justify-center">
              <ArrowDown className="w-3 h-3 text-outline" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-surface-container-lowest p-space-sm rounded-lg flex items-start gap-space-sm shadow-xs border border-outline-variant/15">
            <div className="w-6 h-6 rounded-full bg-red-100 text-red-900 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="font-clinical-mono text-xs font-bold">3</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-clinical-mono text-[10px] text-red-900 block uppercase tracking-wider font-semibold">
                Potential Relevance
              </span>
              <span className="text-xs font-bold text-on-surface">
                May matter when managing carbohydrate intake
              </span>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {primaryFlag.threeStepChain.potentialRelevanceStep}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
