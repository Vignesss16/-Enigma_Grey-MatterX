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
      flagText: "3 Flags · Refined carbohydrates & Maltitol",
      badgeColor: "bg-[#FEF3C7] text-[#92400E]",
      dotColor: "bg-[#D97706]",
      href: "/assessment/nutrichoice-digestive",
    },
    {
      id: "instant-noodles",
      name: "Instant Noodles (Masala)",
      time: "2 hours ago",
      flagText: "High sodium · 840mg / serve",
      badgeColor: "bg-[#FEE2E2] text-[#991B1B]",
      dotColor: "bg-[#EF4444]",
      href: "/assessment/instant-noodles",
    },
    {
      id: "peanut-chikki",
      name: "Peanut Chikki Bar",
      time: "Yesterday",
      flagText: "Allergen detected · Peanut protein",
      badgeColor: "bg-[#FEE2E2] text-[#991B1B]",
      dotColor: "bg-[#DC2626]",
      href: "/assessment/peanut-chikki",
    },
  ];

  return (
    <section className="flex flex-col gap-space-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-on-surface">
          Recently Checked Foods
        </h3>
        <Link
          href="/history"
          className="text-xs text-primary font-medium hover:underline"
        >
          View all history
        </Link>
      </div>

      <div className="rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/20 flex flex-col overflow-hidden divide-y divide-outline-variant/15">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="p-3.5 flex flex-col gap-1.5 transition-colors hover:bg-surface-container-low cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-on-surface">
                {item.name}
              </span>
              <span className="font-clinical-mono text-xs text-outline">
                {item.time}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium ${item.badgeColor}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor}`} />
                <span>{item.flagText}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-outline" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
