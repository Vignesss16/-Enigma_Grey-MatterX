"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Download, History, ChevronRight, Zap, ArrowRight, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { DOCTOR_ASSESSMENTS_TABLE } from "@/lib/mock-data";

export interface DoctorAssessmentRow {
  id: string;
  foodName: string;
  brand: string;
  imageUrl: string;
  detectedDate: string;
  riskFlag: string;
  riskSeverity: "critical" | "high" | "moderate" | "low";
  keyIngredient: string;
  keyIngredientDetail: string;
  infoQuality: string;
  infoQualityScore: number;
  isRealtime?: boolean;
}

interface DoctorAssessmentsTableProps {
  assessments?: DoctorAssessmentRow[];
  onSimulateScan?: () => void;
  isSimulating?: boolean;
}

export function DoctorAssessmentsTable({
  assessments = DOCTOR_ASSESSMENTS_TABLE as DoctorAssessmentRow[],
  onSimulateScan,
  isSimulating = false,
}: DoctorAssessmentsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = assessments.filter(
    (item) =>
      item.foodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.keyIngredient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskTheme = (severity: string) => {
    switch (severity) {
      case "critical":
        return {
          pill: "bg-rose-50 text-rose-700 border-rose-200/80",
          dot: "bg-rose-600",
          icon: ShieldX,
        };
      case "high":
      case "moderate":
        return {
          pill: "bg-amber-50 text-amber-800 border-amber-200/80",
          dot: "bg-amber-600",
          icon: ShieldAlert,
        };
      default:
        return {
          pill: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
          dot: "bg-emerald-600",
          icon: ShieldCheck,
        };
    }
  };

  return (
    <div className="rounded-2xl bg-surface-container-lowest p-4 sm:p-6 shadow-xs border border-outline-variant/20 flex flex-col gap-4 sm:gap-5">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/15">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <History className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-on-surface tracking-tight">
                Recent Patient Food Assessments
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/25 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live Feed
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Logged and verified against patient's active clinical profile
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onSimulateScan && (
            <button
              type="button"
              onClick={onSimulateScan}
              disabled={isSimulating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
              title="Simulate real-time food scan arriving from patient's phone"
            >
              <Zap className="w-3.5 h-3.5 text-primary fill-primary" />
              <span>{isSimulating ? "Streaming..." : "+ Test Live Scan"}</span>
            </button>
          )}

          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-outline w-3.5 h-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search foods or ingredients..."
              className="w-full sm:w-48 pl-8 pr-3 py-1.5 text-xs rounded-xl bg-surface-container text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/30 transition-all"
            />
          </div>

          <button
            onClick={() => alert("Exporting Clinical Assessments Log...")}
            className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-4 h-4 text-primary" />
          </button>
        </div>
      </div>

      {/* MOBILE VIEW: Dedicated Native Card Feed for Small Screens (Hidden on md+) */}
      <div className="md:hidden flex flex-col gap-3">
        {filtered.map((row) => {
          const theme = getRiskTheme(row.riskSeverity);
          return (
            <div
              key={row.id}
              className="p-3.5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/20 flex flex-col gap-2.5 shadow-2xs hover:shadow-xs transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={row.imageUrl}
                    alt={row.foodName}
                    className="w-12 h-12 rounded-xl object-cover bg-surface-container shrink-0 border border-black/5"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-on-surface truncate">
                        {row.foodName}
                      </span>
                      {row.isRealtime && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                          Live
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-on-surface-variant block">
                      {row.brand} · <span className="font-medium">{row.detectedDate}</span>
                    </span>
                  </div>
                </div>

                <Link
                  href={
                    row.id === "nutrichoice"
                      ? "/assessment/nutrichoice-digestive"
                      : row.id === "instant-noodles"
                      ? "/assessment/instant-noodles"
                      : "/alternatives"
                  }
                  className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary shrink-0 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Risk Flag Pill */}
              <div className="flex items-center">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${theme.pill}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                  <span>{row.riskFlag}</span>
                </span>
              </div>

              {/* Key Ingredient Details */}
              <div className="text-xs bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/15 flex flex-col gap-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant font-medium">Key Compound:</span>
                  <span className="font-bold text-on-surface">{row.keyIngredient}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                  <span>Verification:</span>
                  <span className="font-medium text-primary">{row.keyIngredientDetail}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP VIEW: High-Density Structured Table (Hidden on Mobile) */}
      <div className="hidden md:block overflow-x-auto -mx-4 sm:-mx-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-xs text-on-surface-variant font-semibold border-b border-outline-variant/15">
              <th className="py-3 px-6">Food Item &amp; Brand</th>
              <th className="py-3 px-4">Detected</th>
              <th className="py-3 px-4">Risk Flag</th>
              <th className="py-3 px-4">Key Ingredient Detected</th>
              <th className="py-3 px-4">Confidence</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15 text-xs text-on-surface">
            {filtered.map((row) => {
              const theme = getRiskTheme(row.riskSeverity);

              return (
                <tr key={row.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-3.5 px-6 font-medium">
                    <div className="flex items-center gap-3">
                      <img
                        src={row.imageUrl}
                        alt={row.foodName}
                        className="w-10 h-10 rounded-xl object-cover bg-surface-container shadow-2xs border border-black/5 shrink-0"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-on-surface">
                            {row.foodName}
                          </span>
                          {row.isRealtime && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                              Live Scan
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-on-surface-variant">
                          {row.brand}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-on-surface-variant font-medium">
                    {row.detectedDate}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${theme.pill}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                      {row.riskFlag}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex flex-col">
                      <span className="font-semibold text-on-surface">
                        {row.keyIngredient}
                      </span>
                      <span className="text-[11px] text-on-surface-variant truncate">
                        {row.keyIngredientDetail}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          row.infoQualityScore > 90 ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                      />
                      <span className="text-xs text-on-surface font-medium">
                        {row.infoQualityScore}% Verified
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-6 text-right">
                    <Link
                      href={
                        row.id === "nutrichoice"
                          ? "/assessment/nutrichoice-digestive"
                          : row.id === "instant-noodles"
                          ? "/assessment/instant-noodles"
                          : "/alternatives"
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs transition-all shadow-2xs hover:shadow-xs active:scale-95"
                    >
                      <span>Review</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
