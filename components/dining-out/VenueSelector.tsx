"use client";

import { Utensils, Box, Sparkles, Flame, Home } from "lucide-react";

interface VenueSelectorProps {
  selectedVenue: string;
  onSelect: (venue: string) => void;
}

export function VenueSelector({ selectedVenue, onSelect }: VenueSelectorProps) {
  const venues = [
    { label: "Restaurant", icon: Utensils },
    { label: "Tiffin Service", icon: Box },
    { label: "Wedding / Buffet", icon: Sparkles },
    { label: "Street Food", icon: Flame },
    { label: "Home-cooked", icon: Home },
  ];

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
        Preparation / Venue Context
      </span>
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {venues.map((venue) => {
          const Icon = venue.icon;
          const isSelected = selectedVenue === venue.label;

          return (
            <button
              key={venue.label}
              onClick={() => onSelect(venue.label)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
                isSelected
                  ? "bg-primary text-on-primary shadow-xs"
                  : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{venue.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
