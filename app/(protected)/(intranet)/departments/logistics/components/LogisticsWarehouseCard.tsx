"use client";

import { Warehouse, Package, TrendingDown, AlertCircle } from "lucide-react";

type WarehouseData = {
  id:       string;
  name:     string;
  city:     string;
  capacity: number; // %
  items:    number;
  sku:      number;
  status:   "ok" | "warning" | "critical";
};

const WAREHOUSES: WarehouseData[] = [
  { id: "ALM-01", name: "Central Madrid",   city: "Getafe, Madrid",    capacity: 68, items: 24_830, sku: 412, status: "ok"       },
  { id: "ALM-02", name: "Zona Levante",     city: "Quart, Valencia",   capacity: 92, items: 18_450, sku: 287, status: "critical"  },
  { id: "ALM-03", name: "Norte Industrial", city: "Barakaldo, Bilbao", capacity: 55, items: 11_200, sku: 198, status: "ok"        },
  { id: "ALM-04", name: "Sur Logístico",    city: "Dos Hermanas, SVQ", capacity: 74, items: 9_600,  sku: 156, status: "warning"   },
];

const LOW_STOCK = [
  { sku: "A2041", name: "Caja embalaje 60×40", stock: 12, min: 50, unit: "ud." },
  { sku: "B1190", name: "Palet europeo",        stock: 8,  min: 30, unit: "ud." },
  { sku: "C3308", name: "Film estirable 23µ",   stock: 3,  min: 20, unit: "rol" },
  { sku: "D0471", name: "Precinto impreso",      stock: 22, min: 100,unit: "ud." },
];

const capConfig = {
  ok:       { bar: "bg-sky-500",    text: "text-sky-600",    label: "Operativo" },
  warning:  { bar: "bg-amber-400",  text: "text-amber-600",  label: "Aviso"     },
  critical: { bar: "bg-rose-500",   text: "text-rose-600",   label: "Crítico"   },
};

export default function LogisticaWarehouseCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
            <Warehouse className="h-3.5 w-3.5 text-indigo-600" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Almacenes e inventario</p>
            <p className="text-[11px] text-slate-400">Capacidad y stock crítico</p>
          </div>
        </div>
        <a href="/logistica/almacenes" className="text-[12px] font-medium text-sky-600 hover:text-sky-700 transition-colors">
          Gestionar →
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">

        {/* Left — Warehouse list */}
        <div className="p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
            Ocupación por almacén
          </p>
          <ul className="flex flex-col gap-4">
            {WAREHOUSES.map((wh) => {
              const cfg = capConfig[wh.status];
              return (
                <li key={wh.id}>
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="text-[12px] font-semibold text-slate-800">{wh.name}</p>
                      <p className="text-[11px] text-slate-400">{wh.city} · {wh.sku} SKUs</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-[13px] font-bold ${cfg.text}`}>{wh.capacity}%</p>
                      <p className={`text-[10px] font-semibold ${cfg.text}`}>{cfg.label}</p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${cfg.bar}`}
                      style={{ width: `${wh.capacity}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {wh.items.toLocaleString("es-ES")} artículos almacenados
                  </p>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right — Low stock */}
        <div className="p-5">
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Stock bajo mínimo
            </p>
          </div>

          <ul className="flex flex-col gap-3">
            {LOW_STOCK.map((item) => {
              const pct = Math.round((item.stock / item.min) * 100);
              return (
                <li key={item.sku} className="rounded-xl border border-rose-100 bg-rose-50/40 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="h-3 w-3 text-rose-400 shrink-0" />
                        <p className="text-[12px] font-semibold text-slate-800 truncate">{item.name}</p>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono text-rose-600 font-bold">{item.stock} {item.unit}</span>
                        <span className="text-slate-400"> / mín. {item.min} {item.unit}</span>
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] font-semibold text-rose-500 bg-rose-100 rounded-full px-2 py-0.5">
                      {pct}%
                    </span>
                  </div>
                  <div className="h-1 mt-2 w-full rounded-full bg-rose-100 overflow-hidden">
                    <div className="h-full rounded-full bg-rose-400" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-slate-400" />
              <p className="text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">34</span> SKUs por debajo del mínimo
              </p>
            </div>
            <a href="/logistica/inventario" className="text-[12px] font-medium text-sky-600 hover:text-sky-700 transition-colors">
              Ver inventario →
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}