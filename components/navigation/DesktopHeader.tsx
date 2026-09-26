"use client";

import Link from "next/link";
import { Activity } from "lucide-react";

export function DesktopHeader() {
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

        <Link
          href="/doctor"
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary transition-colors border border-outline-variant/20"
        >
          Doctor Console →
        </Link>

        <Link
          href="/profile"
          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary hover:opacity-90 transition-opacity"
        >
          <span className="text-xs font-semibold">AR</span>
        </Link>
      </div>
    </header>
  );
}
