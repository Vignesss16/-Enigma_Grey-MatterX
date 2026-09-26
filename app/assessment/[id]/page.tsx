"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, RotateCcw } from "lucide-react";
import { MobileHeader } from "@/components/navigation/MobileHeader";
import { AssessmentHeader } from "@/components/assessment/AssessmentHeader";
import { RiskChips } from "@/components/assessment/RiskChips";
import { ClinicalChainAccordion } from "@/components/assessment/ClinicalChainAccordion";
import { IngredientBreakdown } from "@/components/assessment/IngredientBreakdown";
import { NutritionFactsPanel } from "@/components/assessment/NutritionFactsPanel";
import { BENCHMARK_SCANNED_FOODS } from "@/lib/mock-data";

export default function AssessmentPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "nutrichoice-digestive";

  const food = BENCHMARK_SCANNED_FOODS[id] || BENCHMARK_SCANNED_FOODS["nutrichoice-digestive"];

  return (
    <>
      <MobileHeader title="Ingredient Analysis" showBack />

      <div className="px-gutter lg:px-space-xl py-space-sm max-w-2xl mx-auto flex flex-col gap-space-md">
        {/* Assessment Card Header */}
        <AssessmentHeader food={food} />

        {/* Compact risk chips */}
        <RiskChips flags={food.clinicalFlags} />

        {/* Progressive Disclosure Accordions */}
        <div className="flex flex-col gap-space-sm mt-1">
          <ClinicalChainAccordion flags={food.clinicalFlags} />
          <IngredientBreakdown ingredients={food.ingredients} />
          <NutritionFactsPanel nutrition={food.nutrition} />
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row gap-space-sm mt-space-sm pt-space-xs pb-space-lg">
          <Link
            href="/alternatives"
            className="flex-1 min-h-[46px] px-4 py-3 bg-primary text-on-primary text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm hover:bg-surface-tint active:scale-[0.99] transition-all"
          >
            <span>Explore Safer Alternatives</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/scanner"
            className="min-h-[46px] px-4 py-3 bg-surface-container text-on-surface text-xs font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Scan Another Food</span>
          </Link>
        </div>
      </div>
    </>
  );
}
