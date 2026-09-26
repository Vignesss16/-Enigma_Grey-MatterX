"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, FileText, FlaskConical, Upload, Sparkles } from "lucide-react";

export function DoctorIngestionBay() {
  const router = useRouter();
  const [ingredientText, setIngredientText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const sampleIngredients =
    "Wheat flour (maida 68%), edible vegetable oil (palm), iodised salt (1.4%), raising agents (500ii, 503ii), maltodextrin, maltitol syrup, artificial flavouring.";

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      router.push("/assessment/nutrichoice-digestive");
    }, 600);
  };

  return (
    <div className="rounded-2xl bg-surface-container-lowest p-4 sm:p-6 shadow-xs border border-outline-variant/20 flex flex-col gap-4 sm:gap-5">
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-on-surface tracking-tight">
              Evaluate Food Item for Patient
            </h2>
            <p className="text-xs text-on-surface-variant">
              Cross-references verified nutritional databases against patient's clinical thresholds
            </p>
          </div>
        </div>
        <span className="text-xs text-primary font-bold px-2.5 py-1 rounded-lg bg-primary-fixed/30 border border-primary/20 shrink-0">
          CDS Ready
        </span>
      </div>

      {/* Ingestion Bay 2-Column: Photo Dropzone & Text Paste */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dropzone Box */}
        <label className="relative group cursor-pointer rounded-2xl bg-surface-container-low/70 hover:bg-surface-container-high/60 transition-all p-5 flex flex-col items-center justify-center text-center gap-2 min-h-[160px] border-2 border-dashed border-outline-variant/40 hover:border-primary">
          <div className="w-12 h-12 rounded-2xl bg-surface-container-lowest shadow-xs flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <Camera className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xs font-bold text-on-surface">
            Upload Packaging Photo or Barcode
          </span>
          <span className="text-[11px] text-on-surface-variant">
            Drag packaging front/back or instant snap
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={() => handleRunAnalysis()}
          />
        </label>

        {/* Manual Ingredients Paste Box */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>Direct Ingredient Analysis</span>
            </label>
            <button
              type="button"
              onClick={() => setIngredientText(sampleIngredients)}
              className="text-xs text-primary hover:underline font-bold"
            >
              Paste Sample
            </button>
          </div>
          <textarea
            rows={4}
            value={ingredientText}
            onChange={(e) => setIngredientText(e.target.value)}
            placeholder="Enter or paste ingredient label text (e.g., Whole wheat flour, Palm oil, Maltodextrin, Sodium benzoate)..."
            className="w-full h-full min-h-[120px] p-3 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline text-xs focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none border border-outline-variant/15"
          />
        </div>
      </div>

      {/* Clinical Trigger Parameters Preview Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 bg-surface-container-low/50 rounded-xl p-3 border border-outline-variant/15">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-on-surface-variant font-bold">Active Thresholds:</span>
          <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200/80">
            Glycemic Index &gt; 55
          </span>
          <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-rose-100 text-rose-900 border border-rose-200/80">
            Peanut Derivatives
          </span>
          <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-surface-container-high text-on-surface-variant border border-outline-variant/20">
            Sodium &gt; 400mg
          </span>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-primary hover:bg-surface-tint text-on-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAnalyzing ? "Evaluating..." : "Run Compound Evaluation"}</span>
        </button>
      </div>
    </div>
  );
}
