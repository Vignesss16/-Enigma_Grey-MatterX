"use client";

import { useState } from "react";
import { ArrowLeftRight, Check, FileText } from "lucide-react";
import { AlternativeProduct } from "@/types";

interface AlternativeCardProps {
  product: AlternativeProduct;
  onSwap: (productName: string) => void;
}

export function AlternativeCard({ product, onSwap }: AlternativeCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [swapped, setSwapped] = useState(false);

  const handleSwapClick = () => {
    setSwapped(true);
    onSwap(product.name);
    setTimeout(() => {
      setSwapped(false);
    }, 3000);
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/20 flex flex-col gap-space-sm transition-all hover:shadow-md">
      {/* Product Top Header */}
      <div className="flex items-start gap-space-md">
        <div className="w-16 h-16 rounded-xl bg-surface-container overflow-hidden flex-shrink-0 relative border border-outline-variant/20">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between gap-space-xs">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-clinical-mono text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {product.compatibilityPercentage}% Compatibility
            </span>
            <span className="font-clinical-mono text-xs text-outline font-medium">
              ID: {product.code}
            </span>
          </div>

          <h2 className="text-base font-semibold text-on-surface mt-1 truncate">
            {product.name}
          </h2>
          <span className="text-xs text-primary font-medium">
            Better aligned with your profile
          </span>
        </div>
      </div>

      {/* Risk Chips */}
      <div className="flex flex-wrap gap-1.5 mt-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container-low text-on-surface text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="font-medium">Net Carbs: {product.netCarbsGrams}g</span>
          <span className="font-clinical-mono text-primary font-semibold">
            ({product.glycemicCategory})
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container-low text-on-surface text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="font-medium">Added Sweeteners: {product.addedSweetenersGrams}g</span>
          <span className="font-clinical-mono text-primary font-semibold">
            ({product.sweetenerNote})
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container-low text-on-surface text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="font-medium">Sodium: {product.sodiumMg}mg</span>
          <span className="font-clinical-mono text-primary font-semibold">
            ({product.sodiumNote})
          </span>
        </div>
      </div>

      {/* Clinical Rationale Box */}
      <div className="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-1 mt-1 border border-outline-variant/10">
        <div className="flex items-center gap-1 text-primary">
          <FileText className="w-3.5 h-3.5 text-primary" />
          <span className="font-clinical-mono text-[10px] font-bold uppercase tracking-wider text-primary">
            Clinical Rationale
          </span>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          {product.clinicalRationale}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-space-sm mt-1 pt-1">
        <button
          onClick={handleSwapClick}
          disabled={swapped}
          className={`flex-1 min-h-[40px] px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
            swapped
              ? "bg-secondary text-on-secondary"
              : "bg-primary text-on-primary hover:bg-surface-tint shadow-xs"
          }`}
        >
          {swapped ? (
            <>
              <Check className="w-4 h-4" />
              <span>Swapped in food log!</span>
            </>
          ) : (
            <>
              <ArrowLeftRight className="w-4 h-4" />
              <span>Swap in food log</span>
            </>
          )}
        </button>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="min-h-[40px] px-3.5 py-2 bg-surface-container text-on-surface text-xs font-semibold rounded-lg hover:bg-surface-container-high transition-colors"
        >
          {showDetails ? "Hide details" : "View details"}
        </button>
      </div>

      {/* Expandable Details Sheet */}
      {showDetails && (
        <div className="flex flex-col gap-1.5 pt-space-xs mt-1 bg-surface-container-low/60 p-2.5 rounded-lg border border-outline-variant/20 animate-in fade-in duration-200">
          <div className="flex justify-between items-center text-on-surface font-clinical-mono text-xs font-semibold">
            <span>GLYCEMIC LOAD: {product.glycemicLoad}</span>
            <span>FIBER DENSITY: {product.fiberDensity}</span>
          </div>
          <p className="text-xs text-on-surface-variant">
            {product.detailsSummary}
          </p>
        </div>
      )}
    </div>
  );
}
