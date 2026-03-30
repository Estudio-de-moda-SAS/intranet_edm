"use client";

import { AlertTriangle, Clock, MapPin, ChevronRight, Truck, Phone } from "lucide-react";

// ── Critical Alerts ───────────────────────────────────────────────

type Alert = {
  id:       number;
  severity: "critical" | "warning";
  title:    string;
  detail:   string;
  time:     string;
  action:   string;
  href:     string;
};

const ALERTS: Alert[] = [
  {
    id: 1, severity: "critical",
    title:  "Ruta MAD-BCN bloqueada",
    detail: "Accidente en AP-2 km 142 · Demora estimada +4h · 34 paquetes afectados",
    time:   "hace 15 min",
    action: "Reasignar ruta",
    href:   "/logistica/rutas/RT-4821",
  },
  {
    id: 2, severity: "critical",
    title:  "Almacén Valencia al 92% de capacidad",
    detail: "Límite operativo superado · Bloquear recepciones hasta redistribución",
    time:   "hace 47 min",
    action: "Ver almacén",
    href:   "/logistica/almacenes/ALM-02",
  },
  {
    id: 3, severity: "warning",
    title:  "SKU #A2041 — Stock crítico",
    detail: "Quedan 12 ud. · Mínimo operativo: 50 · Proveedor con 3 días de lead time",
    time:   "hace 1h",
    action: "Crear OC",
    href:   "/logistica/compras/nuevo",
  },
];

// ── Delayed Shipments ─────────────────────────────────────────────

type Delayed = {
  id:      string;
  dest:    string;
  carrier: string;
  delay:   string;
  reason:  string;
  contact: string;
  packages: number;
};

const DELAYED: Delayed[] = [
  { id: "SHP-00921", dest: "Barcelona",  carrier: "SEUR",    delay: "+4h",  reason: "Incidente vial",         contact: "612 345 678", packages: 34 },
  { id: "SHP-00919", dest: "Cádiz",      carrier: "GLS",     delay: "+2h",  reason: "Avería vehículo",        contact: "698 123 456", packages: 12 },
  { id: "SHP-00914", dest: "Benidorm",   carrier: "Correos", delay: "+6h",  reason: "Huelga parcial reparto", contact: "900 100 010", packages: 9  },
];

// ── Component ─────────────────────────────────────────────────────

export default function LogisticaOperationsCenter() {
  const criticalCount = ALERTS.filter(a => a.severity === "critical").length;

  return (
    <div className="rounded-2xl border-2 border-rose-200/70 bg-white shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-gradient-to-r from-rose-50 to-amber-50/60 border-b border-rose-100">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
          </span>
          <p className="text-sm font-bold text-slate-800">Centro de operaciones · Atención requerida</p>
          <span className="rounded-full bg-rose-100 border border-rose-200 px-2 py-0.5 text-[11px] font-bold text-rose-600">
            {criticalCount} críticas · {DELAYED.length} envíos retrasados
          </span>
        </div>
        <a href="/logistica/incidencias" className="text-[12px] font-medium text-rose-600 hover:text-rose-700 transition-colors">
          Ver todas las incidencias →
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

        {/* Left — Alerts */}
        <div className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
            Alertas activas
          </p>
          <ul className="flex flex-col gap-3">
            {ALERTS.map((alert) => {
              const isCritical = alert.severity === "critical";
              return (
                <li
                  key={alert.id}
                  className={`flex items-start gap-3 rounded-xl p-3 border transition-all hover:shadow-sm ${
                    isCritical
                      ? "border-rose-200 bg-rose-50/60"
                      : "border-amber-200 bg-amber-50/40"
                  }`}
                >
                  <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
                    isCritical ? "bg-rose-100" : "bg-amber-100"
                  }`}>
                    <AlertTriangle className={`h-3.5 w-3.5 ${isCritical ? "text-rose-500" : "text-amber-500"}`} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[12px] font-bold text-slate-800">{alert.title}</p>
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                        isCritical ? "bg-rose-200 text-rose-700" : "bg-amber-200 text-amber-700"
                      }`}>
                        {isCritical ? "Crítico" : "Aviso"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{alert.detail}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-slate-400">{alert.time}</span>
                      <a
                        href={alert.href}
                        className={`flex items-center gap-0.5 text-[11px] font-semibold transition-colors ${
                          isCritical ? "text-rose-600 hover:text-rose-700" : "text-amber-600 hover:text-amber-700"
                        }`}
                      >
                        {alert.action} <ChevronRight className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right — Delayed shipments */}
        <div className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
            Envíos con retraso
          </p>
          <ul className="flex flex-col gap-3">
            {DELAYED.map((s) => (
              <li
                key={s.id}
                className="group flex items-start gap-3 rounded-xl border border-amber-200/60 bg-amber-50/30 p-3 hover:border-amber-300 hover:bg-amber-50 transition-all"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-slate-500">{s.id}</span>
                      <span className="rounded-full bg-amber-200 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
                        {s.delay}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{s.packages} bultos</span>
                  </div>

                  <div className="flex items-center gap-1 mt-1">
                    <Truck className="h-3 w-3 text-slate-300 shrink-0" />
                    <p className="text-[12px] font-semibold text-slate-700 truncate">
                      → {s.dest} · {s.carrier}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{s.reason}</p>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <MapPin className="h-3 w-3" />
                      <span>Contacto transportista</span>
                    </div>
                    <a
                      href={`tel:${s.contact}`}
                      className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-700 transition-colors"
                    >
                      <Phone className="h-3 w-3" />
                      {s.contact}
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}