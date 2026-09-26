"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { CLINICAL_TRENDS_MOCK } from "@/lib/mock-data";

export function ClinicalAnalyticsChart() {
  return (
    <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-outline-variant/20 flex flex-col gap-space-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-on-surface">
            Weekly Glycemic Load Trajectory
          </h3>
          <p className="text-xs text-on-surface-variant">
            Target threshold: &lt;10 GL per meal (Type 2 Diabetes guideline)
          </p>
        </div>
        <span className="font-clinical-mono text-xs px-2 py-0.5 rounded bg-primary-fixed/40 text-on-primary-fixed-variant font-semibold">
          7-DAY CDS TREND
        </span>
      </div>

      <div className="h-56 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={CLINICAL_TRENDS_MOCK} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="day"
              stroke="#6f7979"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6f7979"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, 20]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg bg-inverse-surface text-inverse-on-surface p-2.5 text-xs shadow-md border border-outline/30">
                      <p className="font-semibold">{data.day}</p>
                      <p className="text-primary-fixed mt-0.5">
                        Glycemic Load: <span className="font-bold">{data.glycemicLoad}</span>
                      </p>
                      <p className="text-secondary-fixed">
                        Sodium: {data.sodiumMg}mg
                      </p>
                      <p className="text-outline-variant text-[10px] mt-1">
                        {data.flaggedCount > 0 ? `⚠️ ${data.flaggedCount} flag(s)` : "✅ All foods compliant"}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine
              y={10}
              stroke="#ba1a1a"
              strokeDasharray="4 4"
              label={{
                value: "Max Safe GL (10)",
                fill: "#ba1a1a",
                fontSize: 10,
                position: "insideTopRight",
              }}
            />
            <Bar
              dataKey="glycemicLoad"
              fill="#005253"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-xs text-on-surface-variant pt-2 border-t border-outline-variant/15">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded bg-[#005253]" />
          <span>Average Load: 8.8 GL</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
          <span>86% Compliance Rate this week</span>
        </div>
      </div>
    </div>
  );
}
