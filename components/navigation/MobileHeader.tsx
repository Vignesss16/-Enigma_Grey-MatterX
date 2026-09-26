"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Activity, User } from "lucide-react";

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
}

export function MobileHeader({ title = "Genesis Reset", showBack = false }: MobileHeaderProps) {
  const router = useRouter();

  return (
    <header className="lg:hidden fixed top-0 w-full z-50 pt-safe bg-surface/90 backdrop-blur-xl border-b border-outline-variant/20 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 px-gutter flex items-center justify-between">
        <div className="flex items-center gap-space-xs">
          {showBack ? (
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center text-primary rounded-full hover:bg-surface-container active:scale-95 transition-all"
              aria-label="Go back"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
              <Activity className="w-4 h-4 text-secondary-fixed" />
            </div>
          )}

          <div className="flex flex-col ml-1">
            <span className="font-semibold text-base text-primary tracking-tight leading-snug">
              {title}
            </span>
            {!showBack && (
              <span className="font-clinical-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                Clinical Health
              </span>
            )}
          </div>
        </div>

        <Link
          href="/profile"
          className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-medium"
        >
          <User className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
