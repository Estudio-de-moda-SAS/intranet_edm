"use client";

import { Server, Cpu, Database, Activity, HardDrive } from "lucide-react";
import ITGaugeCard from "./ITGaugeCard";

const SERVER_METRICS = [
  { title: "CPU",       value: 68, icon: Cpu,       color: "#8b5cf6" },
  { title: "Memoria",   value: 74, icon: Database,  color: "#f59e0b" },
  { title: "Req / min", value: 55, icon: Activity,  color: "#3b82f6" },
  { title: "Disco",     value: 42, icon: HardDrive, color: "#10b981" },
];

type ActivityEvent = {
  message: string;
  time: string;
  type?: "ok" | "warning" | "error";
};

type Props = {
  data?: { activity?: ActivityEvent[] };
};

const EVENT_DOT: Record<string, string> = {
  ok:      "bg-emerald-400",
  warning: "bg-amber-400",
  error:   "bg-rose-400",
};

export default function ITServerActivityCard({ data }: Props) {
  const events = data?.activity ?? [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
          <Server className="h-3.5 w-3.5 text-indigo-600" />
        </span>
        <h2 className="text-sm font-semibold text-slate-800">Actividad de Servidores</h2>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3 p-4 border-b border-slate-100 sm:grid-cols-4">
        {SERVER_METRICS.map((m) => (
          <ITGaugeCard
            key={m.title}
            title={m.title}
            value={m.value}
            icon={m.icon}
            color={m.color}
          />
        ))}
      </div>

      {/* Activity log */}
      {events.length > 0 && (
        <ul className="divide-y divide-slate-50">
          {events.map((ev, i) => (
            <li key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors">
              <span className={`h-2 w-2 shrink-0 rounded-full ${EVENT_DOT[ev.type ?? "ok"]}`} />
              <span className="flex-1 text-[13px] text-slate-700">{ev.message}</span>
              <span className="text-[11px] text-slate-400 shrink-0">{ev.time}</span>
            </li>
          ))}
        </ul>
      )}

    </div>
  );
}