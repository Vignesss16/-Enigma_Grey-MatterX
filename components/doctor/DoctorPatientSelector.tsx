"use client";

import { User, Activity, AlertCircle } from "lucide-react";
import { DOCTOR_PATIENTS } from "@/lib/mock-data";
import { DoctorPatient } from "@/types";

interface DoctorPatientSelectorProps {
  selectedPatient: DoctorPatient;
  onSelectPatient: (patient: DoctorPatient) => void;
}

export function DoctorPatientSelector({
  selectedPatient,
  onSelectPatient,
}: DoctorPatientSelectorProps) {
  return (
    <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
      <div className="flex items-center gap-space-sm">
        <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-base shadow-xs">
          {selectedPatient.name.split(" ").map(n => n[0]).join("")}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-on-surface">
              Patient: {selectedPatient.name}
            </h2>
            <span className="font-clinical-mono text-xs px-2 py-0.5 rounded bg-surface-container text-primary font-semibold">
              ID: #{selectedPatient.patientId}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
            <span>{selectedPatient.age} yrs · {selectedPatient.gender}</span>
            <span>•</span>
            <span className="font-medium text-on-surface">
              {selectedPatient.conditions.join(" · ")}
            </span>
          </p>
        </div>
      </div>

      {/* Patient Switcher Dropdown / Pills */}
      <div className="flex items-center gap-2">
        <span className="font-clinical-mono text-xs text-outline uppercase tracking-wider">
          Cohort Switcher:
        </span>
        <div className="flex items-center gap-1.5">
          {DOCTOR_PATIENTS.map((p) => {
            const isSelected = p.id === selectedPatient.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPatient(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-primary text-on-primary shadow-xs"
                    : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {p.name.split(" ")[0]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
