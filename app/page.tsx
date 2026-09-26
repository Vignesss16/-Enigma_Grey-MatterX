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
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
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

      <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 max-w-7xl mx-auto flex flex-col gap-6 sm:gap-7">
        {/* Patient Clinical Context & Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-outline-variant/20">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-clinical-mono text-[11px] uppercase tracking-wider text-primary font-semibold px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                Decision Support Active
              </span>
              <span className="text-outline-variant text-xs">·</span>
              <span className="font-clinical-mono text-xs text-on-surface-variant font-medium">
                Patient #{profile.patient_id || "CDS-001"}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight leading-tight">
                Welcome back, {profile.full_name?.split(" ")[0] || "Patient"}
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
                Real-time dietary safety screening calibrated to your active clinical profile.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-on-surface-variant">
              <span className="font-semibold text-on-surface text-xs">Active Guidelines:</span>
              {profile.conditions && profile.conditions.length > 0 ? (
                profile.conditions.map((cond: any) => (
                  <span
                    key={cond.id || cond}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container/60 text-on-secondary-container font-medium text-xs border border-secondary-container/80"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span>{cond.label || cond.title || cond.id || cond}</span>
                  </span>
                ))
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-outline shrink-0" />
                  Standard Nutritional Baseline
                </span>
              )}
            </div>
          </div>

          {/* Live Status Pill */}
          <div className="flex items-center gap-2 self-start lg:self-auto bg-surface-container-lowest px-3.5 py-1.5 rounded-full shadow-xs border border-outline-variant/25 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
            </span>
            <span className="font-medium text-on-surface">
              Profile Synced
            </span>
            <span className="text-outline-variant text-xs">·</span>
            <span className="font-clinical-mono text-[11px] text-primary font-semibold">
              v4.2
            </span>
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
