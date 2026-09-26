"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Search } from "lucide-react";

export function QuickScanBay() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().toLowerCase().includes("biscuit") || searchQuery.trim().toLowerCase().includes("nutri")) {
      router.push("/assessment/nutrichoice-digestive");
    } else if (searchQuery.trim().toLowerCase().includes("noodle") || searchQuery.trim().toLowerCase().includes("maggi")) {
      router.push("/assessment/instant-noodles");
    } else {
      router.push(`/scanner?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="rounded-2xl bg-surface-container-lowest shadow-xs p-6 sm:p-7 flex flex-col items-center text-center border border-outline-variant/20 relative overflow-hidden">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3.5 shadow-2xs border border-primary/15">
        <Camera className="w-6 h-6" />
      </div>

      <h2 className="text-xl font-bold text-on-surface tracking-tight">
        Instant Food Safety Scanner
      </h2>
      <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mt-1 mb-5 leading-normal">
        Scan any packaged food barcode or label to instantly verify ingredients against your active clinical baselines.
      </p>

      {/* Main Scanner Action Button */}
      <Link
        href="/scanner"
        className="w-full sm:max-w-md flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-primary text-on-primary font-semibold shadow-sm hover:bg-surface-tint active:scale-[0.99] transition-all text-sm tracking-wide"
      >
        <Camera className="w-4 h-4 text-primary-fixed" />
        <span>Launch Food Label Scanner</span>
      </Link>

      {/* Manual Search Form */}
      <form onSubmit={handleSearchSubmit} className="w-full sm:max-w-md mt-3.5 relative">
        <div className="flex items-center bg-surface-container rounded-xl px-3.5 py-2.5 text-sm text-on-surface-variant focus-within:ring-2 focus-within:ring-primary/40 focus-within:bg-surface-container-lowest transition-all border border-outline-variant/20">
          <Search className="w-4 h-4 text-outline mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search food by name, brand, or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-on-surface placeholder:text-outline focus:outline-none text-sm"
          />
          <button
            type="submit"
            className="text-xs font-semibold px-3 py-1 rounded-lg bg-surface-container-lowest text-on-surface border border-outline-variant/30 hover:bg-surface-container-high transition-colors shadow-2xs shrink-0 cursor-pointer"
          >
            Search
          </button>
        </div>
      </form>

      {/* Quick suggestions */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-xs text-on-surface-variant">
        <span className="text-[11px] text-tertiary">Quick test:</span>
        <button
          type="button"
          onClick={() => router.push("/assessment/nutrichoice-digestive")}
          className="px-2.5 py-0.5 rounded-full bg-surface-container-low hover:bg-surface-container text-[11px] font-medium text-on-surface-variant transition-colors cursor-pointer"
        >
          NutriChoice Digestive
        </button>
        <button
          type="button"
          onClick={() => router.push("/assessment/instant-noodles")}
          className="px-2.5 py-0.5 rounded-full bg-surface-container-low hover:bg-surface-container text-[11px] font-medium text-on-surface-variant transition-colors cursor-pointer"
        >
          Instant Noodles
        </button>
      </div>
    </section>
  );
}
