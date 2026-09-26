"use client";

import { useState, useEffect } from "react";
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
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DEMO_CONSULTATION_REQUESTS } from "@/lib/mock-data";
import { ConsultationRequest } from "@/types";
import { WebRTCCallModal } from "@/components/call/WebRTCCallModal";

export default function DoctorCustomersPage() {
  const router = useRouter();
  const [consultations, setConsultations] = useState<ConsultationRequest[]>(DEMO_CONSULTATION_REQUESTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "flagged" | "caution" | "safe">("all");
  const [activeCall, setActiveCall] = useState<{
    consultation: ConsultationRequest;
    callType: "video" | "audio";
  } | null>(null);

  const [doctorAuth, setDoctorAuth] = useState<{
    name: string;
    role: string;
    npi: string;
    hospital?: string;
  } | null>(null);

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

  // Listen for Live Inbound Teleconsult Requests via Supabase
  useEffect(() => {
    async function loadRemoteConsultations() {
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

          setConsultations((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const newUnique = mapped.filter((m) => !existingIds.has(m.id));
            return [...newUnique, ...prev];
          });
        }
      } catch (err) {
        console.warn("Could not fetch consultation_requests table:", err);
      }
    }

    loadRemoteConsultations();

    // Supabase Realtime Subscription for live referrals
    const channel = supabase
      .channel("doctor_consultations_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "consultation_requests" },
        (payload) => {
          const d = payload.new;
          const newReq: ConsultationRequest = {
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
          setConsultations((prev) => [newReq, ...prev]);
        }
      )
      .on(
        "broadcast",
        { event: "new_consultation_request" },
        ({ payload }) => {
          if (payload) {
            setConsultations((prev) => [payload as ConsultationRequest, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filtered consultations
  const filtered = consultations.filter((c) => {
    const matchesSearch =
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patientId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : c.overallStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getTriageScorePill = (score: number) => {
    if (score <= 30) {
      return {
        label: "0-30 Green (Safe)",
        bg: "bg-emerald-500/15 text-emerald-700 border-emerald-300",
        badge: "bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]",
        icon: ShieldCheck,
      };
    } else if (score <= 70) {
      return {
        label: "31-70 Yellow (Caution)",
        bg: "bg-amber-500/15 text-amber-800 border-amber-300",
        badge: "bg-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]",
        icon: ShieldAlert,
      };
    } else {
      return {
        label: "71-100 Red (Risk)",
        bg: "bg-rose-500/15 text-rose-700 border-rose-300",
        badge: "bg-rose-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]",
        icon: ShieldX,
      };
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top Doctor Navigation Bar */}
      <header className="sticky top-0 z-40 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/20 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/doctor"
              className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors bg-surface-container px-3 py-1.5 rounded-xl border border-black/5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>

            <div className="h-5 w-px bg-outline-variant/30 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary text-on-primary">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-on-surface flex items-center gap-2">
                  Customer Teleconsult Queue
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-clinical-mono font-bold uppercase bg-primary-fixed text-on-primary-fixed">
                    {filtered.length} Active
                  </span>
                </h1>
                <p className="text-xs text-on-surface-variant">
                  Real-time triage referrals, scanned food evidence & WebRTC calling suite
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-clinical-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>WebRTC Signaling Live</span>
            </div>

            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-on-surface leading-tight">
                {doctorAuth?.name || "Dr. Sarah Jenkins, MD"}
              </p>
              <p className="text-[10px] font-clinical-mono text-on-surface-variant">
                NPI: {doctorAuth?.npi || "1942857102"} · Endocrinologist
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 flex flex-col gap-6 flex-1">
        {/* Controls: Search and Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/20 shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer name, patient ID, or food name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-container-low text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary/30"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { id: "all", label: "All Referrals" },
                { id: "flagged", label: "Red (71-100)" },
                { id: "caution", label: "Yellow (31-70)" },
                { id: "safe", label: "Green (0-30)" },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
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

        {/* Inbound Customers List */}
        <div className="grid grid-cols-1 gap-5">
          {filtered.map((item) => {
            const triageInfo = getTriageScorePill(item.triageScore);
            const StatusIcon = triageInfo.icon;

            return (
              <div
                key={item.id}
                className="bg-surface-container-lowest rounded-3xl p-5 sm:p-6 border border-outline-variant/20 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
              >
                {/* Left: Customer Info & Scanned Food Preview */}
                <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
                  {/* Scanned Food Thumbnail */}
                  <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-surface-container shrink-0 border border-outline-variant/20 shadow-xs">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.foodName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant p-2 text-center bg-gradient-to-tr from-surface-container to-surface-container-high">
                        <Sparkles className="w-6 h-6 text-primary mb-1" />
                        <span className="text-[10px] font-clinical-mono">Live OCR</span>
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 bg-black/70 backdrop-blur-xs text-white text-[9px] font-clinical-mono px-1.5 py-0.5 rounded font-bold">
                      SCAN
                    </span>
                  </div>

                  {/* Customer & Food Metadata */}
                  <div className="flex-1 min-w-0">
                    {/* Patient Bar */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-on-surface">
                        {item.patientName}
                      </h3>
                      <span className="font-clinical-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant">
                        {item.patientId}
                      </span>
                      {item.patientAge && item.patientGender && (
                        <span className="text-xs text-on-surface-variant">
                          · {item.patientAge}y, {item.patientGender}
                        </span>
                      )}
                      <span className="text-xs text-primary font-clinical-mono flex items-center gap-1 font-medium ml-auto sm:ml-0">
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
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-fixed/40 text-on-primary-fixed-variant"
                          >
                            {cond}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Scanned Food Headline */}
                    <div className="mt-3 pt-3 border-t border-outline-variant/10">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-clinical-mono">
                          Scanned Item:
                        </span>
                        <span className="text-sm font-bold text-on-surface">
                          {item.foodName}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          ({item.brand} · {item.category})
                        </span>
                      </div>

                      {/* Patient Note */}
                      {item.patientNote && (
                        <p className="text-xs text-on-surface-variant italic mt-1 bg-surface-container-low px-3 py-1.5 rounded-xl border border-black/5 flex items-start gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>"{item.patientNote}"</span>
                        </p>
                      )}

                      {/* Clinical Flags Pills */}
                      {item.clinicalFlags && item.clinicalFlags.length > 0 && (
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {item.clinicalFlags.map((flag, idx) => (
                            <span
                              key={idx}
                              className={`text-[11px] font-medium px-2 py-0.5 rounded-md border flex items-center gap-1 ${
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

                {/* Right: Score Badge and Calling Action Buttons */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-4 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-outline-variant/10">
                  {/* Triage Score Badge */}
                  <div className="flex flex-col items-start lg:items-end">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex items-baseline gap-1 px-3.5 py-1.5 rounded-2xl font-bold ${triageInfo.badge}`}
                      >
                        <span className="font-clinical-mono text-2xl font-black leading-none">
                          {item.triageScore}
                        </span>
                        <span className="text-[10px] font-clinical-mono uppercase opacity-90">
                          / 100
                        </span>
                      </div>
                      <StatusIcon className="w-5 h-5 text-on-surface-variant" />
                    </div>
                    <span className="text-[11px] font-clinical-mono font-bold uppercase tracking-wider mt-1 text-on-surface-variant">
                      {triageInfo.label}
                    </span>
                  </div>

                  {/* Dual WebRTC Call Actions */}
                  <div className="flex items-center gap-2.5">
                    {/* Audio Call Button */}
                    <button
                      onClick={() =>
                        setActiveCall({
                          consultation: item,
                          callType: "audio",
                        })
                      }
                      className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold transition-all shadow-2xs active:scale-98"
                      title="Start WebRTC Audio Call"
                    >
                      <Phone className="w-4 h-4 text-primary" />
                      <span>Audio Call</span>
                    </button>

                    {/* Video Call Button */}
                    <button
                      onClick={() =>
                        setActiveCall({
                          consultation: item,
                          callType: "video",
                        })
                      }
                      className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-primary hover:bg-surface-tint text-on-primary text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-98"
                      title="Start WebRTC Full-Screen Video Call"
                    >
                      <Video className="w-4 h-4" />
                      <span>Video Call</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="bg-surface-container-lowest rounded-3xl p-12 text-center border border-outline-variant/20 flex flex-col items-center justify-center gap-3">
              <div className="p-4 rounded-full bg-surface-container text-on-surface-variant">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-on-surface">No referrals found</h3>
              <p className="text-xs text-on-surface-variant max-w-sm">
                No customer consultation requests match the current filters. New requests from food scans will appear here automatically in real time.
              </p>
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
    </div>
  );
}
