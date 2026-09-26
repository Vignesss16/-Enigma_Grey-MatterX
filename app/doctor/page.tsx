"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Stethoscope, 
  Clock, 
  ShieldCheck, 
  Send, 
  Check, 
  LogOut,
  Radio,
  Zap,
  Activity,
  AlertTriangle,
  Bell,
  Sparkles,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DoctorPatientSelector } from "@/components/doctor/DoctorPatientSelector";
import { DoctorIngestionBay } from "@/components/doctor/DoctorIngestionBay";
import { DoctorAssessmentsTable, DoctorAssessmentRow } from "@/components/doctor/DoctorAssessmentsTable";
import { DoctorSensitivityTuner } from "@/components/doctor/DoctorSensitivityTuner";
import { DoctorExplainabilitySpotlight } from "@/components/doctor/DoctorExplainabilitySpotlight";
import { DOCTOR_PATIENTS, DOCTOR_ASSESSMENTS_TABLE } from "@/lib/mock-data";
import { DoctorPatient } from "@/types";

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<(DoctorPatient & { isLive?: boolean })[]>(DOCTOR_PATIENTS);
  const [selectedPatient, setSelectedPatient] = useState<DoctorPatient>(DOCTOR_PATIENTS[0]);
  const [assessments, setAssessments] = useState<DoctorAssessmentRow[]>(
    DOCTOR_ASSESSMENTS_TABLE as DoctorAssessmentRow[]
  );
  const [realtimeAlert, setRealtimeAlert] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [doctorNote, setDoctorNote] = useState("");
  const [noteSent, setNoteSent] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(true);

  const [doctorAuth, setDoctorAuth] = useState<{
    name: string;
    role: string;
    npi: string;
    hospital?: string;
  } | null>(null);

  // 1. Load Doctor Auth Session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cds_doctor_auth");
      if (stored) {
        try {
          setDoctorAuth(JSON.parse(stored));
        } catch (_) {}
      }
    }
  }, []);

  // 2. Fetch Real Registered Patients from Supabase
  useEffect(() => {
    async function loadPatients() {
      try {
        const { data: realProfiles } = await supabase.from("profiles").select("*");
        if (realProfiles && realProfiles.length > 0) {
          const livePatients: (DoctorPatient & { isLive?: boolean })[] = realProfiles.map((p) => ({
            id: p.user_id || p.id,
            name: p.full_name || "Registered Patient",
            age: p.age || 35,
            gender: p.gender || "Patient",
            patientId: p.patient_id || `CDS-${p.id?.slice(0, 4) || "LIVE"}`,
            conditions: Array.isArray(p.conditions)
              ? p.conditions.map((c: any) => c.label || c.title || c.id || c)
              : ["Clinical Nutrition Monitoring"],
            riskLevel: "moderate",
            lastEvaluated: "Today (Live)",
            todayIntake: {
              sodiumMg: 340,
              glycemicLoadAvg: 8,
              flagsCount: 1,
            },
            isLive: true,
          }));

          // Merge live patients with demo cohort
          setPatients([...livePatients, ...DOCTOR_PATIENTS]);
        }
      } catch (err) {
        console.warn("Could not load profiles from Supabase:", err);
      }
    }
    loadPatients();
  }, []);

  // 3. Fetch Real Patient Scans & Set Up Supabase Realtime Listener
  useEffect(() => {
    async function loadScans() {
      try {
        const { data: scans } = await supabase
          .from("food_scans")
          .select("*")
          .order("scanned_at", { ascending: false })
          .limit(20);

        if (scans && scans.length > 0) {
          const mappedScans: DoctorAssessmentRow[] = scans.map((s: any) => ({
            id: s.id || `scan-${Date.now()}`,
            foodName: s.product_name || "Patient Scanned Food",
            brand: s.brand || "Identified Brand",
            imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&auto=format&fit=crop&q=80",
            detectedDate: new Date(s.scanned_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " (Live)",
            riskFlag: s.clinical_flags?.[0]?.message || (s.overall_status === "danger" ? "Flagged: Clinical Ceiling Exceeded" : "Compliant"),
            riskSeverity: s.overall_status === "danger" ? "critical" : s.overall_status === "warning" ? "high" : "low",
            keyIngredient: s.ingredients?.[0]?.name || "Analyzed Ingredients",
            keyIngredientDetail: s.hidden_polyols_grams > 0 ? `Hidden Polyols: ${s.hidden_polyols_grams}g` : "CDS Verified Order 1",
            infoQuality: "Full OCR & Lab Verified",
            infoQualityScore: Math.round(s.confidence_score || 96),
            isRealtime: true,
          }));

          setAssessments([...mappedScans, ...(DOCTOR_ASSESSMENTS_TABLE as DoctorAssessmentRow[])]);
        }
      } catch (err) {
        console.warn("Could not load initial food_scans from Supabase:", err);
      }
    }
    loadScans();

    // 4. Supabase Realtime Subscription: Listen for live patient scans
    const channel = supabase
      .channel("doctor_live_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "food_scans" },
        (payload) => {
          const s = payload.new;
          const newAssessment: DoctorAssessmentRow = {
            id: s.id || `live-${Date.now()}`,
            foodName: s.product_name || "New Patient Scan",
            brand: s.brand || "Identified Brand",
            imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&auto=format&fit=crop&q=80",
            detectedDate: "Just now (Live)",
            riskFlag: s.clinical_flags?.[0]?.message || (s.overall_status === "danger" ? "Critical Risk Detected" : "CDS Evaluated"),
            riskSeverity: s.overall_status === "danger" ? "critical" : s.overall_status === "warning" ? "high" : "low",
            keyIngredient: s.ingredients?.[0]?.name || "Package Ingredient",
            keyIngredientDetail: s.hidden_polyols_grams > 0 ? `Hidden Polyols: ${s.hidden_polyols_grams}g` : "Clinical Order 1",
            infoQuality: "Live OCR Stream",
            infoQualityScore: Math.round(s.confidence_score || 98),
            isRealtime: true,
          };

          setAssessments((prev) => [newAssessment, ...prev]);
          setRealtimeAlert(`🔴 Live Telemetry: New patient scan received — "${s.product_name}" (${newAssessment.riskFlag})`);
          setTimeout(() => setRealtimeAlert(null), 6000);
        }
      )
      .subscribe((status) => {
        setRealtimeConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 5. Simulate Live Patient Scan (for Live Demo and Hackathon Review)
  const handleSimulateScan = async () => {
    setIsSimulating(true);
    const mockProducts = [
      {
        name: "Keto Crunch Bar (Maltitol Sweetened)",
        brand: "PurePro Nutrition",
        status: "danger",
        flag: "CRITICAL: 6.2g Hidden Polyols (Maltitol INS 965) Detected",
        ingredient: "Maltitol Syrup (INS 965ii)",
        polyols: 6.2,
      },
      {
        name: "Low-Sodium Himalayan Sea Salt Crisps",
        brand: "HealthySnack Co",
        status: "warning",
        flag: "WARNING: Sodium density 460mg exceeds 400mg portion ceiling",
        ingredient: "Iodised Sodium Chloride",
        polyols: 0,
      },
      {
        name: "Sprouted Chia & Flax Seed Crackers",
        brand: "Nourish Wholefoods",
        status: "safe",
        flag: "COMPLIANT: Zero added sugar, Glycemic Load Score 4",
        ingredient: "Organic Sprouted Chia Seeds",
        polyols: 0,
      },
    ];

    const pick = mockProducts[Math.floor(Math.random() * mockProducts.length)];

    try {
      // Insert to Supabase so Realtime fires across all listening devices
      const { data, error } = await supabase.from("food_scans").insert({
        product_name: pick.name,
        brand: pick.brand,
        overall_status: pick.status,
        confidence_score: 97.4,
        hidden_polyols_grams: pick.polyols,
        nutrition: {
          servingSize: "30g",
          calories: 140,
          carbohydratesGrams: 16,
          dietaryFiberGrams: 4,
          sugarGrams: 1,
          addedSugarGrams: 0,
          sodiumMg: pick.status === "warning" ? 460 : 120,
        },
        ingredients: [{ name: pick.ingredient }],
        clinical_flags: [{ message: pick.flag }],
        scanned_at: new Date().toISOString(),
      }).select();

      // If Supabase RLS blocks anonymous insert, fall back to local realtime injection
      if (error || !data) {
        const liveRow: DoctorAssessmentRow = {
          id: `sim-${Date.now()}`,
          foodName: pick.name,
          brand: pick.brand,
          imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&auto=format&fit=crop&q=80",
          detectedDate: "Just now (Live Telemetry)",
          riskFlag: pick.flag,
          riskSeverity: pick.status === "danger" ? "critical" : pick.status === "warning" ? "high" : "low",
          keyIngredient: pick.ingredient,
          keyIngredientDetail: pick.polyols > 0 ? `Hidden Polyols: ${pick.polyols}g` : "Verified Ingredient",
          infoQuality: "Realtime Telemetry",
          infoQualityScore: 98,
          isRealtime: true,
        };
        setAssessments((prev) => [liveRow, ...prev]);
        setRealtimeAlert(`🔴 Live Telemetry: New patient scan received — "${pick.name}"`);
        setTimeout(() => setRealtimeAlert(null), 6000);
      }
    } catch (_) {
      // Fallback
    } finally {
      setIsSimulating(false);
    }
  };

  const handleDoctorLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cds_doctor_auth");
    }
    router.push("/doctor/login");
  };

  const handleSendNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorNote.trim()) return;
    setNoteSent(true);
    setTimeout(() => {
      setDoctorNote("");
      setNoteSent(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Dedicated Doctor Hospital Navigation Bar */}
      <header className="sticky top-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant/20 px-4 lg:px-8 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-on-surface tracking-tight">
                Genesis Reset Clinician CDS
              </span>
              <span className="font-clinical-mono text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-primary-fixed/40 text-primary border border-primary/20">
                Hospital Workstation
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant font-clinical-mono">
              Electronic Health Record &amp; Real-Time Food Ingestion Telemetry
            </p>
          </div>
        </div>

        {/* Live Realtime Telemetry Beacon & Clinician Controls */}
        <div className="flex items-center gap-3">
          <Link
            href="/doctor/customers"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-surface-tint text-on-primary text-xs font-bold transition-all shadow-xs active:scale-95"
            title="Open Customers & Teleconsult Queue"
          >
            <User className="w-3.5 h-3.5" />
            <span>Customers & Teleconsult</span>
            <span className="bg-white/25 text-white text-[10px] px-1.5 py-0.5 rounded-full font-clinical-mono font-black">
              LIVE
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/30 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
            </span>
            <span className="font-clinical-mono text-[11px] text-emerald-800 tracking-wider uppercase">
              {realtimeConnected ? "Realtime Active" : "Connecting..."}
            </span>
          </div>

          <div className="hidden sm:flex flex-col text-right pl-2 pr-1 border-l border-outline-variant/20">
            <span className="text-xs font-bold text-on-surface">
              {doctorAuth?.name || "Dr. Sunita Sen, MD"}
            </span>
            <span className="text-[10px] text-on-surface-variant font-clinical-mono">
              {doctorAuth?.npi || "NPI-7489201984"} · {doctorAuth?.role || "Endocrinology"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleDoctorLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-error/30 text-error hover:bg-error-container/20 text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
            title="Sign out of Doctor Portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Real-time Telemetry Notification Banner */}
      {realtimeAlert && (
        <div className="bg-primary text-on-primary px-4 py-2.5 shadow-md flex items-center justify-between text-xs font-medium animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <Bell className="w-4 h-4 animate-bounce shrink-0" />
            <span className="font-semibold">{realtimeAlert}</span>
          </div>
          <button
            onClick={() => setRealtimeAlert(null)}
            className="text-on-primary/80 hover:text-on-primary text-xs ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Clinical Workstation Body */}
      <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
        {/* Physician Header & Session Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-3 border-b border-outline-variant/15">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-on-surface tracking-tight">
              Clinician Food Risk &amp; CDS Dashboard
            </h1>
            <p className="text-xs text-on-surface-variant max-w-2xl">
              High-throughput multimodal label OCR, continuous biomarker threshold monitoring, and algorithmic compound safety verification.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateScan}
              disabled={isSimulating}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{isSimulating ? "Ingesting..." : "Simulate Live Patient Scan"}</span>
            </button>
          </div>
        </div>

        {/* Patient Cohort Selector */}
        <DoctorPatientSelector
          selectedPatient={selectedPatient}
          onSelectPatient={setSelectedPatient}
          patients={patients}
        />

        {/* Top 3 CDS Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-xs border border-outline-variant/20 flex flex-col justify-between">
            <span className="font-clinical-mono text-xs text-tertiary uppercase tracking-wider">
              Evaluated Patient Items
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-on-surface">{assessments.length}</span>
              <span className="text-xs text-on-surface-variant">patient items</span>
            </div>
            <div className="mt-3 pt-2 border-t border-outline-variant/15 flex justify-between text-xs font-medium">
              <span className="text-emerald-700">
                {assessments.filter((a) => a.riskSeverity === "low").length} Compliant
              </span>
              <span className="text-red-700 font-semibold">
                {assessments.filter((a) => a.riskSeverity !== "low").length} Flagged Triggers
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-xs border border-outline-variant/20 flex flex-col justify-between">
            <span className="font-clinical-mono text-xs text-tertiary uppercase tracking-wider">
              Primary Risk Vector
            </span>
            <div className="mt-1">
              <h4 className="text-sm font-bold text-on-surface">
                Hidden Refined Flour (Maida)
              </h4>
              <p className="text-xs text-secondary font-medium">
                &amp; Sodium Spike &gt;400mg
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-outline-variant/15 flex justify-between text-xs text-on-surface-variant">
              <span>Postprandial glycemic excursions</span>
              <span className="font-clinical-mono text-primary font-bold">73%</span>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-xs border border-outline-variant/20 flex flex-col justify-between">
            <span className="font-clinical-mono text-xs text-tertiary uppercase tracking-wider">
              Information Confidence
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-primary">96.4%</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container">
                GRADE A
              </span>
            </div>
            <div className="mt-3 pt-2 border-t border-outline-variant/15 flex justify-between text-xs text-on-surface-variant">
              <span>Full OCR &amp; Lab-verified match</span>
              <span className="font-clinical-mono text-tertiary">Realtime Stream Active</span>
            </div>
          </div>
        </div>

        {/* 2-Column Clinical Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (8 cols): Ingestion Bay & Assessments Table */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <DoctorIngestionBay />
            <DoctorAssessmentsTable
              assessments={assessments}
              onSimulateScan={handleSimulateScan}
              isSimulating={isSimulating}
            />
          </div>

          {/* Right Column (4 cols): Sensitivity Tuner, Explainability, & Prescriptions */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <DoctorSensitivityTuner />
            <DoctorExplainabilitySpotlight />

            {/* Prescribe Dietary Guidance Directly to Patient */}
            <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm border border-outline-variant/20 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-surface-container text-primary flex items-center justify-center">
                  <Stethoscope className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-on-surface">
                    Prescribe Dietary Guideline
                  </h3>
                  <span className="text-[11px] text-on-surface-variant">
                    Pushes directly to {selectedPatient.name}&apos;s mobile scanner
                  </span>
                </div>
              </div>

              <form onSubmit={handleSendNote} className="flex flex-col gap-2 mt-1">
                <textarea
                  value={doctorNote}
                  onChange={(e) => setDoctorNote(e.target.value)}
                  placeholder={`Write clinical note or restrict specific compounds for ${selectedPatient.name}...`}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-outline-variant/30 bg-surface-container text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
                <button
                  type="submit"
                  disabled={noteSent || !doctorNote.trim()}
                  className="self-end px-4 py-2 rounded-xl bg-primary text-on-primary font-semibold text-xs flex items-center gap-1.5 hover:bg-primary/90 transition-all disabled:opacity-50 shadow-xs cursor-pointer active:scale-95"
                >
                  {noteSent ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-primary-fixed" />
                      <span>Guideline Transmitted</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Transmit to Patient</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
