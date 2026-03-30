"use client";

import { motion } from "framer-motion";
import { Server } from "lucide-react";

type ServerStatus = "ok" | "warning" | "error";

type ServerItem = {
  name: string;
  usage: number;
  status: ServerStatus;
};

type Props = {
  title: string;
  servers: ServerItem[];
};

const BAR_COLOR: Record<ServerStatus, string> = {
  ok:      "from-violet-500 to-violet-400",
  warning: "from-amber-500 to-amber-400",
  error:   "from-rose-500 to-rose-400",
};

const BADGE: Record<ServerStatus, { bg: string; text: string; label: string }> = {
  ok:      { bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", label: "Normal"   },
  warning: { bg: "bg-amber-50 border-amber-100",     text: "text-amber-700",   label: "Atención" },
  error:   { bg: "bg-rose-50 border-rose-100",       text: "text-rose-700",    label: "Crítico"  },
};

export default function ServerStatusPanel({ title, servers }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
          <Server className="h-3.5 w-3.5 text-indigo-600" />
        </span>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>

      {/* Server rows */}
      <ul className="divide-y divide-slate-50">
        {servers.map((server, i) => {
          const badge = BADGE[server.status];
          return (
            <li key={i} className="group px-5 py-4 transition-colors hover:bg-slate-50/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-medium text-slate-700 group-hover:text-violet-700 transition-colors">
                  {server.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                  <span className="text-[12px] font-bold tabular-nums text-slate-600">
                    {server.usage}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${BAR_COLOR[server.status]} transition-all duration-300 group-hover:brightness-110`}
                  initial={{ width: 0 }}
                  animate={{ width: `${server.usage}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}