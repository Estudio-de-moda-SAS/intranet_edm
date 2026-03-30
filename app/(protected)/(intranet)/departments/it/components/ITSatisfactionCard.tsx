"use client";

import { motion } from "framer-motion";
import { Smile } from "lucide-react";

type SatisfactionItem = {
  department: string;
  value: number;
};

function barColor(value: number) {
  if (value >= 85) return "from-emerald-500 to-emerald-400";
  if (value >= 65) return "from-amber-500 to-amber-400";
  return "from-rose-500 to-rose-400";
}

function textColor(value: number) {
  if (value >= 85) return "text-emerald-600";
  if (value >= 65) return "text-amber-600";
  return "text-rose-600";
}

export default function ITSatisfactionCard({ data }: { data: SatisfactionItem[] }) {
  const avg = Math.round(data.reduce((s, i) => s + i.value, 0) / data.length);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
            <Smile className="h-3.5 w-3.5 text-violet-600" />
          </span>
          <h2 className="text-sm font-semibold text-slate-800">Satisfacción de Usuarios</h2>
        </div>
        <span className={`text-sm font-bold tabular-nums ${textColor(avg)}`}>
          {avg}% promedio
        </span>
      </div>

      {/* Bars */}
      <ul className="divide-y divide-slate-50">
        {data.map((item, i) => (
          <li key={item.department} className="px-5 py-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[13px] font-medium text-slate-700">{item.department}</span>
              <span className={`text-[13px] font-bold tabular-nums ${textColor(item.value)}`}>
                {item.value}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                className={`h-2 rounded-full bg-gradient-to-r ${barColor(item.value)}`}
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }}
              />
            </div>
          </li>
        ))}
      </ul>

    </div>
  );
}