"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Scan, UtensilsCrossed, ArrowLeftRight, History } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/doctor/login" || pathname.startsWith("/doctor")) return null;

  const tabs = [
    { label: "Home", href: "/", icon: Home },
    { label: "Alternatives", href: "/alternatives", icon: ArrowLeftRight },
    { label: "Scan", href: "/scanner", icon: Scan, isCenterAction: true },
    { label: "Dining", href: "/dining-out", icon: UtensilsCrossed },
    { label: "History", href: "/history", icon: History },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-xl border-t border-outline-variant/20 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
      <div className="h-16 px-4 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);

          if (tab.isCenterAction) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative -top-4 w-14 h-14 rounded-full bg-primary text-on-primary flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all border-4 border-surface"
              >
                <Icon className="w-6 h-6 text-primary-fixed" />
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center w-12 h-12 transition-colors",
                isActive ? "text-primary font-semibold" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
