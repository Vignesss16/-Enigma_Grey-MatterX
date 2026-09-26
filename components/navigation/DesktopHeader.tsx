"use client";

import Link from "next/link";
import { Activity, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function DesktopHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [initials, setInitials] = useState("US");

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("full_name").eq("user_id", user.id).single();
        if (data && data.full_name) {
          setInitials(data.full_name.substring(0, 2).toUpperCase());
        }
      }
    }
    if (pathname !== "/login") loadProfile();
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (pathname === "/login" || pathname === "/doctor/login") return null;

  return (
    <header className="hidden lg:flex fixed top-0 left-72 right-0 h-16 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/20 z-40 items-center justify-between px-space-xl">
      <div className="flex items-center gap-space-sm">
        <span className="font-semibold text-lg text-primary">
          Genesis Reset Healthcare
        </span>
        <span className="text-outline-variant">/</span>
        <span className="text-xs text-on-surface-variant font-clinical-mono">
          CLINICAL DECISION SUPPORT
        </span>
      </div>

      <div className="flex items-center gap-space-md">
        <div className="flex items-center gap-space-xs px-3 py-1 bg-secondary-container/50 rounded-full border border-secondary-container">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-clinical-mono text-xs text-on-secondary-container uppercase tracking-wider font-semibold">
            CDS Engine Live
          </span>
        </div>

        <div className="flex items-center gap-2 pl-1 border-l border-outline-variant/30">
          <Link
            href="/profile"
            title="Personal Health Profile"
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary hover:opacity-90 transition-opacity"
          >
            <span className="text-xs font-semibold">{initials}</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            title="Log Out"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/30 text-on-surface-variant hover:text-error hover:border-error/40 hover:bg-error-container/20 text-xs font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
