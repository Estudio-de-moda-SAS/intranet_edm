"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface DashboardKPICardProps {
  title: string;
  value: string | number;
  trend?: string;
  icon?: LucideIcon;
  accent?: string;
}

function TrendChip({ trend }: { trend: string }) {
  const isUp   = trend.includes("+") || trend.toLowerCase().includes("rentable") || trend.toLowerCase().includes("estable");
  const isDown = trend.includes("-");

  if (isDown) return (
    <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-600">
      <TrendingDown className="h-3 w-3" /> {trend}
    </span>
  );
  if (isUp) return (
    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
      <TrendingUp className="h-3 w-3" /> {trend}
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
      <Minus className="h-3 w-3" /> {trend}
    </span>
  );
}

export default function DashboardKPICard({
  title,
  value,
  trend,
  icon: Icon,
  accent = "bg-violet-50 border-violet-100",
}: DashboardKPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-violet-200 hover:-translate-y-0.5"
    >
      {/* Top accent bar */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-violet-500 to-purple-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <div className="flex items-start justify-between">
        <p className="text-[12px] font-medium text-slate-500 leading-tight">{title}</p>
        {Icon && (
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${accent}`}>
            <Icon className="h-3.5 w-3.5 text-violet-600" />
          </span>
        )}
      </div>

      <p className="mt-3 text-2xl font-bold text-slate-900 tabular-nums">{value}</p>

      {trend && (
        <div className="mt-2">
          <TrendChip trend={trend} />
        </div>
      )}
    </motion.div>
  );
}