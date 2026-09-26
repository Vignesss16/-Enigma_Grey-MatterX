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
    <section className="rounded-xl bg-surface-container-lowest shadow-sm p-space-lg flex flex-col items-center text-center border border-outline-variant/20 relative overflow-hidden">
      <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center text-primary mb-3 shadow-inner">
        <Camera className="w-7 h-7" />
      </div>

      <h2 className="text-xl font-semibold text-on-surface">
        Scan a packaged food
      </h2>
      <p className="text-sm text-on-surface-variant max-w-sm mt-1 mb-5">
        Check ingredients, nutrition facts, and hidden dietary risks calibrated to your profile.
      </p>

      {/* Main Scanner Action Button */}
      <Link
        href="/scanner"
        className="w-full sm:max-w-md flex items-center justify-center gap-2 py-3 px-space-md rounded-lg bg-primary text-on-primary font-medium shadow-sm hover:bg-surface-tint active:scale-[0.99] transition-all text-sm"
      >
        <Camera className="w-4 h-4 text-primary-fixed" />
        <span>Open Clinical Scanner</span>
      </Link>

      {/* Manual Search Form */}
      <form onSubmit={handleSearchSubmit} className="w-full sm:max-w-md mt-3 relative">
        <div className="flex items-center bg-surface-container rounded-lg px-3 py-2 text-sm text-on-surface-variant focus-within:ring-2 focus-within:ring-primary/40 focus-within:bg-surface-container-lowest transition-all">
          <Search className="w-4 h-4 text-outline mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search food or barcode manually..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-on-surface placeholder:text-outline focus:outline-none text-sm"
          />
          <button
            type="submit"
            className="text-[10px] font-clinical-mono px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface-variant uppercase font-semibold border border-outline-variant/20 hover:bg-surface-container-high"
          >
            Enter
          </button>
        </div>
      </form>
    </section>
  );
}
