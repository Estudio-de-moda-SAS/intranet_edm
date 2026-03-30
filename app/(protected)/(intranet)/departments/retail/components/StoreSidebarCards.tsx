"use client";

import { Trophy, Package, AlertCircle, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";

const TOP_PERFORMERS = [
  { rank: 1, name: "Diesel Andino",        city: "Bogotá",       sales: 8_420_000, vs: +7.9,  badge: "🥇" },
  { rank: 2, name: "Pilatos Mayorca",       city: "Medellín",     sales: 6_150_000, vs: +4.2,  badge: "🥈" },
  { rank: 3, name: "Diesel El Tesoro",      city: "Medellín",     sales: 6_910_000, vs: +6.3,  badge: "🥉" },
  { rank: 4, name: "Kipling Unicentro",     city: "Bogotá",       sales: 4_780_000, vs: +13.8, badge: null  },
  { rank: 5, name: "Diesel Chipichape",     city: "Cali",         sales: 4_210_000, vs: -15.8, badge: null  },
];

const BOTTOM_PERFORMERS = [
  { rank: 1, name: "Superdry Prime Outlet", city: "Medellín",     pct: 71, gap: -1_800_000 },
  { rank: 2, name: "Pilatos Fontanar",      city: "Bogotá",       pct: 79, gap: -460_000   },
  { rank: 3, name: "Kipling Buenavista",    city: "Barranquilla", pct: 81, gap: -220_000   },
];

function fmt(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
}

export function TiendasRankingCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50">
          <Trophy className="h-3.5 w-3.5 text-amber-500" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-800">Ranking hoy</p>
          <p className="text-[11px] text-slate-400">Por ventas del día</p>
        </div>
      </div>

      <div className="px-5 pt-4 pb-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Más vendidas</p>
        <ul className="flex flex-col gap-2">
          {TOP_PERFORMERS.map(s => (
            <li key={s.name} className="flex items-center gap-2.5">
              <span className="w-5 text-center text-[13px]">{s.badge ?? <span className="text-[11px] font-bold text-slate-400">#{s.rank}</span>}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-semibold text-slate-800 truncate">{s.name}</p>
                  <p className="text-[12px] font-bold text-slate-700">{fmt(s.sales)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-slate-400">{s.city}</p>
                  <span className={`flex items-center gap-0.5 text-[10px] font-bold ${s.vs >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                    {s.vs >= 0 ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
                    {Math.abs(s.vs)}% vs obj.
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-5 pt-3 pb-4 border-t border-slate-100 mt-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-2.5">Bajo objetivo</p>
        <ul className="flex flex-col gap-2">
          {BOTTOM_PERFORMERS.map(s => (
            <li key={s.name} className="flex items-center gap-2.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[12px] font-semibold text-slate-700">{s.name} · <span className="text-slate-400 font-normal">{s.city}</span></p>
                  <span className="text-[11px] font-bold text-rose-500">{fmt(s.gap)}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-rose-400" style={{ width: `${s.pct}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{s.pct}% del objetivo diario</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Stock Replenishment ───────────────────────────────────────────

const REPLENISHMENT = [
  { store: "Diesel El Tesoro",      city: "Medellín",     sku: "DSL-DSTR-BLK-30", name: "D-Strukt slim 30/32 negro",    stock: 0, min: 6,  urgent: true  },
  { store: "Superdry Prime Outlet", city: "Medellín",     sku: "SPD-VTGLOG-NVY-M", name: "Vintage Logo hoodie navy M",  stock: 1, min: 8,  urgent: true  },
  { store: "Diesel Chipichape",     city: "Cali",         sku: "DSL-1DR-BRN-OS",  name: "1DR Shoulder Bag brown OS",   stock: 0, min: 4,  urgent: true  },
  { store: "Kipling Buenavista",    city: "Barranquilla", sku: "KPL-SEOULG-BLK",  name: "Seoul Large Backpack negro",  stock: 3, min: 10, urgent: false },
  { store: "Pilatos Fontanar",      city: "Bogotá",       sku: "NB-574-GRY-42",   name: "New Balance 574 gris T.42",   stock: 2, min: 6,  urgent: false },
];

export function TiendasReplenishmentCard() {
  const urgentCount = REPLENISHMENT.filter(r => r.urgent).length;
  const storeCount  = new Set(REPLENISHMENT.map(r => r.store)).size;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50">
            <Package className="h-3.5 w-3.5 text-rose-500" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Reposición urgente</p>
            <p className="text-[11px] text-slate-400">{urgentCount} referencias críticas</p>
          </div>
        </div>
        <span className="rounded-full bg-rose-50 border border-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-600">
          {REPLENISHMENT.length}
        </span>
      </div>

      <ul className="divide-y divide-slate-50">
        {REPLENISHMENT.map((item, i) => (
          <li key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors">
            <span className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${item.urgent ? "bg-rose-100" : "bg-amber-50"}`}>
              <AlertCircle className={`h-3 w-3 ${item.urgent ? "text-rose-500" : "text-amber-400"}`} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[12px] font-semibold text-slate-800 leading-snug">{item.name}</p>
                  <p className="text-[10px] text-slate-400">{item.store} · {item.city}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-[12px] font-bold ${item.stock === 0 ? "text-rose-600" : "text-amber-600"}`}>
                    {item.stock === 0 ? "Agotado" : `${item.stock} ud.`}
                  </p>
                  <p className="text-[10px] text-slate-400">mín. {item.min}</p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
        <p className="text-[11px] text-slate-400">{REPLENISHMENT.length} referencias en {storeCount} tiendas</p>
        <a href="/tiendas/reposicion" className="flex items-center gap-0.5 text-[12px] font-medium text-orange-600 hover:text-orange-700 transition-colors">
          Gestionar reposición <ChevronRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}