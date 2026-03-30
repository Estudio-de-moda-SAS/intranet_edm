"use client";

import { motion } from "framer-motion";
import { Gauge } from "lucide-react";

type StatusItem = {
  label: string;
  value: string;
  status: "ok" | "warning" | "error";
};

type DashboardStatusCardProps = {
  title: string;
  status?: StatusItem[];
};

const DOT: Record<string, string> = {
  ok:      "bg-emerald-400",
  warning: "bg-amber-400",
  error:   "bg-rose-400",
};

export default function DashboardStatusCard({
  title,
  status = [],
}: DashboardStatusCardProps) {
  const healthItem = status.find((s) => s.label.toLowerCase() === "salud");
  const healthValue = healthItem ? parseInt(healthItem.value.replace("%", "")) : 0;

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (healthValue / 100) * circumference;

  const gaugeStroke =
    healthValue > 80 ? "#10b981" :
    healthValue > 40 ? "#f59e0b" : "#ef4444";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
          <Gauge className="h-3.5 w-3.5 text-violet-600" />
        </span>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>

      <div className="flex items-center gap-5 px-5 py-4">
        {/* Circular gauge */}
        {healthItem && (
          <div className="relative h-[75px] w-[75px] shrink-0">
            <svg className="-rotate-90" width="75" height="75">
              <circle cx="37.5" cy="37.5" r={radius} strokeWidth="7" stroke="#f1f5f9" fill="transparent" />
              <circle
                cx="37.5" cy="37.5" r={radius}
                strokeWidth="7" fill="transparent"
                stroke={gaugeStroke}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-slate-800">{healthValue}%</span>
            </div>
          </div>
        )}

        {/* Status list */}
        <div className="flex-1 space-y-2">
          {status.length === 0 ? (
            <p className="text-[13px] text-slate-400">No hay estados disponibles</p>
          ) : (
            status.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${DOT[item.status] ?? "bg-slate-300"}`} />
                  <span className="text-[13px] text-slate-600">{item.label}</span>
                </div>
                <span className="text-[13px] font-medium text-slate-800">{item.value}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}