"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Stethoscope,
  Video,
  Phone,
  Search,
  Filter,
  ArrowLeft,
  Clock,
  Radio,
  CheckCircle2,
  AlertTriangle,
  User,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  MessageSquare,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  RefreshCw,
  Check,
  Trash2,
  Activity,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DEMO_CONSULTATION_REQUESTS } from "@/lib/mock-data";
import { ConsultationRequest } from "@/types";
import { WebRTCCallModal } from "@/components/call/WebRTCCallModal";
import { DoctorIncomingCallBanner } from "@/components/doctor/DoctorIncomingCallBanner";

export default function DoctorQueuePage() {
  const router = useRouter();
  const [queue, setQueue] = useState<ConsultationRequest[]>(DEMO_CONSULTATION_REQUESTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "flagged" | "caution" | "safe">("all");
  const [activeCall, setActiveCall] = useState<{
    consultation: ConsultationRequest;
    callType: "video" | "audio";
  } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newPatientAlert, setNewPatientAlert] = useState<string | null>(null);
  const [attendedCount, setAttendedCount] = useState(4);
  const [isSimulating, setIsSimulating] = useState(false);

  const [doctorAuth, setDoctorAuth] = useState<{
    name: string;
    role: string;
    npi: string;
    hospital?: string;
  } | null>(null);

  // Play pleasant clinical chime for new queue arrivals
  const playQueueChime = useCallback(() => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.55);
    } catch (_) {}
  }, [soundEnabled]);

  // Load Doctor Auth Session
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

  // 1. Load initial queue from Supabase and LocalStorage
  useEffect(() => {
    async function loadQueueData() {
      let combined: ConsultationRequest[] = [...DEMO_CONSULTATION_REQUESTS];

      // Load from localStorage first for instant local sync
      if (typeof window !== "undefined") {
        try {
          const localStored = localStorage.getItem("cds_patient_queue");
          if (localStored) {
            const parsed = JSON.parse(localStored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const existingIds = new Set(combined.map((c) => c.id));
              const newItems = parsed.filter((p: any) => !existingIds.has(p.id));
              combined = [...newItems, ...combined];
            }
          }
        } catch (_) {}
      }

      // Load from Supabase consultation_requests table if exists
      try {
        const { data } = await supabase
          .from("consultation_requests")
          .select("*")
          .order("requested_at", { ascending: false });

        if (data && data.length > 0) {
          const mapped: ConsultationRequest[] = data.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            patientName: d.patient_name || "Registered Patient",
            patientId: d.patient_id || `CDS-${d.id?.slice(0, 4) || "8842"}`,
            patientAge: d.patient_age || 38,
            patientGender: d.patient_gender || "Patient",
            conditions: d.conditions || ["Type 2 Diabetes", "Hypertension"],
            foodName: d.food_name || "Scanned Dish",
            brand: d.brand || "Identified Product",
            category: d.category || "Meal",
            imageUrl: d.image_url,
            triageScore: d.triage_score || 85,
            overallStatus: d.overall_status || "flagged",
            clinicalFlags: d.clinical_flags || [],
            nutrition: d.nutrition,
            patientNote: d.patient_note,
            requestedAt: new Date(d.requested_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " (Live)",
            status: d.status || "pending",
            roomId: d.room_id || `cds-room-${d.id}`,
          }));

          const existingIds = new Set(combined.map((c) => c.id));
          const newRemote = mapped.filter((m) => !existingIds.has(m.id));
          combined = [...newRemote, ...combined];
        }
      } catch (err) {
        console.warn("Could not query Supabase consultation_requests:", err);
      }

      setQueue(combined);
    }

    loadQueueData();

    // 2. Real-time Subscription: Listen for live patient submissions
    const channel = supabase
      .channel("doctor_consultations_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "consultation_requests" },
        (payload) => {
          const d = payload.new;
          const newPatient: ConsultationRequest = {
            id: d.id,
            userId: d.user_id,
            patientName: d.patient_name || "New Patient",
            patientId: d.patient_id || "CDS-NEW",
            patientAge: d.patient_age || 35,
            patientGender: d.patient_gender || "Patient",
            conditions: d.conditions || ["Diabetes (Type 2)", "Hypertension"],
            foodName: d.food_name || "Scanned Dish",
            brand: d.brand || "Identified Product",
            category: d.category || "Meal",
            imageUrl: d.image_url,
            triageScore: d.triage_score || 90,
            overallStatus: d.overall_status || "flagged",
            clinicalFlags: d.clinical_flags || [],
            nutrition: d.nutrition,
            patientNote: d.patient_note,
            requestedAt: "Just now (Live)",
            status: "pending",
            roomId: d.room_id || `cds-room-${d.id}`,
          };

          setQueue((prev) => [newPatient, ...prev]);
          playQueueChime();
          setNewPatientAlert(`New Patient Added to Queue: ${newPatient.patientName} (${newPatient.foodName})`);
          setTimeout(() => setNewPatientAlert(null), 5000);
        }
      )
      .on(
        "broadcast",
        { event: "new_consultation_request" },
        ({ payload }) => {
          if (payload) {
            const item = payload as ConsultationRequest;
            setQueue((prev) => {
              if (prev.find((p) => p.id === item.id)) return prev;
              return [item, ...prev];
            });
            playQueueChime();
            setNewPatientAlert(`New Patient in Queue: ${item.patientName} (${item.foodName})`);
            setTimeout(() => setNewPatientAlert(null), 5000);
          }
        }
      )
      .subscribe();

    // Also listen for local custom events (same browser tab communication)
    const handleLocalQueueUpdate = (e: any) => {
      if (e.detail) {
        const item = e.detail as ConsultationRequest;
        setQueue((prev) => {
          if (prev.find((p) => p.id === item.id)) return prev;
          return [item, ...prev];
        });
        playQueueChime();
        setNewPatientAlert(`New Patient in Queue: ${item.patientName} (${item.foodName})`);
        setTimeout(() => setNewPatientAlert(null), 5000);
      }
    };

    window.addEventListener("cds_queue_updated", handleLocalQueueUpdate);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("cds_queue_updated", handleLocalQueueUpdate);
    };
  }, [playQueueChime]);

  // Simulate incoming patient into queue
  const handleSimulateQueuePatient = () => {
    setIsSimulating(true);

    const mockCandidates = [
      {
        patientName: "Rajesh Malhotra",
        patientId: "CDS-9104",
        age: 44,
        gender: "Male",
        conditions: ["Type 2 Diabetes", "High Cholesterol"],
        foodName: "Spicy Pepperoni Pan Pizza",
        brand: "CrustCraft Oven",
        category: "Fast Food",
        imageUrl: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=200&auto=format&fit=crop&q=80",
        triageScore: 92,
        overallStatus: "flagged" as const,
        clinicalFlags: [
          { message: "Severe Sodium Spike: 980mg per slice exceeds 400mg limit", severity: "critical" },
          { message: "Refined Bleached Flour (Maida) 42g Net Carbs", severity: "high" },
        ],
        patientNote: "Ate 2 slices before dinner, blood glucose spiked to 210 mg/dL. Requesting urgent advice.",
      },
      {
        patientName: "Meera Krishnan",
        patientId: "CDS-7320",
        age: 32,
        gender: "Female",
        conditions: ["Gestational Diabetes Target", "Stage 1 Hypertension"],
        foodName: "Artisan Low-Cal Caramel Yogurt",
        brand: "DairyPure Light",
        category: "Dairy & Snacks",
        imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&auto=format&fit=crop&q=80",
        triageScore: 68,
        overallStatus: "caution" as const,
        clinicalFlags: [
          { message: "Hidden Polyols (Maltitol Syrup INS 965): 4.8g", severity: "moderate" },
        ],
        patientNote: "Label says zero sugar, but my doctor warned me about artificial sweeteners.",
      },
      {
        patientName: "Vikram Singhania",
        patientId: "CDS-5512",
        age: 51,
        gender: "Male",
        conditions: ["Chronic Kidney Disease (Stage 2)", "Hypertension"],
        foodName: "Instant Masala Cup Noodles",
        brand: "SpeedyMeal Kitchen",
        category: "Instant Foods",
        imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&auto=format&fit=crop&q=80",
        triageScore: 96,
        overallStatus: "flagged" as const,
        clinicalFlags: [
          { message: "Dangerous Sodium Density: 1,380mg in single container", severity: "critical" },
          { message: "TBHQ Preservative (INS 319) Detected", severity: "high" },
        ],
        patientNote: "Can I drink the broth if I leave the noodles? I have high blood pressure.",
      },
    ];

    const pick = mockCandidates[Math.floor(Math.random() * mockCandidates.length)];
    const newConsultation: ConsultationRequest = {
      id: `sim-queue-${Date.now()}`,
      patientName: pick.patientName,
      patientId: pick.patientId,
      patientAge: pick.age,
      patientGender: pick.gender,
      conditions: pick.conditions,
      foodName: pick.foodName,
      brand: pick.brand,
      category: pick.category,
      imageUrl: pick.imageUrl,
      triageScore: pick.triageScore,
      overallStatus: pick.overallStatus,
      clinicalFlags: pick.clinicalFlags,
      patientNote: pick.patientNote,
      requestedAt: "Just now (Live)",
      status: "pending",
      roomId: `cds-room-${Date.now()}`,
    };

    setTimeout(() => {
      setQueue((prev) => [newConsultation, ...prev]);
      playQueueChime();
      setNewPatientAlert(`New Patient in Queue: ${newConsultation.patientName} (${newConsultation.foodName})`);
      setIsSimulating(false);
      setTimeout(() => setNewPatientAlert(null), 5000);
    }, 400);
  };

  // Mark patient consultation completed / remove from queue
  const handleCompleteConsultation = (id: string, name: string) => {
    setQueue((prev) => prev.filter((p) => p.id !== id));
    setAttendedCount((prev) => prev + 1);
    setNewPatientAlert(`Consultation Completed with ${name}`);
    setTimeout(() => setNewPatientAlert(null), 3000);
  };

  // Filter queue items
  const filteredQueue = queue.filter((item) => {
    const matchesSearch =
      item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.patientId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : item.overallStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getTriageScorePill = (score: number) => {
    if (score <= 30) {
      return {
        label: "0-30 Green (Safe)",
        pill: "bg-emerald-50 text-emerald-800 border-emerald-300",
        badge: "bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]",
        icon: ShieldCheck,
      };
    } else if (score <= 70) {
      return {
        label: "31-70 Yellow (Caution)",
        pill: "bg-amber-50 text-amber-900 border-amber-300",
        badge: "bg-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.3)]",
        icon: ShieldAlert,
      };
    } else {
      return {
        label: "71-100 Red (High Risk)",
        pill: "bg-rose-50 text-rose-800 border-rose-300",
        badge: "bg-rose-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.3)]",
        icon: ShieldX,
      };
    }
  };

  const highRiskCount = queue.filter((p) => p.overallStatus === "flagged" || p.triageScore > 70).length;

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant/20 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <Link
              href="/doctor"
              className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors bg-surface-container px-2.5 sm:px-3 py-1.5 rounded-xl border border-black/5 shrink-0 active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Dashboard</span>
            </Link>

            <div className="h-5 w-px bg-outline-variant/30 hidden sm:block" />

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-2xs">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-lg font-bold text-on-surface tracking-tight truncate">
                    Live Patient Queue
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-800 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {queue.length} Waiting
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-on-surface-variant truncate">
                  Real-time incoming food triage teleconsultations
                </p>
              </div>
            </div>
          </div>

          {/* Right: Controls & Clinician Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Chime Sound Toggle */}
            <button
              onClick={() => setSoundEnabled((prev) => !prev)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                soundEnabled
                  ? "bg-surface-container text-primary border-outline-variant/20 hover:bg-surface-container-high"
                  : "bg-surface-container-high text-on-surface-variant border-transparent"
              }`}
              title={soundEnabled ? "Audio chimes active for incoming patients" : "Chimes muted"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Test Simulate Button */}
            <button
              onClick={handleSimulateQueuePatient}
              disabled={isSimulating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-primary hover:bg-surface-tint text-on-primary text-xs font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50"
              title="Simulate incoming customer food scan entering the queue"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Simulate Incoming Scan</span>
              <span className="sm:hidden">Simulate</span>
            </button>

            <div className="text-right hidden md:block pl-2 border-l border-outline-variant/20">
              <p className="text-xs font-bold text-on-surface leading-tight">
                {doctorAuth?.name || "Dr. Sarah Jenkins, MD"}
              </p>
              <p className="text-[11px] text-on-surface-variant">
                NPI: {doctorAuth?.npi || "1942857102"} · Active Attending
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Real-time Alert Banner */}
      {newPatientAlert && (
        <div className="bg-primary text-on-primary px-4 py-2.5 shadow-md flex items-center justify-between text-xs font-medium animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <Radio className="w-4 h-4 animate-pulse shrink-0" />
            <span className="font-bold">{newPatientAlert}</span>
          </div>
          <button
            onClick={() => setNewPatientAlert(null)}
            className="text-on-primary/80 hover:text-on-primary text-xs ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Queue Body */}
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6 flex-1">
        {/* Top Queue Statistics Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl bg-surface-container-lowest p-3.5 sm:p-4 shadow-2xs border border-outline-variant/20">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Waiting in Queue
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-on-surface">
                {queue.length}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">customers</span>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-container-lowest p-3.5 sm:p-4 shadow-2xs border border-outline-variant/20">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
              Urgent (Red Flags)
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-rose-600">
                {highRiskCount}
              </span>
              <span className="text-xs text-rose-700 font-medium">high priority</span>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-container-lowest p-3.5 sm:p-4 shadow-2xs border border-outline-variant/20">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Avg Patient Wait
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-primary">
                ~2.4
              </span>
              <span className="text-xs text-on-surface-variant font-medium">minutes</span>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-container-lowest p-3.5 sm:p-4 shadow-2xs border border-outline-variant/20">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Attended Today
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                {attendedCount}
              </span>
              <span className="text-xs text-emerald-700 font-medium">completed</span>
            </div>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-container-lowest p-3 sm:p-4 rounded-2xl border border-outline-variant/20 shadow-2xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search queue by patient, ID, or scanned food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-container-low text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/30 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0 -mx-1 px-1">
            {(
              [
                { id: "all", label: `All (${queue.length})` },
                { id: "flagged", label: `Red Flags (${highRiskCount})` },
                { id: "caution", label: `Caution` },
                { id: "safe", label: `Compliant` },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 active:scale-95 ${
                  statusFilter === f.id
                    ? "bg-primary text-on-primary shadow-xs"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Patient Queue Cards */}
        <div className="flex flex-col gap-4">
          {filteredQueue.map((item, index) => {
            const triageInfo = getTriageScorePill(item.triageScore);
            const StatusIcon = triageInfo.icon;
            const isNext = index === 0;

            return (
              <div
                key={item.id}
                className={`bg-surface-container-lowest rounded-2xl sm:rounded-3xl p-4 sm:p-6 border transition-all flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden ${
                  isNext
                    ? "border-primary/40 shadow-md ring-2 ring-primary/10"
                    : "border-outline-variant/20 shadow-2xs hover:shadow-xs"
                }`}
              >
                {/* Queue Position Pill Ribbon */}
                <div className="absolute top-0 left-0">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase px-3 py-1 rounded-br-2xl tracking-wider ${
                      isNext
                        ? "bg-primary text-on-primary shadow-xs"
                        : "bg-surface-container text-on-surface-variant border-r border-b border-outline-variant/20"
                    }`}
                  >
                    {isNext ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        #1 Next in Queue
                      </>
                    ) : (
                      `#${index + 1} Waiting in Queue`
                    )}
                  </span>
                </div>

                {/* Left: Customer Info & Scanned Food Preview */}
                <div className="flex items-start gap-3.5 sm:gap-5 flex-1 min-w-0 pt-4 lg:pt-0">
                  {/* Scanned Food Thumbnail */}
                  <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-surface-container shrink-0 border border-outline-variant/20 shadow-2xs">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.foodName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant p-2 text-center bg-gradient-to-tr from-surface-container to-surface-container-high">
                        <Sparkles className="w-6 h-6 text-primary mb-1" />
                        <span className="text-[10px] font-bold">Live Scan</span>
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 bg-black/75 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold">
                      SCAN
                    </span>
                  </div>

                  {/* Customer & Food Metadata */}
                  <div className="flex-1 min-w-0">
                    {/* Patient Name & Details */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-on-surface tracking-tight truncate">
                        {item.patientName}
                      </h3>
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant">
                        #{item.patientId}
                      </span>
                      {item.patientAge && item.patientGender && (
                        <span className="text-xs text-on-surface-variant font-medium">
                          · {item.patientAge}y, {item.patientGender}
                        </span>
                      )}
                      <span className="text-xs text-primary flex items-center gap-1 font-semibold ml-auto sm:ml-0">
                        <Clock className="w-3 h-3" />
                        {item.requestedAt}
                      </span>
                    </div>

                    {/* Patient Chronic Conditions */}
                    {item.conditions && (
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {item.conditions.map((cond, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary-fixed/40 text-on-primary-fixed-variant"
                          >
                            {cond}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Scanned Food Headline */}
                    <div className="mt-2.5 pt-2.5 border-t border-outline-variant/10">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                          Scanned Food:
                        </span>
                        <span className="text-sm font-bold text-on-surface">
                          {item.foodName}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          ({item.brand} · {item.category})
                        </span>
                      </div>

                      {/* Patient Note / Request */}
                      {item.patientNote && (
                        <p className="text-xs text-on-surface-variant italic mt-1.5 bg-surface-container-low px-3 py-1.5 rounded-xl border border-black/5 flex items-start gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>"{item.patientNote}"</span>
                        </p>
                      )}

                      {/* Clinical Flags Pills */}
                      {item.clinicalFlags && item.clinicalFlags.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {item.clinicalFlags.map((flag, idx) => (
                            <span
                              key={idx}
                              className={`text-[11px] font-medium px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
                                flag.severity === "high" || flag.severity === "critical"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {flag.title || (flag as any).message}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Score Badge and Immediate Calling Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between gap-3 sm:gap-4 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-outline-variant/10">
                  {/* Triage Score Badge */}
                  <div className="flex items-center lg:items-end gap-2.5 justify-between sm:justify-start">
                    <div className="flex flex-col items-start lg:items-end">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex items-baseline gap-1 px-3.5 py-1 rounded-xl font-bold ${triageInfo.badge}`}
                        >
                          <span className="text-2xl font-extrabold leading-none">
                            {item.triageScore}
                          </span>
                          <span className="text-[10px] uppercase font-bold opacity-90">
                            / 100
                          </span>
                        </div>
                        <StatusIcon className="w-5 h-5 text-on-surface-variant" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider mt-1 text-on-surface-variant">
                        {triageInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Calling and Completion Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Audio Call Button */}
                    <button
                      onClick={() => {
                        setActiveCall({
                          consultation: item,
                          callType: "audio",
                        });
                        try {
                          const ch = supabase.channel("cds_global_telehealth");
                          ch.send({
                            type: "broadcast",
                            event: "doctor_call_patient",
                            payload: {
                              roomId: item.roomId,
                              patientName: item.patientName,
                              patientId: item.patientId,
                              callType: "audio",
                            },
                          });
                        } catch (_) {}
                      }}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold transition-all shadow-2xs active:scale-95"
                      title="Start WebRTC Audio Call with patient"
                    >
                      <Phone className="w-4 h-4 text-primary" />
                      <span>Audio</span>
                    </button>

                    {/* Video Call Button */}
                    <button
                      onClick={() => {
                        setActiveCall({
                          consultation: item,
                          callType: "video",
                        });
                        try {
                          const ch = supabase.channel("cds_global_telehealth");
                          ch.send({
                            type: "broadcast",
                            event: "doctor_call_patient",
                            payload: {
                              roomId: item.roomId,
                              patientName: item.patientName,
                              patientId: item.patientId,
                              callType: "video",
                            },
                          });
                        } catch (_) {}
                      }}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-primary hover:bg-surface-tint text-on-primary text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-95"
                      title="Launch WebRTC Video Teleconsultation"
                    >
                      <Video className="w-4 h-4" />
                      <span>Start Video Call</span>
                    </button>

                    {/* Complete Consultation Button */}
                    <button
                      onClick={() => handleCompleteConsultation(item.id, item.patientName)}
                      className="p-2.5 rounded-xl bg-surface-container hover:bg-emerald-50 hover:text-emerald-700 text-on-surface-variant transition-colors"
                      title="Mark Attended / Remove from Queue"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {filteredQueue.length === 0 && (
            <div className="bg-surface-container-lowest rounded-3xl p-12 text-center border border-outline-variant/20 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-on-surface">Queue is Currently Clear</h3>
              <p className="text-xs text-on-surface-variant max-w-sm">
                No patients are waiting in the queue. New consultation requests from food scans will appear here automatically with real-time audio chime notifications.
              </p>
              <button
                onClick={handleSimulateQueuePatient}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-surface-tint text-on-primary text-xs font-bold transition-all shadow-xs active:scale-95"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Simulate Incoming Patient Scan</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Full-Screen WebRTC Call Modal */}
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

      {/* Global Inbound Call Chime & Ringing Receiver */}
      <DoctorIncomingCallBanner />
    </div>
  );
}
