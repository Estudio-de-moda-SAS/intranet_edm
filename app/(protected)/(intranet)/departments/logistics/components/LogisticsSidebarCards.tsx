"use client";

import { AlertTriangle, CheckCircle2, Clock, MapPin, Truck } from "lucide-react";

// ── Alerts Card ───────────────────────────────────────────────────

type Alert = {
  id:       number;
  type:     "critical" | "warning" | "info";
  title:    string;
  detail:   string;
  time:     string;
};

const ALERTS: Alert[] = [
  { id: 1, type: "critical", title: "Retraso en ruta MAD-BCN",   detail: "Demora estimada +4h por incidente vial",     time: "hace 15 min" },
  { id: 2, type: "warning",  title: "Stock bajo — SKU #A2041",   detail: "Quedan 12 unidades, mínimo recomendado 50", time: "hace 1h"     },
  { id: 3, type: "warning",  title: "Almacén Valencia al 92%",   detail: "Capacidad crítica, redistribuir stock",     time: "hace 2h"     },
  { id: 4, type: "info",     title: "Recepción programada",      detail: "Proveedor #P-08 llega mañana 09:00",       time: "hace 3h"     },
];

const alertStyles = {
  critical: { dot: "bg-rose-500",   badge: "bg-rose-50 text-rose-600 border-rose-100",   label: "Crítico"   },
  warning:  { dot: "bg-amber-400",  badge: "bg-amber-50 text-amber-600 border-amber-100", label: "Aviso"     },
  info:     { dot: "bg-sky-400",    badge: "bg-sky-50 text-sky-600 border-sky-100",       label: "Info"      },
};

export function LogisticaAlertsCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Alertas activas</p>
            <p className="text-[11px] text-slate-400">Requieren atención</p>
          </div>
        </div>
        <span className="rounded-full bg-rose-50 border border-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-600">
          {ALERTS.length}
        </span>
      </div>

      <ul className="divide-y divide-slate-50">
        {ALERTS.map((alert) => {
          const s = alertStyles[alert.type];
          return (
            <li key={alert.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[12px] font-semibold text-slate-800 leading-snug">{alert.title}</p>
                  <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${s.badge}`}>
                    {s.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{alert.detail}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{alert.time}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="px-5 py-3 border-t border-slate-100">
        <a href="/logistica/incidencias" className="text-[12px] font-medium text-sky-600 hover:text-sky-700 transition-colors">
          Ver todas las incidencias →
        </a>
      </div>
    </div>
  );
}

// ── Route Status Card ─────────────────────────────────────────────

type Route = {
  id:       string;
  origin:   string;
  dest:     string;
  status:   "on-time" | "delayed" | "delivered";
  eta:      string;
  driver:   string;
  packages: number;
};

const ROUTES: Route[] = [
  { id: "RT-4821", origin: "Madrid",    dest: "Barcelona",  status: "delayed",   eta: "18:30",  driver: "J. García",   packages: 34 },
  { id: "RT-4820", origin: "Sevilla",   dest: "Valencia",   status: "on-time",   eta: "16:45",  driver: "M. López",    packages: 18 },
  { id: "RT-4819", origin: "Bilbao",    dest: "Zaragoza",   status: "on-time",   eta: "15:00",  driver: "A. Ruiz",     packages: 27 },
  { id: "RT-4817", origin: "Valencia",  dest: "Alicante",   status: "delivered", eta: "Entregado", driver: "P. Martín", packages: 12 },
];

const routeStyles = {
  "on-time":  { color: "text-emerald-600", bg: "bg-emerald-50", label: "A tiempo",   icon: CheckCircle2 },
  "delayed":  { color: "text-amber-600",   bg: "bg-amber-50",   label: "Retraso",    icon: Clock        },
  "delivered":{ color: "text-slate-500",   bg: "bg-slate-100",  label: "Entregado",  icon: CheckCircle2 },
};

export function LogisticaRoutesCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50">
            <Truck className="h-3.5 w-3.5 text-sky-600" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Rutas en curso</p>
            <p className="text-[11px] text-slate-400">Seguimiento en tiempo real</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Live
        </span>
      </div>

      <ul className="divide-y divide-slate-50">
        {ROUTES.map((route) => {
          const s = routeStyles[route.status];
          const Icon = s.icon;
          return (
            <li key={route.id} className="px-5 py-3 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-semibold text-slate-400">{route.id}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${s.bg} ${s.color}`}>
                      <Icon className="h-2.5 w-2.5" />
                      {s.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-slate-300 shrink-0" />
                    <p className="text-[12px] text-slate-700 font-medium truncate">
                      {route.origin} → {route.dest}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {route.driver} · {route.packages} paquetes · ETA {route.eta}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="px-5 py-3 border-t border-slate-100">
        <a href="/logistica/rutas" className="text-[12px] font-medium text-sky-600 hover:text-sky-700 transition-colors">
          Ver mapa de rutas →
        </a>
      </div>
    </div>
  );
}