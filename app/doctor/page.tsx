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
  Users,
  LayoutDashboard,
  Video,
  Phone,
  ArrowRight,
  ShieldX,
  ShieldAlert,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DoctorPatientSelector } from "@/components/doctor/DoctorPatientSelector";
import { DoctorIngestionBay } from "@/components/doctor/DoctorIngestionBay";
import { DoctorAssessmentsTable, DoctorAssessmentRow } from "@/components/doctor/DoctorAssessmentsTable";
import { DoctorSensitivityTuner } from "@/components/doctor/DoctorSensitivityTuner";
import { DoctorExplainabilitySpotlight } from "@/components/doctor/DoctorExplainabilitySpotlight";
import { DOCTOR_PATIENTS, DOCTOR_ASSESSMENTS_TABLE, DEMO_CONSULTATION_REQUESTS } from "@/lib/mock-data";
import { DoctorPatient, ConsultationRequest } from "@/types";
import { DoctorIncomingCallBanner } from "@/components/doctor/DoctorIncomingCallBanner";
import { WebRTCCallModal } from "@/components/call/WebRTCCallModal";

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<(DoctorPatient & { isLive?: boolean })[]>(DOCTOR_PATIENTS);
  const [selectedPatient, setSelectedPatient] = useState<DoctorPatient>(DOCTOR_PATIENTS[0]);
  const [assessments, setAssessments] = useState<DoctorAssessmentRow[]>(
    DOCTOR_ASSESSMENTS_TABLE as DoctorAssessmentRow[]
  );
  const [queue, setQueue] = useState<ConsultationRequest[]>(DEMO_CONSULTATION_REQUESTS);
  const [activeCall, setActiveCall] = useState<{
    consultation: ConsultationRequest;
    callType: "video" | "audio";
  } | null>(null);

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

          setPatients([...livePatients, ...DOCTOR_PATIENTS]);
        }
      } catch (err) {
        console.warn("Could not load profiles from Supabase:", err);
      }
    }
    loadPatients();
  }, []);

  // 3. Load Queue from localStorage & Realtime Broadcast Listener
  useEffect(() => {
    // Local storage initial load
    if (typeof window !== "undefined") {
      try {
        const localStored = localStorage.getItem("cds_patient_queue");
        if (localStored) {
          const parsed = JSON.parse(localStored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setQueue((prev) => {
              const existingIds = new Set(prev.map((c) => c.id));
              const newItems = parsed.filter((p: any) => !existingIds.has(p.id));
              return [...newItems, ...prev];
            });
          }
        }
      } catch (_) {}
    }

    // Supabase broadcast listener for incoming queue items
    const consultChannel = supabase
      .channel("doctor_consultations_feed")
      .on("broadcast", { event: "new_consultation_request" }, ({ payload }) => {
        if (payload) {
          const item = payload as ConsultationRequest;
          setQueue((prev) => {
            if (prev.find((p) => p.id === item.id)) return prev;
            return [item, ...prev];
          });
          setRealtimeAlert(`New Customer Added to Queue: ${item.patientName} (${item.foodName})`);
          setTimeout(() => setRealtimeAlert(null), 6000);
        }
      })
      .subscribe();

    // Local custom event listener (instant same-browser sync)
    const handleQueueEvent = (e: any) => {
      if (e.detail) {
        const item = e.detail as ConsultationRequest;
        setQueue((prev) => {
          if (prev.find((p) => p.id === item.id)) return prev;
          return [item, ...prev];
        });
        setRealtimeAlert(`New Customer in Queue: ${item.patientName} (${item.foodName})`);
        setTimeout(() => setRealtimeAlert(null), 6000);
      }
    };

    window.addEventListener("cds_queue_updated", handleQueueEvent);

    return () => {
      supabase.removeChannel(consultChannel);
      window.removeEventListener("cds_queue_updated", handleQueueEvent);
    };
  }, []);

  // 4. Fetch Real Patient Scans & Set Up Supabase Realtime Listener
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
          setRealtimeAlert(`Live Telemetry: New patient scan received — "${s.product_name}" (${newAssessment.riskFlag})`);
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

  // 5. Simulate Live Patient Scan
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
        setRealtimeAlert(`Live Telemetry: New patient scan received — "${pick.name}"`);
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

  const nextQueuePatient = queue[0];

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      {/* Dedicated Doctor Hospital Navigation Bar (Fully Mobile Responsive) */}
      <header className="sticky top-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant/20 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Brand & Hospital Station */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs shrink-0">
              <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-on-surface tracking-tight truncate">
                  Genesis Clinician CDS
                </span>
                <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-lg bg-primary-fixed/40 text-primary border border-primary/20">
                  Hospital Station
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-on-surface-variant truncate">
                Real-Time Food &amp; Biomarker Telemetry
              </p>
            </div>
          </div>

          {/* Quick Actions & Navigation */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Live Patient Queue Button */}
            <Link
              href="/doctor/queue"
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-primary hover:bg-surface-tint text-on-primary text-xs font-bold transition-all shadow-xs active:scale-95 shrink-0"
              title="Open Live Patient Queue"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Queue</span>
              <span className="bg-white/25 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {queue.length} LIVE
              </span>
            </Link>

            {/* Realtime Status Indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/30 text-xs font-semibold text-emerald-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              <span>{realtimeConnected ? "Realtime Active" : "Connecting..."}</span>
            </div>

            {/* Doctor Profile Details */}
            <div className="hidden lg:flex flex-col text-right pl-2 pr-1 border-l border-outline-variant/20">
              <span className="text-xs font-bold text-on-surface">
                {doctorAuth?.name || "Dr. Sarah Jenkins, MD"}
              </span>
              <span className="text-[11px] text-on-surface-variant">
                {doctorAuth?.npi || "NPI-1942857102"} · {doctorAuth?.role || "Endocrinology"}
              </span>
            </div>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={handleDoctorLogout}
              className="inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl border border-error/30 text-error hover:bg-error-container/20 text-xs font-bold transition-all shadow-2xs active:scale-95"
              title="Sign out of Doctor Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
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

      {/* Main Clinical Workstation Body (Mobile Optimized) */}
      <main className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-4 sm:gap-6 flex-1">
        {/* Physician Header & Session Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 pb-3 border-b border-outline-variant/15">
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface tracking-tight">
              Clinician Food Risk &amp; CDS Dashboard
            </h1>
            <p className="text-xs text-on-surface-variant max-w-2xl">
              Multimodal nutrition label OCR, continuous biomarker threshold monitoring, and clinical compound safety verification.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSimulateScan}
              disabled={isSimulating}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-primary hover:bg-surface-tint text-on-primary text-xs font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{isSimulating ? "Ingesting..." : "+ Test Live Patient Scan"}</span>
            </button>
          </div>
        </div>

        {/* Live Patient Queue Quick-Access Banner (Whenever customer sends data) */}
        {nextQueuePatient && (
          <div className="bg-gradient-to-r from-surface-container-lowest via-surface-container-low to-surface-container-lowest p-4 sm:p-5 rounded-3xl border-2 border-primary/30 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-surface-container border border-outline-variant/30 shadow-2xs">
                  {nextQueuePatient.imageUrl ? (
                    <img src={nextQueuePatient.imageUrl} alt={nextQueuePatient.foodName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary">
                      <Sparkles className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-500/15 text-emerald-800 border border-emerald-500/30">
                    Next in Queue
                  </span>
                  <h3 className="font-bold text-sm sm:text-base text-on-surface truncate">
                    {nextQueuePatient.patientName}
                  </h3>
                  <span className="text-xs text-on-surface-variant font-mono">
                    #{nextQueuePatient.patientId}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5 truncate">
                  Scanned: <span className="font-bold text-on-surface">{nextQueuePatient.foodName}</span> · Triage Score:{" "}
                  <span className={`font-bold ${nextQueuePatient.triageScore > 70 ? "text-rose-600" : nextQueuePatient.triageScore > 30 ? "text-amber-600" : "text-emerald-600"}`}>
                    {nextQueuePatient.triageScore}/100
                  </span>
                </p>
                {nextQueuePatient.patientNote && (
                  <p className="text-xs text-on-surface-variant italic mt-1 line-clamp-1">
                    "{nextQueuePatient.patientNote}"
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
              <button
                onClick={() =>
                  setActiveCall({
                    consultation: nextQueuePatient,
                    callType: "video",
                  })
                }
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-surface-tint text-on-primary text-xs font-bold transition-all shadow-xs active:scale-95"
              >
                <Video className="w-4 h-4" />
                <span>Call Next Patient</span>
              </button>

              <Link
                href="/doctor/queue"
                className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-all shadow-2xs"
              >
                <span>View Full Queue ({queue.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Patient Cohort Selector with Smooth Mobile Horizontal Scrolling */}
        <DoctorPatientSelector
          selectedPatient={selectedPatient}
          onSelectPatient={setSelectedPatient}
          patients={patients}
        />

        {/* Top 3 CDS Metric Cards (Clean Grid: 1 col on mobile, 3 cols on md+) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {/* Card 1: Evaluated Items */}
          <div className="rounded-2xl bg-surface-container-lowest p-4 sm:p-5 shadow-2xs border border-outline-variant/20 flex flex-col justify-between">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Evaluated Items
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-on-surface">
                {assessments.length}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">patient foods</span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-outline-variant/15 flex justify-between text-xs font-semibold">
              <span className="text-emerald-700">
                {assessments.filter((a) => a.riskSeverity === "low").length} Compliant
              </span>
              <span className="text-rose-700">
                {assessments.filter((a) => a.riskSeverity !== "low").length} Flagged
              </span>
            </div>
          </div>

          {/* Card 2: Primary Risk Vector */}
          <div className="rounded-2xl bg-surface-container-lowest p-4 sm:p-5 shadow-2xs border border-outline-variant/20 flex flex-col justify-between">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Primary Risk Vector
            </span>
            <div className="mt-2">
              <h4 className="text-sm font-bold text-on-surface">
                Hidden Refined Flour (Maida)
              </h4>
              <p className="text-xs text-amber-800 font-semibold mt-0.5">
                &amp; Sodium Spike &gt;400mg
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-outline-variant/15 flex justify-between text-xs text-on-surface-variant font-medium">
              <span>Postprandial risk:</span>
              <span className="text-primary font-bold">73% Elevation</span>
            </div>
          </div>

          {/* Card 3: Diagnostic Confidence */}
          <div className="rounded-2xl bg-surface-container-lowest p-4 sm:p-5 shadow-2xs border border-outline-variant/20 flex flex-col justify-between sm:col-span-2 md:col-span-1">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Diagnostic Confidence
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-primary">96.4%</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary-container">
                GRADE A
              </span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-outline-variant/15 flex justify-between text-xs text-on-surface-variant font-medium">
              <span>OCR &amp; Lab-verified match</span>
              <span className="text-emerald-700 font-bold">Live Active</span>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Clinical Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Column (8 cols): Ingestion Bay & Assessments Table */}
          <div className="lg:col-span-8 flex flex-col gap-4 sm:gap-6">
            <DoctorIngestionBay />
            <DoctorAssessmentsTable
              assessments={assessments}
              onSimulateScan={handleSimulateScan}
              isSimulating={isSimulating}
            />
          </div>

          {/* Right Column (4 cols): Sensitivity Tuner, Explainability, & Prescriptions */}
          <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-6">
            <DoctorSensitivityTuner />
            <DoctorExplainabilitySpotlight />

            {/* Prescribe Dietary Guidance Directly to Patient */}
            <div className="rounded-2xl bg-surface-container-lowest p-4 sm:p-5 shadow-2xs border border-outline-variant/20 flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-on-surface tracking-tight">
                    Prescribe Dietary Guideline
                  </h3>
                  <span className="text-xs text-on-surface-variant">
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
                  className="w-full p-3 rounded-xl border border-outline-variant/30 bg-surface-container text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
                <button
                  type="submit"
                  disabled={noteSent || !doctorNote.trim()}
                  className="self-end px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-1.5 hover:bg-surface-tint transition-all disabled:opacity-50 shadow-xs cursor-pointer active:scale-95"
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
      </main>

      {/* Direct Call Modal */}
      {activeCall && (
        <WebRTCCallModal
          isOpen={true}
          onClose={() => setActiveCall(null)}
          roomId={activeCall.consultation.roomId}
          participantRole="doctor"
          participantName={doctorAuth?.name || "Dr. Sarah Jenkins, MD"}
          peerName={activeCall.consultation.patientName}
          foodName={activeCall.consultation.foodName}
          foodImage={activeCall.consultation.imageUrl}
          triageScore={activeCall.consultation.triageScore}
          initialCallType={activeCall.callType}
        />
      )}

      {/* Global Realtime Inbound Call Ringing & WebRTC Receiver */}
      <DoctorIncomingCallBanner />
    </div>
  );
}
