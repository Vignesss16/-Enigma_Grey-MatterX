"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ShieldCheck, Activity, UserPlus, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/");
      router.refresh();
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!fullName || !age || !gender) {
      setError("Please fill in all profile details.");
      setLoading(false);
      return;
    }

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      if (data.user) {
         await supabase.from("profiles").insert({
           user_id: data.user.id,
           full_name: fullName,
           age: parseInt(age),
           gender: gender,
           conditions: [],
           thresholds: {
             maxGlycemicLoadPerServing: 10,
             maxSodiumMgPerServing: 400,
             dailySodiumMgCeiling: 1500,
             maxAddedSugarGrams: 0
           }
         });
      }
      alert("Registration successful! You can now log in.");
      setIsSignUp(false);
      setPassword("");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface p-gutter">
      <div className="w-full max-w-md bg-surface-container-lowest p-space-xl rounded-3xl shadow-sm border border-outline-variant/30 flex flex-col items-center">
        
        <div className="flex flex-col items-center gap-space-sm mb-space-xl text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-fixed/30 text-primary mb-2 shadow-inner border border-primary/10">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Genesis Reset</h1>
          <p className="font-clinical-mono text-xs text-primary font-bold tracking-widest uppercase bg-primary-fixed/30 px-2 py-0.5 rounded mt-1">
            {isSignUp ? "Patient Registration" : "Clinical Decision Support"}
          </p>
          <p className="text-on-surface-variant text-sm mt-3">
            {isSignUp ? "Create your health baseline to begin." : "Secure access to patient profiles and scanning bay."}
          </p>
        </div>

        <form className="w-full space-y-space-md" onSubmit={isSignUp ? handleSignUp : handleLogin}>
          
          {isSignUp && (
            <>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-on-surface">Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface transition-all placeholder:text-outline" placeholder="e.g. John Doe" required />
              </div>
              <div className="flex gap-4">
                <div className="space-y-1.5 flex-1">
                  <label className="block text-sm font-medium text-on-surface">Age</label>
                  <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface transition-all placeholder:text-outline" placeholder="Years" required />
                </div>
                <div className="space-y-1.5 flex-1">
                  <label className="block text-sm font-medium text-on-surface">Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface transition-all" required>
                    <option value="">Select</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-on-surface">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface transition-all placeholder:text-outline" placeholder="patient@genesisreset.com" required />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-on-surface">Secure Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface transition-all placeholder:text-outline" placeholder="••••••••" required />
          </div>
          
          {error && (
            <div className="p-3 bg-error-container/40 border border-error/20 rounded-xl text-error text-sm text-center font-medium">
              {error}
            </div>
          )}
          
          <div className="flex flex-col gap-space-sm pt-space-sm">
            {isSignUp ? (
              <>
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-on-primary font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm">
                  <UserPlus className="w-4 h-4" />
                  {loading ? "Registering..." : "Complete Registration"}
                </button>
                <button type="button" onClick={() => setIsSignUp(false)} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-transparent hover:bg-surface-container text-on-surface-variant font-semibold py-3 px-4 rounded-xl transition-all">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </button>
              </>
            ) : (
              <>
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-on-primary font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm">
                  <Activity className="w-4 h-4" />
                  {loading ? "Authenticating..." : "Secure Login"}
                </button>
                <button type="button" onClick={() => setIsSignUp(true)} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-surface-container-high hover:bg-surface-variant text-on-surface font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed border border-outline-variant/20">
                  Create New Profile
                </button>
              </>
            )}
          </div>
        </form>
        
        <div className="mt-space-xl flex items-center gap-2 text-[10px] text-tertiary font-clinical-mono tracking-widest uppercase opacity-70 bg-surface-container py-1 px-3 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          End-to-End Encrypted
        </div>
      </div>
    </div>
  );
}
