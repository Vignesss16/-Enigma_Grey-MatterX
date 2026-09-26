"use client";

import { useState } from "react";
import { Check, Shield, Save } from "lucide-react";
import { DEFAULT_PATIENT_PROFILE } from "@/lib/mock-data";
import { HealthProfile } from "@/types";

export function ProfileForm() {
  const [profile, setProfile] = useState<HealthProfile>(DEFAULT_PATIENT_PROFILE);
  const [saved, setSaved] = useState(false);

  const toggleCondition = (conditionId: string) => {
    // Toggle active state
    setProfile((prev) => {
      const exists = prev.conditions.some((c) => c.id === conditionId);
      if (exists) {
        return {
          ...prev,
          conditions: prev.conditions.filter((c) => c.id !== conditionId),
        };
      } else {
        const labels: Record<string, string> = {
          diabetes_type_2: "Diabetes (Type 2)",
          hypertension: "Stage 1 Hypertension",
          peanut_allergy: "Peanut Sensitivity / Allergy",
          celiac_gluten: "Celiac / Gluten Intolerance",
        };
        return {
          ...prev,
          conditions: [
            ...prev.conditions,
            {
              id: conditionId as any,
              label: labels[conditionId] || conditionId,
              status: "active",
              criticality: "high",
            },
          ],
        };
      }
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-space-lg w-full max-w-2xl mx-auto">
      {/* Patient Identification Card */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/20 flex items-center justify-between">
        <div className="flex items-center gap-space-md">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg">
            AR
          </div>
          <div>
            <h2 className="text-lg font-bold text-on-surface">{profile.name}</h2>
            <p className="text-xs text-on-surface-variant font-clinical-mono">
              Patient ID: {profile.patientId} · Age {profile.age} · {profile.gender}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary-container rounded-full text-on-secondary-container text-xs font-semibold">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span>Verified CDS</span>
        </div>
      </div>

      {/* Active Clinical Conditions */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/20 flex flex-col gap-space-sm">
        <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">
          Active Clinical Diagnoses &amp; Allergies
        </h3>
        <p className="text-xs text-on-surface-variant -mt-1 mb-1">
          Select all medical guidelines the Risk Engine should cross-reference on every food scan.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { id: "diabetes_type_2", title: "Diabetes (Type 2)", desc: "Requires low glycemic load and strict zero added sugar/polyol monitoring." },
            { id: "hypertension", title: "Hypertension", desc: "Monitors sodium density exceeding 400mg per serving." },
            { id: "peanut_allergy", title: "Peanut Allergy", desc: "Zero tolerance allergen alert on peanut and legume storage proteins." },
            { id: "celiac_gluten", title: "Celiac / Gluten Sensitivity", desc: "Flags wheat, barley, rye, and malt derivatives." },
          ].map((cond) => {
            const isChecked = profile.conditions.some((c) => c.id === cond.id);

            return (
              <div
                key={cond.id}
                onClick={() => toggleCondition(cond.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  isChecked
                    ? "bg-secondary-container/30 border-primary"
                    : "bg-surface-container-low border-outline-variant/20 hover:bg-surface-container"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                    isChecked
                      ? "bg-primary border-primary text-on-primary"
                      : "border-outline bg-surface-container-lowest"
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-surface">{cond.title}</h4>
                  <p className="text-[11px] text-on-surface-variant leading-snug mt-0.5">
                    {cond.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Thresholds */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/20 flex flex-col gap-space-sm">
        <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">
          Target Biomarker Thresholds
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-1">
          <div>
            <label className="text-xs font-semibold text-on-surface">
              Max Glycemic Load (GL) per meal
            </label>
            <input
              type="number"
              value={profile.thresholds.maxGlycemicLoadPerServing}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  thresholds: {
                    ...profile.thresholds,
                    maxGlycemicLoadPerServing: Number(e.target.value),
                  },
                })
              }
              className="w-full mt-1.5 px-3 py-2 text-xs rounded-lg border border-outline-variant/30 bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="text-[10px] text-on-surface-variant">Recommended: 10 or lower</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-on-surface">
              Max Sodium (mg) per snack portion
            </label>
            <input
              type="number"
              value={profile.thresholds.maxSodiumMgPerServing}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  thresholds: {
                    ...profile.thresholds,
                    maxSodiumMgPerServing: Number(e.target.value),
                  },
                })
              }
              className="w-full mt-1.5 px-3 py-2 text-xs rounded-lg border border-outline-variant/30 bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="text-[10px] text-on-surface-variant">Standard guideline: 400mg</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-2">
        <button
          type="submit"
          disabled={saved}
          className="px-6 py-3 rounded-xl bg-primary text-on-primary font-medium text-xs flex items-center gap-2 hover:bg-surface-tint shadow-sm active:scale-95 transition-all"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4 text-primary-fixed" />
              <span>Profile Saved &amp; Synced!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-primary-fixed" />
              <span>Update Health Profile</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
