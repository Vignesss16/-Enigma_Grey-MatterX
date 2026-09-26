"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { MobileHeader } from "@/components/navigation/MobileHeader";
import { BaselineCard } from "@/components/dashboard/BaselineCard";
import { SummaryStats } from "@/components/dashboard/SummaryStats";
import { QuickScanBay } from "@/components/dashboard/QuickScanBay";
import { RecentChecksFeed } from "@/components/dashboard/RecentChecksFeed";
import { ClinicalAnalyticsChart } from "@/components/dashboard/ClinicalAnalyticsChart";
import { ShieldCheck, Clock } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (data) {
        setProfile(data);
      } else {
        // Fallback if the user somehow has no profile in the database
        setProfile({
          full_name: user.email?.split("@")[0] || "Patient",
          patient_id: "CDS-NEW",
          age: 0,
          gender: "Unknown",
          conditions: [],
          thresholds: {
            maxGlycemicLoadPerServing: 10,
            maxSodiumMgPerServing: 400,
            dailySodiumMgCeiling: 1500,
            maxAddedSugarGrams: 0
          }
        });
      }
      setLoading(false);
    }
    loadUser();
  }, [router]);

  if (loading) return <div className="flex justify-center p-20 text-on-surface-variant font-clinical-mono animate-pulse text-sm">Loading Clinical Dashboard...</div>;
  if (!profile) return null;

  // Format profile to match expected HealthProfile type for BaselineCard
  const formattedProfile = {
    name: profile.full_name,
    patientId: profile.patient_id,
    age: profile.age || 0,
    gender: profile.gender || "Unknown",
    conditions: profile.conditions || [],
    thresholds: profile.thresholds || {
      maxGlycemicLoadPerServing: 10,
      maxSodiumMgPerServing: 400,
      dailySodiumMgCeiling: 1500,
      maxAddedSugarGrams: 0
    }
  };

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
                SESSION #{profile.patient_id}-LIVE
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-on-surface tracking-tight">
              Good morning, {profile.full_name?.split(" ")[0] || "Patient"}
            </h1>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-on-surface-variant text-xs mt-0.5">
              <span className="font-semibold text-on-surface">Patient: {profile.full_name || "Unknown"}</span>
              <span className="text-outline-variant">•</span>
              
              {profile.conditions && profile.conditions.length > 0 ? (
                profile.conditions.map((cond: any) => (
                  <span key={cond.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-medium text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {cond.label || cond.title || cond.id}
                  </span>
                ))
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-medium text-[11px]">
                  No active clinical conditions
                </span>
              )}
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
            <BaselineCard profile={formattedProfile as any} />
            <RecentChecksFeed />
          </div>
        </div>
      </div>
    </>
  );
}
