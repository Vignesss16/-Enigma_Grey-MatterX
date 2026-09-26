"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BENCHMARK_SCANNED_FOODS } from "@/lib/mock-data";

export function RecentChecksFeed() {
  const items = [
    {
      id: "nutrichoice-digestive",
      name: "NutriChoice Sugar-Free Digestive",
      time: "2 mins ago",
      flagText: "3 Clinical Flags · Refined Carbs & Maltitol",
      badgeColor: "bg-amber-50 text-amber-900 border border-amber-200/70",
      dotColor: "bg-amber-600",
      href: "/assessment/nutrichoice-digestive",
    },
    {
      id: "instant-noodles",
      name: "Instant Noodles (Masala)",
      time: "2 hours ago",
      flagText: "High Sodium Warning · 840 mg / serving",
      badgeColor: "bg-rose-50 text-rose-900 border border-rose-200/70",
      dotColor: "bg-rose-600",
      href: "/assessment/instant-noodles",
    },
    {
      id: "peanut-chikki",
      name: "Peanut Chikki Bar",
      time: "Yesterday",
      flagText: "Allergen Alert · Peanut Protein Detected",
      badgeColor: "bg-rose-50 text-rose-900 border border-rose-200/70",
      dotColor: "bg-rose-600",
      href: "/assessment/peanut-chikki",
    },
  ];

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-on-surface tracking-tight">
          Recent Food Assessments
        </h3>
        <Link
          href="/history"
          className="text-xs text-primary font-semibold hover:underline"
        >
          View Full History →
        </Link>
      </div>

      <div className="rounded-2xl bg-surface-container-lowest shadow-xs border border-outline-variant/20 overflow-hidden divide-y divide-outline-variant/15">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="p-4 flex flex-col gap-2 transition-colors hover:bg-surface-container-low/70 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                {item.name}
              </span>
              <span className="font-clinical-mono text-[11px] text-outline font-medium">
                {item.time}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium shadow-2xs ${item.badgeColor}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor} shrink-0`} />
                <span>{item.flagText}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-outline group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
