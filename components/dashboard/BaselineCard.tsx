"use client";

import Link from "next/link";
import { ArrowRight, Activity, HeartPulse } from "lucide-react";
import { HealthProfile } from "@/types";

interface BaselineCardProps {
  profile: HealthProfile;
}

export function BaselineCard({ profile }: BaselineCardProps) {
  return (
    <section className="rounded-xl bg-surface-container-low shadow-sm p-space-md flex flex-col gap-space-sm border border-outline-variant/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-space-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <span className="font-clinical-mono text-xs uppercase tracking-wider text-primary font-semibold">
            Active Baseline
          </span>
        </div>
        <span className="font-clinical-mono text-xs px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-medium">
          {profile.conditions.length} active considerations
        </span>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {profile.conditions.map((condition) => (
          <div
            key={condition.id}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest shadow-xs border border-outline-variant/10"
          >
            {condition.id === "diabetes_type_2" ? (
              <Activity className="w-4 h-4 text-primary" />
            ) : (
              <HeartPulse className="w-4 h-4 text-secondary" />
            )}
            <span className="text-xs font-semibold text-on-surface">
              {condition.label}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-outline-variant/15 mt-1">
        <p className="text-xs text-on-surface-variant">
          Continuous screening for glycemic load (&lt;10 GL) &amp; sodium thresholds (&lt;400mg)
        </p>
        <Link
          href="/profile"
          className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline group"
        >
          <span>Review profile</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
