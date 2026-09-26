"use client";

import { User, Activity, AlertCircle, ChevronRight } from "lucide-react";
import { DOCTOR_PATIENTS } from "@/lib/mock-data";
import { DoctorPatient } from "@/types";

interface DoctorPatientSelectorProps {
  selectedPatient: DoctorPatient;
  onSelectPatient: (patient: DoctorPatient) => void;
  patients?: (DoctorPatient & { isLive?: boolean })[];
}

export function DoctorPatientSelector({
  selectedPatient,
  onSelectPatient,
  patients = DOCTOR_PATIENTS,
}: DoctorPatientSelectorProps) {
  return (
    <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl shadow-xs border border-outline-variant/20 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* Active Patient Identity */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-primary/90 to-primary-container text-on-primary flex items-center justify-center font-bold text-sm sm:text-base shadow-xs shrink-0 tracking-tight">
          {selectedPatient.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base sm:text-lg font-bold text-on-surface tracking-tight truncate">
              {selectedPatient.name}
            </h2>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-surface-container text-primary font-semibold border border-outline-variant/20">
              #{selectedPatient.patientId}
            </span>
            {(selectedPatient as any).isLive && (
              <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/25 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live Patient
              </span>
            )}
          </div>
          <p className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="font-medium">{selectedPatient.age} yrs · {selectedPatient.gender}</span>
            <span className="text-outline/50">•</span>
            <span className="text-on-surface font-medium truncate">
              {Array.isArray(selectedPatient.conditions) && selectedPatient.conditions.length > 0
                ? selectedPatient.conditions.join(" · ")
                : "Active Nutritional Monitoring"}
            </span>
          </p>
        </div>
      </div>

      {/* Touch-Friendly Horizontal Scrollable Cohort Switcher on Mobile / Clean Pills on Desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-outline-variant/15">
        <span className="text-xs font-semibold text-on-surface-variant shrink-0">
          Patient Cohort:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0 -mx-1 px-1">
          {patients.map((p) => {
            const isSelected = p.id === selectedPatient.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPatient(p)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 active:scale-95 ${
                  isSelected
                    ? "bg-primary text-on-primary shadow-xs"
                    : "bg-surface-container hover:bg-surface-container-high text-on-surface border border-transparent"
                }`}
              >
                {p.isLive && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? "bg-white" : "bg-emerald-600"
                    } animate-pulse`}
                  />
                )}
                <span>{p.name.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
