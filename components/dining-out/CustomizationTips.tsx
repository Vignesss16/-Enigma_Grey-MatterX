"use client";

import { MessageSquare } from "lucide-react";

interface CustomizationTipsProps {
  tips: string[];
}

export function CustomizationTips({ tips }: CustomizationTipsProps) {
  return (
    <div className="rounded-xl bg-surface-container-low p-space-md border border-outline-variant/20 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-primary">
        <MessageSquare className="w-4 h-4 text-primary" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
          What to Ask the Chef / Waiter
        </h3>
      </div>
      <ul className="space-y-1.5 mt-1">
        {tips.map((tip, idx) => (
          <li key={idx} className="flex items-start gap-2 text-xs text-on-surface">
            <span className="text-primary font-bold">•</span>
            <span className="leading-relaxed">{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
