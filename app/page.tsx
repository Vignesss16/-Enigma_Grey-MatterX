"use client";

import { MobileHeader } from "@/components/navigation/MobileHeader";
import { BaselineCard } from "@/components/dashboard/BaselineCard";
import { SummaryStats } from "@/components/dashboard/SummaryStats";
import { QuickScanBay } from "@/components/dashboard/QuickScanBay";
import { RecentChecksFeed } from "@/components/dashboard/RecentChecksFeed";
import { ClinicalAnalyticsChart } from "@/components/dashboard/ClinicalAnalyticsChart";
import { DEFAULT_PATIENT_PROFILE } from "@/lib/mock-data";
import { ShieldCheck, Clock } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <MobileHeader title="Genesis Reset" />

      <div className="px-gutter lg:px-space-xl py-space-md max-w-7xl mx-auto flex flex-col gap-space-lg">
        {/* Patient Clinical Context & Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md pb-space-sm border-b border-outline-variant/15">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-space-xs text-primary">
              <span className="font-clinical-mono text-[10px] uppercase tracking-widest text-primary font-bold px-2 py-0.5 rounded bg-primary-fixed/40">
                CLINICAL DECISION SUPPORT PLATFORM
              </span>
              <span className="text-outline text-xs">·</span>
              <span className="font-clinical-mono text-xs text-tertiary">
                SESSION #CDS-8842-LIVE
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-on-surface tracking-tight">
              Good morning, Ananya
            </h1>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-on-surface-variant text-xs mt-0.5">
              <span className="font-semibold text-on-surface">Patient: Ananya Rao</span>
              <span className="text-outline-variant">•</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-medium text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Diabetes (Type 2)
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-medium text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                Stage 1 Hypertension
              </span>
            </div>
          </div>

          {/* Live Status Pill */}
          <div className="flex items-center gap-3 self-start lg:self-auto bg-surface-container-lowest p-2 rounded-xl shadow-xs border border-outline-variant/20">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface-container-low">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="font-clinical-mono text-xs text-primary font-semibold">
                Live profile sync active
              </span>
            </div>
            <div className="h-4 w-px bg-outline-variant/40" />
            <div className="flex items-center gap-1 pr-1 font-clinical-mono text-xs text-tertiary">
              <Clock className="w-3.5 h-3.5 text-outline" />
              <span>LIVE CDS</span>
            </div>
          </div>
        </div>

        {/* Top 3 Summary Stat Cards */}
        <SummaryStats />

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Left Column (8 cols): Primary Scanner & Clinical Analytics */}
          <div className="lg:col-span-8 flex flex-col gap-space-lg">
            <QuickScanBay />
            <ClinicalAnalyticsChart />
          </div>

          {/* Right Column (4 cols): Active Baseline & Recent Checks */}
          <div className="lg:col-span-4 flex flex-col gap-space-lg">
            <BaselineCard profile={DEFAULT_PATIENT_PROFILE} />
            <RecentChecksFeed />
          </div>
        </div>
      </div>
    </>
  );
}
