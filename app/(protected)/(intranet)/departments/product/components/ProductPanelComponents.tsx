// app/product/components/ProductPanelComponents.tsx
"use client";

import { CheckCircle2, Clock, AlertCircle, Loader2, Store } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// ProductLaunchPanel
// Panel ejecutivo: estado de lanzamiento por colección y por tienda
// ─────────────────────────────────────────────────────────────────────────────

type LaunchRecord = {
  collection: string;
  season:     string;
  store:      string;
  refs:       number;
  ready:      number;
  status:     "ready" | "in_progress" | "delayed" | "not_started";
  eta:        string;
};

const LAUNCHES: LaunchRecord[] = [
  { collection: "Primavera Verano 2025", season: "SS-25",  store: "Bogotá · Andino",          refs: 128, ready: 98,  status: "in_progress", eta: "15 jul" },
  { collection: "Primavera Verano 2025", season: "SS-25",  store: "Bogotá · Gran Estación",    refs: 128, ready: 84,  status: "in_progress", eta: "15 jul" },
  { collection: "Primavera Verano 2025", season: "SS-25",  store: "Medellín · El Tesoro",      refs: 128, ready: 91,  status: "in_progress", eta: "15 jul" },
  { collection: "Primavera Verano 2025", season: "SS-25",  store: "Cali · Jardín Plaza",       refs: 96,  ready: 96,  status: "ready",       eta: "15 jul" },
  { collection: "Primavera Verano 2025", season: "SS-25",  store: "Barranquilla · Buenavista", refs: 80,  ready: 48,  status: "delayed",     eta: "22 jul" },
  { collection: "Resort 2025",           season: "RST-25", store: "Bogotá · Andino",           refs: 64,  ready: 21,  status: "in_progress", eta: "01 sep" },
  { collection: "Resort 2025",           season: "RST-25", store: "Cartagena · San Pedro",     refs: 48,  ready: 12,  status: "not_started", eta: "01 sep" },
];

const LAUNCH_STATUS_META = {
  ready:       { label: "Lista",       icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />, badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  in_progress: { label: "En proceso",  icon: <Loader2      className="h-3.5 w-3.5 text-sky-500"     />, badge: "bg-sky-50     text-sky-700    border-sky-200"     },
  delayed:     { label: "Con retraso", icon: <AlertCircle  className="h-3.5 w-3.5 text-rose-500"    />, badge: "bg-rose-50    text-rose-700   border-rose-200"    },
  not_started: { label: "Sin iniciar", icon: <Clock        className="h-3.5 w-3.5 text-stone-400"   />, badge: "bg-stone-50   text-stone-500  border-stone-200"   },
};

export function ProductLaunchPanel() {
  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-stone-100 bg-stone-50">
            {["Colección", "Temporada", "Tienda", "Refs totales", "Listas", "% avance", "ETA", "Estado"].map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 text-left text-[10px] font-semibold text-stone-400 uppercase tracking-wide whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-50">
          {LAUNCHES.map((r, i) => {
            const pct  = Math.round((r.ready / r.refs) * 100);
            const meta = LAUNCH_STATUS_META[r.status];
            return (
              <tr key={i} className="hover:bg-stone-50/60 transition-colors">
                <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">{r.collection}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                    {r.season}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.store}</td>
                <td className="px-4 py-3 text-center font-semibold text-slate-600 tabular-nums">{r.refs}</td>
                <td className="px-4 py-3 text-center font-semibold text-emerald-600 tabular-nums">{r.ready}</td>
                <td className="px-4 py-3 min-w-[96px]">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-stone-400 w-7 text-right tabular-nums">{pct}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-stone-500 whitespace-nowrap">{r.eta}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.badge}`}>
                    {meta.icon}
                    {meta.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProductStoreDistributionCard
// Resumen de distribución de referencias por punto de venta
// Visible para: product + retail + manager + admin
// ─────────────────────────────────────────────────────────────────────────────

type StoreRow = {
  name:     string;
  city:     string;
  total:    number;
  received: number;
  missing:  number;
};

const STORES: StoreRow[] = [
  { name: "Andino",        city: "Bogotá",       total: 128, received: 98,  missing: 30 },
  { name: "Gran Estación", city: "Bogotá",       total: 128, received: 84,  missing: 44 },
  { name: "El Tesoro",     city: "Medellín",     total: 128, received: 91,  missing: 37 },
  { name: "Jardín Plaza",  city: "Cali",         total: 96,  received: 96,  missing: 0  },
  { name: "Buenavista",    city: "Barranquilla", total: 80,  received: 48,  missing: 32 },
  { name: "San Pedro",     city: "Cartagena",    total: 48,  received: 12,  missing: 36 },
];

export function ProductStoreDistributionCard() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100">
          <Store className="h-3.5 w-3.5 text-stone-600" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Distribución por tienda</h2>
          <p className="text-[11px] text-slate-400">Referencias SS-25 confirmadas por punto de venta</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {STORES.map((s) => {
          const pct   = Math.round((s.received / s.total) * 100);
          const allOk = s.missing === 0;
          return (
            <div
              key={s.name}
              className={`rounded-xl border p-4 ${allOk ? "border-emerald-200 bg-emerald-50/30" : "border-stone-100 bg-stone-50/50"}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[13px] font-semibold text-slate-800">{s.name}</p>
                  <p className="text-[11px] text-stone-400">{s.city}</p>
                </div>
                <span className="text-lg font-bold text-slate-700 tabular-nums">{pct}%</span>
              </div>
              <div className="mb-2 h-1.5 w-full rounded-full bg-stone-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${allOk ? "bg-emerald-400" : "bg-gradient-to-r from-amber-400 to-orange-400"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-emerald-700 font-semibold">{s.received} recibidas</span>
                {s.missing > 0 ? (
                  <span className="text-rose-600 font-semibold">{s.missing} pendientes</span>
                ) : (
                  <span className="text-emerald-600 font-semibold">✓ Completo</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}