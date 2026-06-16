"use client";

import { useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Tables } from "@/lib/database.types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RANGES = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
];

export function VitalsCharts({
  templates,
  entries,
}: {
  templates: Tables<"vital_templates">[];
  entries: Tables<"vital_entries">[];
}) {
  const [range, setRange] = useState("30");

  const cutoff = useMemo(() => subDays(new Date(), Number(range)), [range]);

  if (templates.length === 0) {
    return <p className="text-sm text-slate-500">No vitals are configured for this condition.</p>;
  }

  return (
    <div className="space-y-6">
      <Tabs value={range} onValueChange={setRange}>
        <TabsList>
          {RANGES.map((r) => (
            <TabsTrigger key={r.value} value={r.value}>
              {r.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-6 lg:grid-cols-2">
        {templates.map((t) => {
          const data = entries
            .filter((e) => e.template_id === t.id && new Date(e.recorded_at) >= cutoff)
            .map((e) => ({
              t: new Date(e.recorded_at).getTime(),
              label: format(new Date(e.recorded_at), "MMM d"),
              value: Number(e.value),
            }));

          return (
            <div key={t.id} className="rounded-xl border bg-white p-4">
              <div className="mb-2 flex items-baseline justify-between">
                <h4 className="font-medium text-slate-900">{t.name}</h4>
                <span className="text-xs text-slate-500">
                  {t.unit ?? ""}
                  {t.min_value !== null || t.max_value !== null
                    ? ` · range ${t.min_value ?? "–"}–${t.max_value ?? "–"}`
                    : ""}
                </span>
              </div>
              {data.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-400">No readings in this period.</p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" domain={["auto", "auto"]} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                      labelStyle={{ color: "#0f172a" }}
                    />
                    {t.max_value !== null && (
                      <ReferenceLine y={t.max_value} stroke="#ef4444" strokeDasharray="4 4" />
                    )}
                    {t.min_value !== null && (
                      <ReferenceLine y={t.min_value} stroke="#f59e0b" strokeDasharray="4 4" />
                    )}
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#0d9488"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
