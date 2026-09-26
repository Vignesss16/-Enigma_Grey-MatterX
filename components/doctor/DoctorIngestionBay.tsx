"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, FileText, FlaskConical, Upload } from "lucide-react";

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
    <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-outline-variant/20 flex flex-col gap-space-md">
      <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/15">
        <div className="flex items-center gap-space-sm">
          <span className="w-8 h-8 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-primary-fixed" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-on-surface">
              Evaluate Food Item for Patient
            </h2>
            <p className="text-xs text-on-surface-variant">
              Cross-references verified nutritional databases against patient's clinical thresholds
            </p>
          </div>
        </div>
        <span className="font-clinical-mono text-xs text-tertiary px-2 py-0.5 rounded bg-surface-container font-semibold">
          CDS V4.1 READY
        </span>
      </div>

      {/* Ingestion Bay 2-Column: Photo Dropzone & Text Paste */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {/* Dropzone Box */}
        <label className="relative group cursor-pointer rounded-xl bg-surface-container-low/70 hover:bg-surface-container-high/60 transition-all p-space-lg flex flex-col items-center justify-center text-center gap-2 min-h-[170px] border-2 border-dashed border-outline-variant/40 hover:border-primary">
          <div className="w-12 h-12 rounded-full bg-surface-container-lowest shadow-xs flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <Camera className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xs font-semibold text-on-surface">
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
            <label className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>Direct Ingredient Analysis</span>
            </label>
            <button
              type="button"
              onClick={() => setIngredientText(sampleIngredients)}
              className="font-clinical-mono text-[11px] text-primary hover:underline font-semibold"
            >
              Paste Sample
            </button>
          </div>
          <textarea
            rows={4}
            value={ingredientText}
            onChange={(e) => setIngredientText(e.target.value)}
            placeholder="Enter or paste ingredient label text (e.g., Whole wheat flour, Palm oil, Maltodextrin, Sodium benzoate)..."
            className="w-full h-full min-h-[120px] p-3 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline text-xs focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none border border-outline-variant/15"
          />
        </div>
      </div>

      {/* Clinical Trigger Parameters Preview Bar */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm pt-2 bg-surface-container-low/50 rounded-xl p-space-sm border border-outline-variant/15">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-clinical-mono text-tertiary font-semibold">Active Filter Parameters:</span>
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FEF3C7] text-[#92400E]">
            Glycemic Index &gt; 55
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FEE2E2] text-[#991B1B]">
            Peanut Derivatives
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-container-high text-on-surface-variant">
            Sodium &gt; 400mg
          </span>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-surface-tint active:scale-95 transition-all shadow-sm ml-auto"
        >
          <FlaskConical className="w-4 h-4 text-primary-fixed" />
          <span>{isAnalyzing ? "Running Diagnostic..." : "Run Clinical Risk Analysis"}</span>
        </button>
      </div>
    </div>
  );
}
