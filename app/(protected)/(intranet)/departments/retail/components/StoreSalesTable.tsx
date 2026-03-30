"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Search, ChevronRight, Minus } from "lucide-react";

type Store = {
  id: string; name: string; city: string; region: string;
  salesDay: number; targetDay: number;
  salesMonth: number; targetMonth: number;
  transactions: number; avgTicket: number;
  conversion: number; staff: number;
  status: "open" | "closed" | "incident";
};

// Cifras en COP · marcas reales del portafolio EDM
const STORES: Store[] = [
  { id: "EDM-01", name: "Diesel Andino",         city: "Bogotá",       region: "Bogotá",       salesDay: 8_420_000, targetDay: 7_800_000, salesMonth: 198_400_000, targetMonth: 185_000_000, transactions: 112, avgTicket: 75_178, conversion: 5.8, staff: 4, status: "open"     },
  { id: "EDM-02", name: "Diesel El Tesoro",       city: "Medellín",     region: "Antioquia",    salesDay: 6_910_000, targetDay: 6_500_000, salesMonth: 162_800_000, targetMonth: 158_000_000, transactions: 89,  avgTicket: 77_640, conversion: 5.1, staff: 3, status: "incident" },
  { id: "EDM-03", name: "Pilatos Fontanar",       city: "Bogotá",       region: "Bogotá",       salesDay: 5_340_000, targetDay: 5_800_000, salesMonth: 124_200_000, targetMonth: 140_000_000, transactions: 143, avgTicket: 37_342, conversion: 4.2, staff: 5, status: "open"     },
  { id: "EDM-04", name: "Kipling Unicentro",      city: "Bogotá",       region: "Bogotá",       salesDay: 4_780_000, targetDay: 4_200_000, salesMonth: 112_600_000, targetMonth: 105_000_000, transactions: 98,  avgTicket: 48_775, conversion: 4.9, staff: 3, status: "open"     },
  { id: "EDM-05", name: "Superdry Prime Outlet",  city: "Medellín",     region: "Antioquia",    salesDay: 3_920_000, targetDay: 4_500_000, salesMonth: 91_400_000,  targetMonth: 108_000_000, transactions: 74,  avgTicket: 52_972, conversion: 3.6, staff: 2, status: "open"     },
  { id: "EDM-06", name: "Pilatos Mayorca",        city: "Medellín",     region: "Antioquia",    salesDay: 6_150_000, targetDay: 5_900_000, salesMonth: 144_800_000, targetMonth: 142_000_000, transactions: 168, avgTicket: 36_607, conversion: 4.7, staff: 6, status: "open"     },
  { id: "EDM-07", name: "Kipling Buenavista",     city: "Barranquilla", region: "Caribe",       salesDay: 2_980_000, targetDay: 3_200_000, salesMonth: 68_400_000,  targetMonth: 76_000_000,  transactions: 61,  avgTicket: 48_852, conversion: 3.4, staff: 2, status: "open"     },
  { id: "EDM-08", name: "Diesel Chipichape",      city: "Cali",         region: "Pacífico",     salesDay: 4_210_000, targetDay: 5_000_000, salesMonth: 98_600_000,  targetMonth: 120_000_000, transactions: 55,  avgTicket: 76_545, conversion: 3.1, staff: 3, status: "incident" },
  { id: "EDM-09", name: "Superdry Cacique",       city: "Bucaramanga",  region: "Santanderes",  salesDay: 2_640_000, targetDay: 2_800_000, salesMonth: 61_200_000,  targetMonth: 67_000_000,  transactions: 48,  avgTicket: 55_000, conversion: 3.8, staff: 2, status: "open"     },
  { id: "EDM-10", name: "Pilatos Paseo Villa",    city: "Bogotá",       region: "Bogotá",       salesDay: 0,         targetDay: 3_500_000, salesMonth: 72_800_000,  targetMonth: 84_000_000,  transactions: 0,   avgTicket: 0,      conversion: 0,   staff: 0, status: "closed"   },
];

const REGIONS = ["Todas", "Bogotá", "Antioquia", "Caribe", "Pacífico", "Santanderes"];

const STATUS_CONFIG = {
  open:     { label: "Abierta",    dot: "bg-emerald-400", text: "text-emerald-600" },
  closed:   { label: "Cerrada",    dot: "bg-slate-400",   text: "text-slate-500"   },
  incident: { label: "Incidencia", dot: "bg-rose-500",    text: "text-rose-600"    },
};

function fmt(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
}

function fmtK(n: number) {
  if (n === 0) return "—";
  return `$${(n / 1_000_000).toFixed(1)}M`;
}

function VsBudget({ sales, target }: { sales: number; target: number }) {
  if (sales === 0) return <span className="text-[10px] text-slate-400">—</span>;
  const pct = Math.round(((sales - target) / target) * 100);
  if (pct > 0) return <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600"><TrendingUp className="h-3 w-3" />+{pct}%</span>;
  if (pct < 0) return <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-500"><TrendingDown className="h-3 w-3" />{pct}%</span>;
  return <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-400"><Minus className="h-3 w-3" />0%</span>;
}

function ProgressBar({ value, target }: { value: number; target: number }) {
  if (value === 0) return <div className="flex items-center gap-2"><div className="flex-1 h-1.5 rounded-full bg-slate-100" /><span className="text-[10px] font-semibold text-slate-400 w-6 text-right">—</span></div>;
  const pct = Math.min(Math.round((value / target) * 100), 100);
  const color = pct >= 100 ? "bg-emerald-500" : pct >= 80 ? "bg-amber-400" : "bg-rose-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-semibold text-slate-500 w-6 text-right">{pct}%</span>
    </div>
  );
}

export default function TiendasSalesTable() {
  const [search,  setSearch]  = useState("");
  const [region,  setRegion]  = useState("Todas");
  const [sortKey, setSortKey] = useState<"salesDay" | "salesMonth" | "conversion">("salesDay");

  const filtered = STORES
    .filter(s => {
      const matchRegion = region === "Todas" || s.region === region;
      const q = search.toLowerCase();
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q);
      return matchRegion && matchSearch;
    })
    .sort((a, b) => b[sortKey] - a[sortKey]);

  const totalDay   = filtered.reduce((acc, s) => acc + s.salesDay, 0);
  const totalMonth = filtered.reduce((acc, s) => acc + s.salesMonth, 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div>
          <p className="text-sm font-semibold text-slate-800">Ventas por tienda · hoy</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {filtered.length} tiendas · acumulado día{" "}
            <span className="font-bold text-slate-700">{fmtK(totalDay)}</span>
            {" "}· mes{" "}
            <span className="font-bold text-slate-700">{fmtK(totalMonth)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input type="text" placeholder="Buscar tienda..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-[12px] rounded-lg border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 outline-none focus:border-orange-300 focus:bg-white transition w-40" />
          </div>
          <select value={sortKey} onChange={e => setSortKey(e.target.value as typeof sortKey)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[12px] text-slate-600 outline-none focus:border-orange-300 cursor-pointer">
            <option value="salesDay">Ordenar: Ventas hoy</option>
            <option value="salesMonth">Ordenar: Ventas mes</option>
            <option value="conversion">Ordenar: Conversión</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1 px-5 py-2.5 bg-slate-50/60 border-b border-slate-100 overflow-x-auto">
        {REGIONS.map(r => (
          <button key={r} onClick={() => setRegion(r)}
            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${region === r ? "bg-orange-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-200 hover:text-slate-700"}`}>
            {r}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/40">
              {["Tienda", "Estado", "Ventas hoy vs obj.", "Ventas mes", "Ticket medio", "Conversión", "Staff", ""].map(h => (
                <th key={h} className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(s => {
              const sc = STATUS_CONFIG[s.status];
              const monthPct = s.salesMonth > 0 ? Math.min(Math.round((s.salesMonth / s.targetMonth) * 100), 100) : 0;
              const monthColor = monthPct >= 100 ? "bg-emerald-500" : monthPct >= 80 ? "bg-amber-400" : "bg-rose-400";
              return (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors group">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{s.name}</p>
                    <p className="text-[10px] text-slate-400">{s.city} · {s.id}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${sc.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${sc.dot} ${s.status === "open" ? "animate-pulse" : ""}`} />
                      {sc.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 min-w-[160px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800">{s.salesDay > 0 ? fmtK(s.salesDay) : "—"}</span>
                      <VsBudget sales={s.salesDay} target={s.targetDay} />
                    </div>
                    <ProgressBar value={s.salesDay} target={s.targetDay} />
                  </td>
                  <td className="px-4 py-3 min-w-[140px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-700">{fmtK(s.salesMonth)}</span>
                      <span className="text-[10px] text-slate-400">{monthPct > 0 ? `${monthPct}%` : "—"}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      {monthPct > 0 && <div className={`h-full rounded-full ${monthColor}`} style={{ width: `${monthPct}%` }} />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-medium">
                    {s.avgTicket > 0 ? fmt(s.avgTicket) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {s.conversion > 0
                      ? <span className={`font-bold ${s.conversion >= 4.5 ? "text-emerald-600" : s.conversion >= 3.5 ? "text-amber-600" : "text-rose-500"}`}>{s.conversion}%</span>
                      : <span className="text-slate-400">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-center">{s.staff > 0 ? s.staff : "—"}</td>
                  <td className="px-4 py-3">
                    <a href={`/tiendas/${s.id}`} className="flex items-center gap-0.5 text-orange-500 opacity-0 group-hover:opacity-100 transition text-[11px] font-semibold">
                      Ver <ChevronRight className="h-3.5 w-3.5" />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/40">
        <p className="text-[11px] text-slate-400">
          {filtered.filter(s => s.status === "open").length} abiertas ·{" "}
          {filtered.filter(s => s.salesDay >= s.targetDay && s.salesDay > 0).length} sobre objetivo
        </p>
        <a href="/tiendas/ventas" className="text-[12px] font-medium text-orange-600 hover:text-orange-700 transition-colors">
          Ver informe completo →
        </a>
      </div>
    </div>
  );
}