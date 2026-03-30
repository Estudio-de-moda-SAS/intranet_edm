"use client";

import { Activity, Clock } from "lucide-react";

type ActivityItem = {
  label: string;
  time: string;
  type?: "ok" | "warning" | "error" | "info";
};

type DashboardActivityCardProps = {
  title: string;
  activities?: ActivityItem[];
  icon?: React.ElementType;
};

const TYPE_DOT: Record<string, string> = {
  ok:      "bg-emerald-400",
  warning: "bg-amber-400",
  error:   "bg-rose-400",
  info:    "bg-sky-400",
};

export default function DashboardActivityCard({
  title,
  activities = [],
  icon: Icon = Activity,
}: DashboardActivityCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
          <Icon className="h-3.5 w-3.5 text-violet-600" />
        </span>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>

      {/* List */}
      <ul className="divide-y divide-slate-50">
        {activities.length === 0 ? (
          <li className="flex items-center gap-2 px-5 py-4 text-[13px] text-slate-400">
            <Clock className="h-4 w-4" /> No hay actividad reciente
          </li>
        ) : (
          activities.map((item, i) => (
            <li
              key={i}
              className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50/50"
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${TYPE_DOT[item.type ?? "info"] ?? "bg-slate-300"}`} />
              <span className="flex-1 text-[13px] text-slate-700 leading-snug">{item.label}</span>
              <span className="shrink-0 text-[11px] text-slate-400">{item.time}</span>
            </li>
          ))
        )}
      </ul>

    </div>
  );
}