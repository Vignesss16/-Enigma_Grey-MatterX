"use client";

import { usePathname } from "next/navigation";
import { DesktopSidebar } from "@/components/navigation/DesktopSidebar";
import { DesktopHeader } from "@/components/navigation/DesktopHeader";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { HealthChatbot } from "@/components/chat/HealthChatbot";

export function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDoctorRoute = pathname.startsWith("/doctor");
  const isAuthRoute = pathname === "/login" || pathname === "/doctor/login";

  // Dedicated full-width workspace for Doctor Portal and Auth views
  if (isDoctorRoute || isAuthRoute) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-background">
        <main className="flex-1 w-full bg-background">
          {children}
        </main>
      </div>
    );
  }

  // Regular Customer / Patient shell with side navigation & header
  return (
    <>
      <DesktopSidebar />
      <DesktopHeader />
      <div className="lg:pl-72 flex flex-col min-h-screen">
        <main className="flex-1 w-full pt-16 pb-20 lg:pb-12 bg-background">
          {children}
        </main>
      </div>
      <MobileBottomNav />
      <HealthChatbot />
    </>
  );
}
