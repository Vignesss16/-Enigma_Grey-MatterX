"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Download, History, ChevronRight } from "lucide-react";
import { DOCTOR_ASSESSMENTS_TABLE } from "@/lib/mock-data";

export function DoctorAssessmentsTable() {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = DOCTOR_ASSESSMENTS_TABLE.filter(
    (item) =>
      item.foodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.keyIngredient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-outline-variant/20 flex flex-col gap-space-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-xs border-b border-outline-variant/15">
        <div className="flex items-center gap-space-sm">
          <span className="w-8 h-8 rounded-lg bg-surface-container text-primary flex items-center justify-center">
            <History className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-on-surface">
              Recent Patient Food Assessments
            </h2>
            <span className="text-xs text-on-surface-variant">
              Logged and verified against patient's active clinical profile
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-xs">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-outline w-3.5 h-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter assessments..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-surface-container text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary w-44"
            />
          </div>
          <button
            onClick={() => alert("Exporting Clinical Assessments CSV...")}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
            title="Export CSV"
          >
            <Download className="w-4 h-4 text-primary" />
          </button>
        </div>
      </div>

      {/* Structured High-Density Assessments Table */}
      <div className="overflow-x-auto -mx-space-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low font-clinical-mono text-[11px] text-tertiary uppercase tracking-wider">
              <th className="py-2.5 px-space-lg">Food Item &amp; Brand</th>
              <th className="py-2.5 px-space-md">Detected Date</th>
              <th className="py-2.5 px-space-md">Risk Flag</th>
              <th className="py-2.5 px-space-md">Key Ingredient Detected</th>
              <th className="py-2.5 px-space-md">Info Quality</th>
              <th className="py-2.5 px-space-lg text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15 text-xs text-on-surface">
            {filtered.map((row) => {
              const isCritical = row.riskSeverity === "critical";
              const isHigh = row.riskSeverity === "high";
              const isMod = row.riskSeverity === "moderate";

              return (
                <tr key={row.id} className="hover:bg-surface-container-low/60 transition-colors">
                  <td className="py-3 px-space-lg font-medium">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={row.imageUrl}
                        alt={row.foodName}
                        className="w-9 h-9 rounded-lg object-cover bg-surface-container shadow-xs"
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface">
                          {row.foodName}
                        </span>
                        <span className="text-[11px] text-on-surface-variant">
                          {row.brand}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-space-md font-clinical-mono text-tertiary">
                    {row.detectedDate}
                  </td>

                  <td className="py-3 px-space-md">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold ${
                        isCritical
                          ? "bg-red-100 text-red-900"
                          : isHigh || isMod
                          ? "bg-amber-100 text-amber-900"
                          : "bg-emerald-100 text-emerald-900"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isCritical
                            ? "bg-red-600"
                            : isHigh || isMod
                            ? "bg-amber-600"
                            : "bg-emerald-600"
                        }`}
                      />
                      {row.riskFlag}
                    </span>
                  </td>

                  <td className="py-3 px-space-md max-w-xs">
                    <div className="flex flex-col">
                      <span className="font-semibold text-on-surface">
                        {row.keyIngredient}
                      </span>
                      <span className="text-[11px] text-on-surface-variant truncate">
                        {row.keyIngredientDetail}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-space-md">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          row.infoQualityScore > 90 ? "bg-primary" : "bg-amber-500"
                        }`}
                      />
                      <span className="font-clinical-mono text-[11px] text-primary font-medium">
                        {row.infoQuality}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-space-lg text-right">
                    <Link
                      href={row.id === "nutrichoice" ? "/assessment/nutrichoice-digestive" : row.id === "instant-noodles" ? "/assessment/instant-noodles" : "/alternatives"}
                      className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-xs transition-colors"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-1 text-xs text-on-surface-variant border-t border-outline-variant/15">
        <span>Showing 4 of 42 evaluated patient items</span>
        <div className="flex items-center gap-1">
          <button className="px-2.5 py-1 rounded bg-surface-container text-on-surface font-semibold text-xs" disabled>
            Prev
          </button>
          <button className="px-2.5 py-1 rounded bg-primary text-on-primary font-semibold text-xs">
            1
          </button>
          <button className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs">
            2
          </button>
          <button className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
