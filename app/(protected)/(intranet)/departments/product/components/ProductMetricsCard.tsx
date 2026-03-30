// app/product/components/ProductMetricsCard.tsx
// CLIENT COMPONENT — Métricas de adopción y engagement
"use client";

import { BarChart2 } from "lucide-react";

type Metric = {
  label:    string;
  value:    string;
  subtext:  string;
  fill:     number; // % for spark bar
  color:    string;
};

const METRICS: Metric[] = [
  { label: "Retención D30",      value: "58%",    subtext: "+3 pp MoM",       fill: 58, color: "bg-sky-400"     },
  { label: "Time to value",      value: "4.2 min", subtext: "−0.8 min MoM",   fill: 72, color: "bg-indigo-400"  },
  { label: "Feature adoption",   value: "41%",    subtext: "top 5 features",  fill: 41, color: "bg-violet-400"  },
  { label: "Churn mensual",      value: "1.8%",   subtext: "objetivo < 2%",   fill: 82, color: "bg-emerald-400" },
];

export default function ProductMetricsCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
          <BarChart2 className="h-3.5 w-3.5 text-indigo-600" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Métricas de producto</h2>
          <p className="text-[11px] text-slate-400">Adopción y engagement · últimos 30 días</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {METRICS.map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-3"
          >
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide truncate">
              {m.label}
            </p>
            <p className="mt-1 text-xl font-bold text-slate-800 leading-none">{m.value}</p>
            <p className="mt-0.5 text-[10px] text-slate-400">{m.subtext}</p>
            <div className="mt-2 h-1 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full rounded-full ${m.color}`}
                style={{ width: `${m.fill}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
