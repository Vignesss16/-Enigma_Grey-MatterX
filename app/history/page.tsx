"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, ChevronRight, CheckCircle2, AlertTriangle, ShieldX } from "lucide-react";
import { MobileHeader } from "@/components/navigation/MobileHeader";
import { ClinicalAnalyticsChart } from "@/components/dashboard/ClinicalAnalyticsChart";
import { BENCHMARK_SCANNED_FOODS } from "@/lib/mock-data";

export default function HistoryPage() {
  const [filter, setFilter] = useState<"all" | "flagged" | "safe">("all");

  const historyItems = [
    {
      id: "nutrichoice-digestive",
      title: "NutriChoice Sugar-Free Digestive",
      time: "2 mins ago",
      batch: "Batch #9042",
      status: "flagged",
      tag: "High Glycemic Load & Maltitol",
      gl: 14.2,
      sodium: 145,
    },
    {
      id: "instant-noodles",
      title: "Classic Instant Masala Noodles",
      time: "2 hours ago",
      batch: "Batch #4102",
      status: "flagged",
      tag: "Sodium density (840mg)",
      gl: 28.5,
      sodium: 840,
    },
    {
      id: "peanut-chikki",
      title: "Traditional Peanut & Jaggery Chikki",
      time: "Yesterday",
      batch: "Batch #CH-11",
      status: "critical",
      tag: "Allergen trigger (Peanut)",
      gl: 18.0,
      sodium: 28,
    },
    {
      id: "rolled-oats-crackers",
      title: "True Elements Rolled Oats Crackers",
      time: "3 days ago",
      batch: "TE-782",
      status: "safe",
      tag: "Compliant swap (94% Fit)",
      gl: 4.1,
      sodium: 95,
    },
  ];

  const filtered = historyItems.filter((item) => {
    if (filter === "flagged") return item.status === "flagged" || item.status === "critical";
    if (filter === "safe") return item.status === "safe";
    return true;
  });

  return (
    <>
      <MobileHeader title="Food History" />

      <div className="px-gutter lg:px-space-xl py-space-sm max-w-4xl mx-auto flex flex-col gap-space-lg">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-outline-variant/15">
          <div>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">
              Clinical Food History
            </h1>
            <p className="text-xs text-on-surface-variant">
              Chronological ledger of evaluated products and dietary compliance.
            </p>
          </div>

          <button
            onClick={() => alert("Exporting PDF Summary for physician consultation...")}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors"
          >
            <Download className="w-4 h-4 text-primary" />
            <span>Export Physician Report</span>
          </button>
        </div>

        {/* Analytics Chart */}
        <ClinicalAnalyticsChart />

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === "all"
                ? "bg-primary text-on-primary shadow-xs"
                : "bg-surface-container text-on-surface hover:bg-surface-container-high"
            }`}
          >
            All Logs ({historyItems.length})
          </button>
          <button
            onClick={() => setFilter("flagged")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === "flagged"
                ? "bg-amber-100 text-amber-900 shadow-xs"
                : "bg-surface-container text-on-surface hover:bg-surface-container-high"
            }`}
          >
            Flagged Triggers
          </button>
          <button
            onClick={() => setFilter("safe")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === "safe"
                ? "bg-emerald-100 text-emerald-900 shadow-xs"
                : "bg-surface-container text-on-surface hover:bg-surface-container-high"
            }`}
          >
            Compliant
          </button>
        </div>

        {/* List of Scanned Foods */}
        <div className="rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/20 divide-y divide-outline-variant/15 overflow-hidden">
          {filtered.map((item) => {
            const isCritical = item.status === "critical";
            const isFlagged = item.status === "flagged";

            return (
              <Link
                key={item.id}
                href={
                  item.id === "rolled-oats-crackers"
                    ? "/alternatives"
                    : `/assessment/${item.id}`
                }
                className="p-4 flex items-center justify-between gap-space-sm hover:bg-surface-container-low transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isCritical
                        ? "bg-red-100 text-red-700"
                        : isFlagged
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {isCritical ? (
                      <ShieldX className="w-5 h-5" />
                    ) : isFlagged ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-on-surface">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-clinical-mono text-outline">
                        {item.batch}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isCritical
                            ? "bg-red-100 text-red-900"
                            : isFlagged
                            ? "bg-amber-100 text-amber-900"
                            : "bg-emerald-50 text-emerald-800"
                        }`}
                      >
                        {item.tag}
                      </span>
                      <span className="text-[11px] font-clinical-mono text-on-surface-variant">
                        GL: {item.gl} · {item.sodium}mg sodium
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-clinical-mono text-xs text-outline hidden sm:inline">
                    {item.time}
                  </span>
                  <ChevronRight className="w-4 h-4 text-outline" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
