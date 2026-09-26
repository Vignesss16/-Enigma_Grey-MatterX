"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Home, 
  Scan, 
  UtensilsCrossed, 
  ArrowLeftRight, 
  History, 
  User, 
  ShieldCheck, 
  Activity,
  Stethoscope
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Scan Food", href: "/scanner", icon: Scan },
  { label: "Safer Alternatives", href: "/alternatives", icon: ArrowLeftRight },
  { label: "Dining Out", href: "/dining-out", icon: UtensilsCrossed },
  { label: "Food History", href: "/history", icon: History },
  { label: "Health Profile", href: "/profile", icon: User },
  { label: "Doctor Portal", href: "/doctor", icon: Stethoscope },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("full_name, patient_id").eq("user_id", user.id).single();
        if (data) setProfile(data);
      }
    }
    if (pathname !== "/login") loadProfile();
  }, [pathname]);

  if (pathname === "/login") return null;

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-surface-container-low z-50 flex-col justify-between py-space-lg px-space-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-outline-variant/20">
      <div className="flex flex-col gap-space-lg">
        {/* Brand Emblem */}
        <div className="flex items-center gap-space-sm px-space-sm">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
            <Activity className="w-5 h-5 text-secondary-fixed" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-lg text-primary tracking-tight leading-tight">
              Genesis Reset
            </span>
            <span className="font-clinical-mono text-xs text-tertiary uppercase tracking-wider">
              Clinical Decision Support
            </span>
          </div>
        </div>

        <div className="px-space-sm">
          <div className="h-[1px] w-full bg-outline-variant/30" />
        </div>

        {/* Navigation items */}
        <nav className="flex flex-col gap-space-xs">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary-container text-on-primary-container font-semibold shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-primary-fixed" : "text-outline")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Patient Profile Card */}
      <div className="flex flex-col gap-space-sm">
        <div className="px-space-sm">
          <div className="h-[1px] w-full bg-outline-variant/30" />
        </div>
        <Link
          href="/profile"
          className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
            {profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : "US"}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold text-on-surface truncate">
              {profile?.full_name || "New Patient"}
            </span>
            <span className="font-clinical-mono text-xs text-on-surface-variant truncate">
              ID: {profile?.patient_id || "CDS-NEW"}
            </span>
          </div>
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
        </Link>
      </div>
    </aside>
  );
}
