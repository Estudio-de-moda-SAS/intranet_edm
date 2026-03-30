"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Award, Store } from "lucide-react";

type Seller = {
  name: string;
  initials: string;
  hue: number;
  role: string;
  sales: number;
  target: number;
  deals: number;
};

type Channel = {
  name: string;
  amount: number;
  pct: number;
  color: string;
  trend: number;
};

const TOP_SELLERS: Seller[] = [
  { name: "Valentina Ospina",  initials: "VO", hue: 160, role: "Key Account",    sales: 58400, target: 55000, deals: 12 },
  { name: "Andrés Castaño",    initials: "AC", hue: 200, role: "Ejecutivo Sr.",   sales: 51200, target: 55000, deals: 9  },
  { name: "Laura Bermúdez",    initials: "LB", hue: 280, role: "Ejecutiva",       sales: 47800, target: 45000, deals: 14 },
  { name: "Felipe Morales",    initials: "FM", hue: 30,  role: "Ejecutivo Jr.",   sales: 39600, target: 40000, deals: 11 },
  { name: "Sara Quintero",     initials: "SQ", hue: 340, role: "Ejecutiva",       sales: 36100, target: 40000, deals: 8  },
];

const CHANNELS: Channel[] = [
  { name: "Tiendas propias",   amount: 148000, pct: 43, color: "bg-emerald-500", trend: +5  },
  { name: "Mayoristas",        amount: 96000,  pct: 28, color: "bg-teal-500",    trend: +2  },
  { name: "E-commerce",        amount: 69000,  pct: 20, color: "bg-cyan-500",    trend: +18 },
  { name: "Distribuidores",    amount: 35000,  pct: 10, color: "bg-sky-400",     trend: -3  },
];

export default function CommercialSalesSection() {
  return (
    <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">

      {/* Top sellers */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50">
            <Award className="h-3.5 w-3.5 text-amber-500" />
          </span>
          <h2 className="text-sm font-semibold text-slate-800">Top Vendedores</h2>
          <span className="ml-auto text-[11px] text-slate-400">Este mes</span>
        </div>

        <ul className="divide-y divide-slate-50">
          {TOP_SELLERS.map((seller, i) => {
            const pct     = Math.round((seller.sales / seller.target) * 100);
            const onTrack = seller.sales >= seller.target;
            return (
              <motion.li
                key={seller.name}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: i * 0.07 }}
                className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors"
              >
                {/* Rank */}
                <span className={`w-5 shrink-0 text-center text-[12px] font-bold tabular-nums ${
                  i === 0 ? "text-amber-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-700/70" : "text-slate-300"
                }`}>
                  {i + 1}
                </span>

                {/* Avatar */}
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white shadow-sm"
                  style={{ background: `linear-gradient(135deg, hsl(${seller.hue},65%,55%), hsl(${seller.hue + 20},60%,45%))` }}
                >
                  {seller.initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800 truncate">{seller.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="h-1.5 w-20 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${onTrack ? "bg-emerald-400" : "bg-amber-400"}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">{pct}%</span>
                  </div>
                </div>

                {/* Amount */}
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-[13px] font-bold text-slate-800 tabular-nums">
                    ${(seller.sales / 1000).toFixed(0)}k
                  </span>
                  <span className="text-[10px] text-slate-400">{seller.deals} cierres</span>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>

      {/* Channel breakdown */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50">
            <Store className="h-3.5 w-3.5 text-teal-600" />
          </span>
          <h2 className="text-sm font-semibold text-slate-800">Ventas por Canal</h2>
          <span className="ml-auto text-[11px] text-slate-400">Junio 2024</span>
        </div>

        <div className="p-5 space-y-5">
          {CHANNELS.map((ch, i) => (
            <div key={ch.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] font-medium text-slate-700">{ch.name}</span>
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="text-slate-400">${(ch.amount / 1000).toFixed(0)}k</span>
                  <span className={`flex items-center gap-0.5 font-semibold ${
                    ch.trend >= 0 ? "text-emerald-600" : "text-rose-500"
                  }`}>
                    {ch.trend >= 0
                      ? <TrendingUp className="h-3 w-3" />
                      : <TrendingDown className="h-3 w-3" />}
                    {ch.trend > 0 ? "+" : ""}{ch.trend}%
                  </span>
                </div>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${ch.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${ch.pct}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                />
              </div>
              <div className="mt-1 text-right text-[10px] text-slate-400">{ch.pct}% del total</div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}