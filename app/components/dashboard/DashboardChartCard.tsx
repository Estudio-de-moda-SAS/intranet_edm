"use client";

import { motion } from "framer-motion";
import {
  LineChart, Line, ResponsiveContainer, Tooltip,
  CartesianGrid, XAxis, YAxis,
} from "recharts";
import { BarChart2 } from "lucide-react";
import { calculateInsight } from "./DashboardUtilis";

interface DashboardChartCardProps {
  title: string;
  data: Record<string, unknown>[];
  dataKey?: string;
  xKey?: string;
}

export default function DashboardChartCard({
  title,
  data,
  dataKey = "value",
  xKey = "name",
}: DashboardChartCardProps) {
  const insight = calculateInsight(data, dataKey);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md overflow-hidden"
    >
      {/* Subtle glow decoration */}
      <div className="pointer-events-none absolute -top-10 -left-10 h-32 w-32 rounded-full bg-violet-100 opacity-40 blur-3xl" />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
            <BarChart2 className="h-3.5 w-3.5 text-violet-600" />
          </span>
          <p className="text-sm font-semibold text-slate-700">{title}</p>
        </div>
        <span className="rounded-md bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-600 uppercase tracking-wide">
          Análisis
        </span>
      </div>

      {/* Chart */}
      <div className="relative h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#1e293b",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              }}
              cursor={{ stroke: "#8b5cf6", strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="#8b5cf6"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insight */}
      <div className="relative mt-4 border-t border-slate-100 pt-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Insight
        </p>
        <p className="mt-1 text-[12px] text-slate-600 leading-relaxed">{insight}</p>
      </div>
    </motion.div>
  );
}