// app/it/components/ServiceStatusCard.tsx
// ✅ SERVER COMPONENT
// Col-8 — mismo ancho que el panel de operaciones, debajo de él

import {
  CheckCircle2, AlertTriangle, XCircle, RefreshCcw,
  Globe, Database, Lock, Wifi, ShoppingCart, LayoutDashboard,
  ArrowUpRight,
} from "lucide-react";
import type { ITData } from "@/lib/graph/departments/it.service";

// ── Types & config ────────────────────────────────────────────────────────────

type ServiceItem = ITData["services"][number];
type Status      = ServiceItem["status"];

const STATUS_CONFIG: Record<Status, {
  label:     string;
  color:     string;
  bg:        string;
  border:    string;
  dot:       string;
  rowBorder: string;
  icon:      React.ReactNode;
}> = {
  operational: {
    label:     "Operativo",
    color:     "text-emerald-600",
    bg:        "bg-emerald-50",
    border:    "border-emerald-100",
    dot:       "bg-emerald-400",
    rowBorder: "border-l-emerald-400",
    icon:      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
  },
  degraded: {
    label:     "Degradado",
    color:     "text-amber-600",
    bg:        "bg-amber-50",
    border:    "border-amber-200",
    dot:       "bg-amber-400 animate-pulse",
    rowBorder: "border-l-amber-400",
    icon:      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
  },
  outage: {
    label:     "Sin servicio",
    color:     "text-red-600",
    bg:        "bg-red-50",
    border:    "border-red-200",
    dot:       "bg-red-500 animate-pulse",
    rowBorder: "border-l-red-500",
    icon:      <XCircle className="w-3.5 h-3.5 text-red-500" />,
  },
  maintenance: {
    label:     "Mantenimiento",
    color:     "text-slate-400",
    bg:        "bg-slate-100",
    border:    "border-slate-200",
    dot:       "bg-slate-400",
    rowBorder: "border-l-slate-300",
    icon:      <RefreshCcw className="w-3.5 h-3.5 text-slate-400" />,
  },
};

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  "Microsoft 365":   <Globe            className="w-3.5 h-3.5" />,
  "Azure AD":        <Lock             className="w-3.5 h-3.5" />,
  "SharePoint":      <LayoutDashboard  className="w-3.5 h-3.5" />,
  "VPN Corporativa": <Wifi             className="w-3.5 h-3.5" />,
  "ERP":             <Database         className="w-3.5 h-3.5" />,
  "POS Tiendas":     <ShoppingCart     className="w-3.5 h-3.5" />,
};

const LAST_CHECK: Record<string, string> = {
  "Microsoft 365":   "1 min",
  "Azure AD":        "1 min",
  "SharePoint":      "2 min",
  "VPN Corporativa": "3 min",
  "ERP":             "2 min",
  "POS Tiendas":     "5 min",
};

const SINCE: Record<string, string> = {
  "Microsoft 365":   "32 d",
  "Azure AD":        "32 d",
  "SharePoint":      "18 d",
  "VPN Corporativa": "—",
  "ERP":             "11 d",
  "POS Tiendas":     "—",
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  services?: ServiceItem[];
}

const FALLBACK: ServiceItem[] = [
  { id: "s1", name: "Microsoft 365",   status: "operational", uptime: "99.9%" },
  { id: "s2", name: "Azure AD",        status: "operational", uptime: "100%"  },
  { id: "s3", name: "SharePoint",      status: "operational", uptime: "99.8%" },
  { id: "s4", name: "VPN Corporativa", status: "degraded",    uptime: "97.2%" },
  { id: "s5", name: "ERP",             status: "operational", uptime: "99.5%" },
  { id: "s6", name: "POS Tiendas",     status: "maintenance", uptime: "98.1%" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function ServiceStatusCard({ services = FALLBACK }: Props) {
  const counts = {
    operational: services.filter(s => s.status === "operational").length,
    degraded:    services.filter(s => s.status === "degraded").length,
    outage:      services.filter(s => s.status === "outage").length,
    maintenance: services.filter(s => s.status === "maintenance").length,
  };

  const allOk    = counts.outage === 0 && counts.degraded === 0;
  const hasAlert = counts.outage > 0 || counts.degraded > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Estado de servicios</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {services.length} servicios corporativos monitoreados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
            allOk
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${allOk ? "bg-emerald-500" : "bg-amber-400 animate-pulse"}`} />
            {allOk ? "Todos operativos" : `${counts.degraded + counts.outage} con incidencia`}
          </span>

          {/* ✅ Fix 1: extraer cfg y count antes de usarlos, guard explícito con return null */}
{(["operational", "degraded", "outage", "maintenance"] as const).map((s) => {
  const cfg   = STATUS_CONFIG[s];
  if (!cfg) return null;   // 👈 guard aquí también
  const count = counts[s];
  if (!count) return null;
  return (
    <span key={s} className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-semibold ${cfg.bg} ${cfg.border} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {count} {cfg.label}
    </span>
  );
})}
        </div>
      </div>

      {/* ── Alert banner ────────────────────────────────────────── */}
      {hasAlert && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <p className="text-[11px] font-medium text-amber-800">
            {counts.degraded + counts.outage} servicio{counts.degraded + counts.outage !== 1 ? "s" : ""} con problemas activos — el equipo TI está investigando
          </p>
        </div>
      )}

      {/* ── Services grid — 2 cols × 3 filas para 6 servicios ──── */}
      <div className="grid grid-cols-2 gap-2">
{services.map((svc) => {
  const cfg = STATUS_CONFIG[svc.status];
  if (!cfg) return null;                    // 👈 guard de flujo, no ??
  const svcIcon = SERVICE_ICONS[svc.name] ?? <Globe className="w-3.5 h-3.5" />;
  const lastChk = LAST_CHECK[svc.name]    ?? "2 min";
  const since   = SINCE[svc.name]          ?? "—";
          return (
            <div
              key={svc.id}
              className={`flex items-center gap-3 rounded-xl border border-l-[3px] ${cfg.rowBorder} border-slate-100 bg-slate-50 px-3 py-2.5 hover:shadow-sm transition-shadow`}
            >
              {/* Icon */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                {svcIcon}
              </div>

              {/* Name + status */}
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-slate-800 truncate leading-tight">{svc.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  <span className={`text-[10px] font-semibold ${cfg.color}`}>{cfg.label}</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="flex flex-col items-end gap-0.5 flex-shrink-0 text-right">
                <p className={`text-[13px] font-extrabold leading-none ${cfg.color}`}>{svc.uptime}</p>
                <p className="text-[9px] text-slate-400">uptime</p>
                <p className="text-[9px] text-slate-400 mt-0.5">activo {since} · hace {lastChk}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <p className="text-[11px] text-slate-400">Azure Service Health · ~2 min</p>
        <a href="/it/servicios" className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
          Historial completo <ArrowUpRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}