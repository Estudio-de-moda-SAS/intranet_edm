"use client";

import { motion } from "framer-motion";
import {
  Area, BarChart, Bar, Line,
  ComposedChart, ResponsiveContainer, Tooltip,
  CartesianGrid, XAxis, YAxis, Legend,
} from "recharts";
import { DollarSign, TrendingUp, Users, BarChart2, MapPin, Activity } from "lucide-react";
import { PageEnter, AnimateItem } from "@/app/components/ui/PageTransition";

// ── Mock data ─────────────────────────────────────────────────────

const MONTHLY_SALES = [
  { mes: "Ene", ventas: 285000, meta: 320000, clientes: 1190 },
  { mes: "Feb", ventas: 302000, meta: 320000, clientes: 1200 },
  { mes: "Mar", ventas: 318000, meta: 340000, clientes: 1212 },
  { mes: "Abr", ventas: 295000, meta: 340000, clientes: 1218 },
  { mes: "May", ventas: 332000, meta: 360000, clientes: 1228 },
  { mes: "Jun", ventas: 348000, meta: 400000, clientes: 1240 },
];

const PRODUCT_SALES = [
  { categoria: "Camisas",     ventas: 92000, unidades: 1840 },
  { categoria: "Pantalones",  ventas: 78000, unidades: 1300 },
  { categoria: "Vestidos",    ventas: 64000, unidades: 960  },
  { categoria: "Accesorios",  ventas: 48000, unidades: 3200 },
  { categoria: "Outerwear",   ventas: 38000, unidades: 380  },
  { categoria: "Denim",       ventas: 28000, unidades: 560  },
];

const STORE_PERFORMANCE = [
  { tienda: "Andino",      ventas: 68000, meta: 70000, satisfaccion: 88 },
  { tienda: "Unicentro",   ventas: 54000, meta: 50000, satisfaccion: 91 },
  { tienda: "El Retiro",   ventas: 48000, meta: 50000, satisfaccion: 85 },
  { tienda: "Santa Fé",    ventas: 42000, meta: 45000, satisfaccion: 79 },
  { tienda: "Hayuelos",    ventas: 38000, meta: 40000, satisfaccion: 82 },
];

const CONVERSION_FUNNEL = [
  { etapa: "Visitas web",   valor: 48000 },
  { etapa: "Interesados",   valor: 12400 },
  { etapa: "Cotizaciones",  valor: 4200  },
  { etapa: "Negociación",   valor: 1800  },
  { etapa: "Cerrados",      valor: 610   },
];

const RECENT_ACTIVITY = [
  { label: "Cierre: Grupo Éxito — $48,000",         time: "Hace 30m",   type: "ok"      },
  { label: "Nueva propuesta enviada a Tennis S.A.",  time: "Hace 1h",    type: "info"    },
  { label: "Pedido OC-2024-0841 despachado",         time: "Hace 2h",    type: "ok"      },
  { label: "Alerta: 3 clientes sin actividad 30d",   time: "Hace 3h",    type: "warning" },
  { label: "Meta semanal alcanzada — equipo norte",  time: "Ayer",       type: "ok"      },
  { label: "Cotización vencida — Punto Blanco",      time: "Ayer",       type: "warning" },
];

const ACTIVITY_DOT: Record<string, string> = {
  ok: "bg-emerald-400", warning: "bg-amber-400", info: "bg-sky-400",
};

// ── Helpers ───────────────────────────────────────────────────────

const TOOLTIP_STYLE = {
  background: "#fff", border: "1px solid #e2e8f0",
  borderRadius: "10px", fontSize: "12px", color: "#1e293b",
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
};

function SectionHeading({ icon: Icon, label, sub }: { icon: React.ElementType; label: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
        <Icon className="h-3.5 w-3.5 text-emerald-600" />
      </span>
      <div>
        <h2 className="text-sm font-semibold text-slate-800 leading-none">{label}</h2>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <div className="flex-1 h-px bg-slate-100 ml-2" />
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────

export default function CommercialDashboard() {
  return (
    <PageEnter className="space-y-10">

      {/* ── 1. Ventas vs Meta (area + line) ───────────────────── */}
      <AnimateItem>
        <SectionHeading icon={DollarSign} label="Ventas vs Meta" sub="Últimos 6 meses + clientes activos" />
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={MONTHLY_SALES}>
                <defs>
                  <linearGradient id="ventasGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Area  yAxisId="left"  type="monotone" dataKey="ventas"   name="Ventas"   stroke="#10b981" fill="url(#ventasGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                <Line  yAxisId="left"  type="monotone" dataKey="meta"     name="Meta"     stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 4" dot={false} />
                <Line  yAxisId="right" type="monotone" dataKey="clientes" name="Clientes" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </AnimateItem>

      {/* ── 2. Product sales + Conversion funnel ──────────────── */}
      <AnimateItem>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Product categories — 3 cols */}
          <div className="lg:col-span-3">
            <SectionHeading icon={BarChart2} label="Ventas por Categoría" sub="Valor en $ y unidades — junio 2024" />
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={PRODUCT_SALES} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="categoria" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number | undefined) => [`$${(v ?? 0).toLocaleString()}`, ""]} />
                    <Bar dataKey="ventas" name="Ventas" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Conversion funnel — 2 cols */}
          <div className="lg:col-span-2">
            <SectionHeading icon={TrendingUp} label="Embudo de Conversión" />
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="space-y-2">
                {CONVERSION_FUNNEL.map((item, i) => {
                  // ✅ Fix: extraer con guard para evitar acceso undefined a índices del array
                  const first = CONVERSION_FUNNEL[0];
                  const prev  = CONVERSION_FUNNEL[i - 1];
                  const pct      = first ? Math.round((item.valor / first.valor) * 100) : 0;
                  const convRate = (i > 0 && prev)
                    ? Math.round((item.valor / prev.valor) * 100)
                    : 100;
                  return (
                    <div key={item.etapa}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-medium text-slate-700">{item.etapa}</span>
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-slate-400 tabular-nums">{item.valor.toLocaleString()}</span>
                          {i > 0 && (
                            <span className="font-semibold text-emerald-600">{convRate}%</span>
                          )}
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, delay: i * 0.1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </AnimateItem>

      {/* ── 3. Store performance + Activity ───────────────────── */}
      <AnimateItem>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Store performance */}
          <div>
            <SectionHeading icon={MapPin} label="Desempeño por Tienda" sub="Ventas vs meta y NPS" />
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              {STORE_PERFORMANCE.map((store, i) => {
                const pct     = Math.round((store.ventas / store.meta) * 100);
                const onTrack = store.ventas >= store.meta;
                return (
                  <div key={store.tienda}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] font-medium text-slate-700">{store.tienda}</span>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-slate-400">NPS: <span className="font-semibold text-slate-600">{store.satisfaccion}</span></span>
                        <span className={`font-bold ${onTrack ? "text-emerald-600" : "text-amber-600"}`}>{pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${onTrack ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-amber-400 to-amber-500"}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(pct, 100)}%` }}
                        transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity feed */}
          <div>
            <SectionHeading icon={Activity} label="Actividad Reciente" />
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <ul className="divide-y divide-slate-50">
                {RECENT_ACTIVITY.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${ACTIVITY_DOT[item.type]}`} />
                    <span className="flex-1 text-[13px] text-slate-700">{item.label}</span>
                    <span className="shrink-0 text-[11px] text-slate-400">{item.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </AnimateItem>

      {/* ── 4. P&L comercial simplificado ─────────────────────── */}
      <AnimateItem>
        <SectionHeading icon={Users} label="Resumen Comercial — Junio 2024" sub="Indicadores clave vs mes anterior" />
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Indicador", "Actual", "Mes anterior", "Var.", "Estado"].map((col) => (
                  <th key={col} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-400">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { label: "Ventas totales",       curr: "$348k",  prev: "$332k",  var: "+4.8%", up: true,  status: "Bueno"      },
                { label: "Ticket promedio",       curr: "$2,810", prev: "$2,640", var: "+6.4%", up: true,  status: "Excelente"  },
                { label: "Nuevos clientes",       curr: "28",     prev: "24",     var: "+16.7%",up: true,  status: "Excelente"  },
                { label: "Tasa de cierre",        curr: "34%",    prev: "31%",    var: "+3pts", up: true,  status: "Bueno"      },
                { label: "Clientes inactivos 30d",curr: "48",     prev: "41",     var: "+17%",  up: false, status: "Atención"   },
                { label: "NPS",                   curr: "72",     prev: "69",     var: "+3pts", up: true,  status: "Excelente"  },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3 text-[13px] font-medium text-slate-700">{row.label}</td>
                  <td className="px-5 py-3 text-[13px] font-bold text-slate-900 tabular-nums">{row.curr}</td>
                  <td className="px-5 py-3 text-[13px] text-slate-400 tabular-nums">{row.prev}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[12px] font-bold ${row.up ? "text-emerald-600" : "text-rose-500"}`}>{row.var}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                      row.status === "Excelente" ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                      row.status === "Bueno"     ? "bg-violet-50 border-violet-100 text-violet-700" :
                                                   "bg-amber-50 border-amber-100 text-amber-700"
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnimateItem>

    </PageEnter>
  );
}