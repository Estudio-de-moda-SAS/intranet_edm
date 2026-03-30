"use client";

import { AlertTriangle, WifiOff, ShieldAlert, Clock, ChevronRight, Phone, Store } from "lucide-react";

type StoreAlert = {
  id: number; severity: "critical" | "warning";
  store: string; city: string;
  type: "pos" | "security" | "ops" | "staff";
  title: string; detail: string; time: string; action: string; href: string;
};

type PendingClose = {
  id: string; store: string; city: string;
  scheduled: string; deviation: string; contact: string;
  status: "overdue" | "pending";
};

const ALERTS: StoreAlert[] = [
  {
    id: 1, severity: "critical",
    store: "Diesel El Tesoro", city: "Medellín",
    type: "pos",
    title: "Datafono fuera de línea",
    detail: "Terminal Ingenico #2 sin conexión desde las 11:20 · Clientes redirigidos a caja 1 · Fila > 10 personas",
    time: "hace 18 min", action: "Ver ticket", href: "/tiendas/incidencias/INC-0088",
  },
  {
    id: 2, severity: "critical",
    store: "Diesel Chipichape", city: "Cali",
    type: "security",
    title: "Alarma antihurto activada",
    detail: "4 activaciones en 2 horas · Seguridad del CC notificada · Se revisa grabación CCTV",
    time: "hace 45 min", action: "Ver incidencia", href: "/tiendas/incidencias/INC-0087",
  },
  {
    id: 3, severity: "warning",
    store: "Superdry Prime Outlet", city: "Medellín",
    type: "staff",
    title: "Turno tarde sin cubrir",
    detail: "1 baja de última hora · Turno de 15:00 con solo 1 asesor · Se busca reemplazo",
    time: "hace 1h 10min", action: "Gestionar turno", href: "/tiendas/personal/turnos",
  },
];

const PENDING_CLOSES: PendingClose[] = [
  { id: "EDM-02", store: "Diesel El Tesoro",    city: "Medellín",     scheduled: "21:00", deviation: "+$142.000 diferencia caja",  contact: "310 512 3344", status: "overdue"  },
  { id: "EDM-08", store: "Diesel Chipichape",   city: "Cali",         scheduled: "21:00", deviation: "Pendiente cuadre",           contact: "315 788 9900", status: "pending"  },
  { id: "EDM-06", store: "Pilatos Mayorca",      city: "Medellín",     scheduled: "21:30", deviation: "Sin incidencias",            contact: "312 441 6677", status: "pending"  },
];

const TYPE_ICON = {
  pos:      WifiOff,
  security: ShieldAlert,
  ops:      AlertTriangle,
  staff:    Clock,
};

export default function TiendasOpsCenter() {
  const criticalCount = ALERTS.filter(a => a.severity === "critical").length;

  return (
    <div className="rounded-2xl border-2 border-rose-200/70 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-gradient-to-r from-rose-50 to-orange-50/60 border-b border-rose-100">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
          </span>
          <p className="text-sm font-bold text-slate-800">Centro de operaciones · Atención requerida</p>
          <span className="rounded-full bg-rose-100 border border-rose-200 px-2 py-0.5 text-[11px] font-bold text-rose-600">
            {criticalCount} críticas · {PENDING_CLOSES.filter(c => c.status === "overdue").length} cierres con desviación
          </span>
        </div>
        <a href="/tiendas/incidencias" className="text-[12px] font-medium text-rose-600 hover:text-rose-700 transition-colors">
          Ver todas las incidencias →
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

        {/* Incidencias activas */}
        <div className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Incidencias activas en tienda</p>
          <ul className="flex flex-col gap-3">
            {ALERTS.map(alert => {
              const isCritical = alert.severity === "critical";
              const TypeIcon = TYPE_ICON[alert.type];
              return (
                <li key={alert.id} className={`flex items-start gap-3 rounded-xl p-3 border transition-all hover:shadow-sm ${isCritical ? "border-rose-200 bg-rose-50/60" : "border-amber-200 bg-amber-50/40"}`}>
                  <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${isCritical ? "bg-rose-100" : "bg-amber-100"}`}>
                    <TypeIcon className={`h-3.5 w-3.5 ${isCritical ? "text-rose-500" : "text-amber-500"}`} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-[12px] font-bold text-slate-800">{alert.title}</p>
                          <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${isCritical ? "bg-rose-200 text-rose-700" : "bg-amber-200 text-amber-700"}`}>
                            {isCritical ? "Crítico" : "Aviso"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Store className="h-3 w-3 text-slate-400 shrink-0" />
                          <p className="text-[11px] font-semibold text-slate-500">{alert.store} · {alert.city}</p>
                        </div>
                      </div>
                      <span className="shrink-0 text-[10px] text-slate-400">{alert.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{alert.detail}</p>
                    <div className="mt-2 flex justify-end">
                      <a href={alert.href} className={`flex items-center gap-0.5 text-[11px] font-semibold transition-colors ${isCritical ? "text-rose-600 hover:text-rose-700" : "text-amber-600 hover:text-amber-700"}`}>
                        {alert.action} <ChevronRight className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Cierres de caja */}
        <div className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Cierres de caja pendientes</p>
          <ul className="flex flex-col gap-3">
            {PENDING_CLOSES.map(c => {
              const isOverdue = c.status === "overdue";
              return (
                <li key={c.id} className={`flex items-start gap-3 rounded-xl border p-3 transition-all hover:shadow-sm ${isOverdue ? "border-rose-200 bg-rose-50/40" : "border-slate-200 bg-slate-50/60"}`}>
                  <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${isOverdue ? "bg-rose-100" : "bg-slate-100"}`}>
                    <Clock className={`h-3.5 w-3.5 ${isOverdue ? "text-rose-500" : "text-slate-400"}`} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[12px] font-bold text-slate-800">{c.store}</p>
                        <p className="text-[11px] text-slate-500">{c.city} · Cierre programado {c.scheduled}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${isOverdue ? "bg-rose-100 text-rose-600" : "bg-slate-200 text-slate-500"}`}>
                        {isOverdue ? "Con desviación" : "Pendiente"}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-1 font-semibold ${isOverdue ? "text-rose-600" : "text-slate-400"}`}>{c.deviation}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Phone className="h-3 w-3" />
                        <a href={`tel:${c.contact}`} className="hover:text-sky-600 transition-colors font-medium">{c.contact}</a>
                      </div>
                      <a href={`/tiendas/cierres/${c.id}`} className="flex items-center gap-0.5 text-[11px] font-semibold text-sky-600 hover:text-sky-700 transition-colors">
                        Ver cierre <ChevronRight className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <a href="/tiendas/cierres" className="text-[12px] font-medium text-sky-600 hover:text-sky-700 transition-colors">
              Ver todos los cierres de hoy →
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}