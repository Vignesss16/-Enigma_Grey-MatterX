"use client";

import { useState } from "react";
import { Search, Mic, Sparkles } from "lucide-react";
import { MobileHeader } from "@/components/navigation/MobileHeader";
import { VenueSelector } from "@/components/dining-out/VenueSelector";
import { DishAnalysisCard } from "@/components/dining-out/DishAnalysisCard";
import { CustomizationTips } from "@/components/dining-out/CustomizationTips";
import { DINING_OUT_SAMPLE_DISHES } from "@/lib/mock-data";

export default function DiningOutPage() {
  const [selectedVenue, setSelectedVenue] = useState("Restaurant");
  const [searchQuery, setSearchQuery] = useState("Paneer Tikka (Tandoori Dry)");
  const [activeDish, setActiveDish] = useState(DINING_OUT_SAMPLE_DISHES[0]);

  const handleSearch = (dishName: string) => {
    setSearchQuery(dishName);
    if (dishName.toLowerCase().includes("dal")) {
      setActiveDish(DINING_OUT_SAMPLE_DISHES[1]);
    } else {
      setActiveDish(DINING_OUT_SAMPLE_DISHES[0]);
    }
  };

  return (
    <>
      <MobileHeader title="Dining Out" />

      <div className="px-gutter lg:px-space-xl py-space-sm max-w-2xl mx-auto flex flex-col gap-space-lg">
        {/* Header Intro */}
        <div className="flex flex-col gap-1 pt-1">
          <div className="inline-flex items-center gap-1.5 text-primary">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-clinical-mono text-[10px] uppercase tracking-wider text-primary font-bold">
              Real-World Analysis
            </span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Eating out?
          </h1>
          <p className="text-xs text-on-surface-variant">
            Evaluate restaurant, tiffin, or event meals where packaged labels are missing.
          </p>
        </div>

        {/* Search Input Area */}
        <div className="relative w-full">
          <div className="relative flex items-center bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 overflow-hidden">
            <Search className="absolute left-3.5 w-4 h-4 text-outline" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What are you eating? e.g., Paneer Tikka, Dal Makhani"
              className="w-full pl-10 pr-10 py-3 bg-transparent text-xs text-on-surface placeholder:text-outline focus:outline-none"
            />
            <button
              aria-label="Voice input"
              className="absolute right-3 p-1 text-outline hover:text-on-surface transition-colors"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-on-surface-variant font-medium">Quick examples:</span>
            <button
              onClick={() => handleSearch("Paneer Tikka (Tandoori Dry)")}
              className="text-[10px] text-primary font-semibold hover:underline"
            >
              Paneer Tikka
            </button>
            <span className="text-outline-variant">•</span>
            <button
              onClick={() => handleSearch("Yellow Dal Tadka")}
              className="text-[10px] text-primary font-semibold hover:underline"
            >
              Dal Tadka
            </button>
          </div>
        </div>

        {/* Venue Selector */}
        <VenueSelector
          selectedVenue={selectedVenue}
          onSelect={setSelectedVenue}
        />

        {/* Active Dish Clinical Reference Card */}
        <DishAnalysisCard dish={activeDish} />

        {/* Chef Customization Guidance */}
        <CustomizationTips tips={activeDish.customizationTips} />
      </div>
    </>
  );
}
