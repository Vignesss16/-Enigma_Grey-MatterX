"use client";

import { useState, useEffect } from "react";
import { Check, Shield, Save, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export function ProfileForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>({
    full_name: "",
    patient_id: "CDS-0000",
    age: "",
    gender: "",
    conditions: [],
    thresholds: {
      maxGlycemicLoadPerServing: 10,
      maxSodiumMgPerServing: 400,
      dailySodiumMgCeiling: 1500,
      maxAddedSugarGrams: 0
    }
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (data) {
        setProfile({
          ...data,
          conditions: data.conditions || [],
          thresholds: data.thresholds || profile.thresholds
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  const toggleCondition = (conditionId: string) => {
    setProfile((prev: any) => {
      const exists = prev.conditions.some((c: any) => c.id === conditionId);
      if (exists) {
        return {
          ...prev,
          conditions: prev.conditions.filter((c: any) => c.id !== conditionId),
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
              id: conditionId,
              label: labels[conditionId] || conditionId,
              status: "active",
              criticality: "high",
            },
          ],
        };
      }
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({
        full_name: profile.full_name,
        age: profile.age ? parseInt(profile.age) : null,
        gender: profile.gender,
        conditions: profile.conditions,
        thresholds: profile.thresholds,
        updated_at: new Date().toISOString()
      }).eq("user_id", user.id);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return <div className="p-8 text-center text-on-surface-variant font-clinical-mono animate-pulse">Loading secure profile...</div>;
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-space-lg w-full max-w-2xl mx-auto pb-safe">
      {/* Patient Identification Card */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/20 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-md">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg">
              {profile.full_name ? profile.full_name.substring(0, 2).toUpperCase() : "US"}
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">{profile.full_name || "New Patient"}</h2>
              <p className="text-xs text-on-surface-variant font-clinical-mono">
                ID: {profile.patient_id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary-container rounded-full text-on-secondary-container text-xs font-semibold">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span>Verified CDS</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-outline-variant/10">
          <div>
            <label className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Full Name</label>
            <input type="text" required value={profile.full_name || ""} onChange={(e) => setProfile({...profile, full_name: e.target.value})} className="w-full px-3 py-2 text-sm bg-surface-container-low border border-outline-variant/30 rounded-lg mt-1 focus:ring-1 focus:ring-primary outline-none" placeholder="Your Name" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Age</label>
            <input type="number" value={profile.age || ""} onChange={(e) => setProfile({...profile, age: e.target.value})} className="w-full px-3 py-2 text-sm bg-surface-container-low border border-outline-variant/30 rounded-lg mt-1 focus:ring-1 focus:ring-primary outline-none" placeholder="Years" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Gender</label>
            <select value={profile.gender || ""} onChange={(e) => setProfile({...profile, gender: e.target.value})} className="w-full px-3 py-2 text-sm bg-surface-container-low border border-outline-variant/30 rounded-lg mt-1 focus:ring-1 focus:ring-primary outline-none">
              <option value="">Select...</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
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
            const isChecked = profile.conditions.some((c: any) => c.id === cond.id);
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
                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border ${isChecked ? "bg-primary border-primary text-on-primary" : "border-outline bg-surface-container-lowest"}`}>
                  {isChecked && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-surface">{cond.title}</h4>
                  <p className="text-[11px] text-on-surface-variant leading-snug mt-0.5">{cond.desc}</p>
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
            <label className="text-xs font-semibold text-on-surface">Max Glycemic Load (GL) per meal</label>
            <input
              type="number"
              value={profile.thresholds?.maxGlycemicLoadPerServing || 10}
              onChange={(e) => setProfile({...profile, thresholds: {...profile.thresholds, maxGlycemicLoadPerServing: Number(e.target.value)}})}
              className="w-full mt-1.5 px-3 py-2 text-xs rounded-lg border border-outline-variant/30 bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-on-surface">Max Sodium (mg) per snack portion</label>
            <input
              type="number"
              value={profile.thresholds?.maxSodiumMgPerServing || 400}
              onChange={(e) => setProfile({...profile, thresholds: {...profile.thresholds, maxSodiumMgPerServing: Number(e.target.value)}})}
              className="w-full mt-1.5 px-3 py-2 text-xs rounded-lg border border-outline-variant/30 bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="px-4 py-3 rounded-xl border border-error/30 text-error font-medium text-xs flex items-center gap-2 hover:bg-error-container/20 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>

        <button
          type="submit"
          disabled={saved}
          className="px-6 py-3 rounded-xl bg-primary text-on-primary font-medium text-xs flex items-center gap-2 hover:bg-surface-tint shadow-sm active:scale-95 transition-all"
        >
          {saved ? (
            <><Check className="w-4 h-4 text-primary-fixed" /><span>Saved!</span></>
          ) : (
            <><Save className="w-4 h-4 text-primary-fixed" /><span>Update Profile</span></>
          )}
        </button>
      </div>
    </form>
  );
}
