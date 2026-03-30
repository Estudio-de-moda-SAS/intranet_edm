"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";

type ServiceStatus = "online" | "operational" | "degraded" | "offline" | "down";

type Service = {
  name: string;
  description?: string;
  status: ServiceStatus;
};

type Props = {
  title: string;
  services: Service[];
};

const STATUS_CONFIG: Record<string, { dot: string; pulse: boolean; badge: string; text: string; label: string }> = {
  online:       { dot: "bg-emerald-400", pulse: true,  badge: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", label: "Online"    },
  operational:  { dot: "bg-emerald-400", pulse: true,  badge: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", label: "Operativo" },
  degraded:     { dot: "bg-amber-400",   pulse: true,  badge: "bg-amber-50 border-amber-100",     text: "text-amber-700",   label: "Degradado" },
  offline:      { dot: "bg-rose-500",    pulse: false, badge: "bg-rose-50 border-rose-100",       text: "text-rose-700",    label: "Caído"     },
  down:         { dot: "bg-rose-500",    pulse: false, badge: "bg-rose-50 border-rose-100",       text: "text-rose-700",    label: "Caído"     },
};

const FALLBACK = { dot: "bg-slate-300", pulse: false, badge: "bg-slate-50 border-slate-100", text: "text-slate-500", label: "Desconocido" };

export default function ServiceStatusCard({ title, services }: Props) {
  const operational = services.filter((s) =>
    ["online", "operational"].includes(s.status)
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
            <Activity className="h-3.5 w-3.5 text-emerald-600" />
          </span>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        </div>
        <span className="text-[11px] font-semibold text-emerald-600">
          {operational}/{services.length} activos
        </span>
      </div>

      {/* Services */}
      <ul className="divide-y divide-slate-50">
        {services.map((svc, i) => {
          const cfg = STATUS_CONFIG[svc.status] ?? FALLBACK;
          return (
            <li
              key={i}
              className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50/50"
            >
              {/* Animated dot */}
              <div className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                {cfg.pulse && (
                  <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${cfg.dot} opacity-25`} />
                )}
                <span className={`relative h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-slate-700 truncate">{svc.name}</p>
                {svc.description && (
                  <p className="text-[11px] text-slate-400 truncate">{svc.description}</p>
                )}
              </div>

              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cfg.badge} ${cfg.text}`}>
                {cfg.label}
              </span>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}