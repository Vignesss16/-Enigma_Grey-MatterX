"use client";

import { useState } from "react";
import Link from "next/link";
import { Stethoscope, Clock, ShieldCheck, Send, Check } from "lucide-react";
import { MobileHeader } from "@/components/navigation/MobileHeader";
import { DoctorPatientSelector } from "@/components/doctor/DoctorPatientSelector";
import { DoctorIngestionBay } from "@/components/doctor/DoctorIngestionBay";
import { DoctorAssessmentsTable } from "@/components/doctor/DoctorAssessmentsTable";
import { DoctorSensitivityTuner } from "@/components/doctor/DoctorSensitivityTuner";
import { DoctorExplainabilitySpotlight } from "@/components/doctor/DoctorExplainabilitySpotlight";
import { DOCTOR_PATIENTS } from "@/lib/mock-data";
import { DoctorPatient } from "@/types";

export default function DoctorDashboardPage() {
  const [selectedPatient, setSelectedPatient] = useState<DoctorPatient>(
    DOCTOR_PATIENTS[0]
  );
  const [doctorNote, setDoctorNote] = useState("");
  const [noteSent, setNoteSent] = useState(false);

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
    <>
      <MobileHeader title="Physician CDS Portal" showBack />

      <div className="px-gutter lg:px-space-xl py-space-md max-w-7xl mx-auto flex flex-col gap-space-lg">
        {/* Physician Header & Session Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md pb-space-sm border-b border-outline-variant/15">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-space-xs text-primary">
              <span className="font-clinical-mono text-[10px] uppercase tracking-widest text-primary font-bold px-2 py-0.5 rounded bg-primary-fixed/40 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5" />
                CLINICAL DECISION SUPPORT · PHYSICIAN CONSOLE
              </span>
              <span className="text-outline text-xs">·</span>
              <span className="font-clinical-mono text-xs text-tertiary">
                DR. SUNITA SEN, MD (ENDOCRINOLOGY)
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-on-surface tracking-tight">
              Clinician Food Risk &amp; CDS Dashboard
            </h1>

            <p className="text-xs text-on-surface-variant">
              High-throughput OCR ingestion, automated chemical compound assay, and patient dietary guideline enforcement.
            </p>
          </div>

          {/* Mode Switcher Pill: Patient View vs Doctor View */}
          <div className="flex items-center gap-2 self-start lg:self-auto bg-surface-container-lowest p-1.5 rounded-xl shadow-xs border border-outline-variant/20">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Patient View
            </Link>
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-on-primary shadow-xs">
              Doctor Console
            </span>
          </div>
        </div>

        {/* Patient Cohort Selector */}
        <DoctorPatientSelector
          selectedPatient={selectedPatient}
          onSelectPatient={setSelectedPatient}
        />

        {/* Top 3 CDS Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-xs border border-outline-variant/20 flex flex-col justify-between">
            <span className="font-clinical-mono text-xs text-tertiary uppercase tracking-wider">
              Evaluated This Month
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-on-surface">42</span>
              <span className="text-xs text-on-surface-variant">patient items</span>
            </div>
            <div className="mt-3 pt-2 border-t border-outline-variant/15 flex justify-between text-xs font-medium">
              <span className="text-emerald-700">31 Compliant</span>
              <span className="text-red-700 font-semibold">11 Flagged Triggers</span>
            </div>
          </div>

          <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-xs border border-outline-variant/20 flex flex-col justify-between">
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

          <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-xs border border-outline-variant/20 flex flex-col justify-between">
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
              <span className="font-clinical-mono text-tertiary">0 inferences</span>
            </div>
          </div>
        </div>

        {/* 2-Column Clinical Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Left Column (8 cols): Ingestion Bay & Assessments Table */}
          <div className="lg:col-span-8 flex flex-col gap-space-lg">
            <DoctorIngestionBay />
            <DoctorAssessmentsTable />
          </div>

          {/* Right Column (4 cols): Sensitivity Tuner, Explainability, & Prescriptions */}
          <div className="lg:col-span-4 flex flex-col gap-space-lg">
            <DoctorSensitivityTuner />
            <DoctorExplainabilitySpotlight />

            {/* Prescribe Dietary Guidance Directly to Patient */}
            <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-outline-variant/20 flex flex-col gap-space-sm">
              <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/15">
                <h3 className="text-base font-semibold text-on-surface">
                  Physician Prescription Note
                </h3>
                <span className="font-clinical-mono text-[10px] text-primary uppercase font-bold">
                  DIRECT SYNC
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Send verified dietary caution or alternative recommendation to {selectedPatient.name}'s mobile app:
              </p>
              <form onSubmit={handleSendNote} className="flex flex-col gap-2 mt-1">
                <textarea
                  rows={3}
                  value={doctorNote}
                  onChange={(e) => setDoctorNote(e.target.value)}
                  placeholder={`e.g. Please swap regular digestive biscuits with roasted seed thins (Net carbs <5g)...`}
                  className="w-full p-2.5 rounded-lg bg-surface-container-low text-xs text-on-surface border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="submit"
                  disabled={noteSent}
                  className="self-end px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-surface-tint active:scale-95 transition-all flex items-center gap-1.5 shadow-xs"
                >
                  {noteSent ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-primary-fixed" />
                      <span>Prescription Dispatched!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send to Patient App</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
