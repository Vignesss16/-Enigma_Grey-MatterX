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
    <div className="rounded-2xl bg-surface-container-lowest p-5 sm:p-6 shadow-xs border border-outline-variant/20 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-on-surface tracking-tight">
            Weekly Glycemic Load Trajectory
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Clinical Target: ≤ 10 GL per meal (Type 2 Diabetes Standard)
          </p>
        </div>
        <span className="self-start sm:self-auto font-clinical-mono text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold tracking-wider">
          7-DAY CDS TREND
        </span>
      </div>

      <div className="h-56 w-full mt-1">
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
                    <div className="rounded-xl bg-inverse-surface text-inverse-on-surface p-3 text-xs shadow-lg border border-outline/30 flex flex-col gap-1 min-w-[160px]">
                      <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-0.5">
                        <span className="font-semibold text-sm">{data.day}</span>
                        <span className="font-clinical-mono text-[10px] text-white/60">CDS LOG</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Glycemic Load:</span>
                        <span className="font-clinical-mono font-bold text-primary-fixed">{data.glycemicLoad} GL</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Sodium Content:</span>
                        <span className="font-clinical-mono text-secondary-fixed">{data.sodiumMg} mg</span>
                      </div>
                      <div className="pt-1 text-[11px] font-medium">
                        {data.flaggedCount > 0 ? (
                          <span className="text-amber-300">⚠️ {data.flaggedCount} risk trigger(s)</span>
                        ) : (
                          <span className="text-emerald-300">✅ All parameters safe</span>
                        )}
                      </div>
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-on-surface-variant pt-3 border-t border-outline-variant/15">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
          <span>7-Day Average: <strong className="font-semibold text-on-surface">8.8 GL</strong> (Controlled)</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
          <span>86% Meals Within Safe Limits</span>
        </div>
      </div>
    </div>
  );
}
