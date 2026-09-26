"use client";

import Link from "next/link";
import { ArrowRight, Activity, HeartPulse } from "lucide-react";
import { HealthProfile } from "@/types";

interface BaselineCardProps {
  profile: HealthProfile;
}

export function BaselineCard({ profile }: BaselineCardProps) {
  const conditions = profile?.conditions || [];

  return (
    <section className="rounded-2xl bg-surface-container-low shadow-xs p-5 flex flex-col gap-3.5 border border-outline-variant/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-clinical-mono text-[11px] uppercase tracking-wider text-primary font-semibold">
            Clinical Health Baseline
          </span>
        </div>
        <span className="font-clinical-mono text-xs px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-medium">
          {conditions.length} Monitored {conditions.length === 1 ? "Condition" : "Conditions"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 pt-0.5">
        {conditions.length > 0 ? (
          conditions.map((condition: any) => {
            const condId = typeof condition === "string" ? condition : condition?.id;
            const condLabel = typeof condition === "string" ? condition : (condition?.label || condition?.title || condId);
            const isDiabetes = condId === "diabetes_type_2";

            return (
              <div
                key={condId || condLabel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-lowest shadow-2xs border border-outline-variant/15"
              >
                {isDiabetes ? (
                  <Activity className="w-4 h-4 text-primary shrink-0" />
                ) : (
                  <HeartPulse className="w-4 h-4 text-secondary shrink-0" />
                )}
                <span className="text-xs font-semibold text-on-surface">
                  {condLabel}
                </span>
              </div>
            );
          })
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-lowest shadow-2xs border border-outline-variant/15 text-xs text-on-surface-variant font-medium">
            <Activity className="w-4 h-4 text-primary shrink-0" />
            <span>Standard Nutritional Screening Baseline</span>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-outline-variant/15 flex flex-col gap-2 mt-0.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-on-surface-variant">Glycemic Load Threshold</span>
          <span className="font-clinical-mono font-semibold text-on-surface">≤ 10 GL / serving</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-on-surface-variant">Portion Sodium Ceiling</span>
          <span className="font-clinical-mono font-semibold text-on-surface">≤ 400 mg / serving</span>
        </div>
        <div className="pt-1.5 flex items-center justify-between border-t border-outline-variant/10">
          <span className="text-[11px] text-tertiary">Automated clinical cross-check</span>
          <Link
            href="/profile"
            className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline group"
          >
            <span>Update Profile</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
