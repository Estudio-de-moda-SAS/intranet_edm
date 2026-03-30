"use client";

import { motion } from "framer-motion";
import {
  AreaChart, Area, Bar, LineChart, Line,
  ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis, Legend,
} from "recharts";
import {
  TrendingUp, BarChart2, Users, ShoppingCart,
  Globe, Activity, CreditCard,
} from "lucide-react";
import { PageEnter, AnimateItem } from "@/app/components/ui/PageTransition";

// ── Mock data ─────────────────────────────────────────────────────

const DAILY_GMV = [
  { dia: "L",   gmv: 2100, pedidos: 58,  visitors: 1420 },
  { dia: "M",   gmv: 2840, pedidos: 74,  visitors: 1680 },
  { dia: "X",   gmv: 3200, pedidos: 88,  visitors: 1920 },
  { dia: "J",   gmv: 2650, pedidos: 71,  visitors: 1580 },
  { dia: "V",   gmv: 4100, pedidos: 112, visitors: 2340 },
  { dia: "S",   gmv: 5200, pedidos: 142, visitors: 2980 },
  { dia: "D",   gmv: 3800, pedidos: 98,  visitors: 2210 },
];

const MONTHLY_TREND = [
  { mes: "Ene", gmv: 48000, pedidos: 1280, conversion: 3.1 },
  { mes: "Feb", gmv: 52000, pedidos: 1380, conversion: 3.2 },
  { mes: "Mar", gmv: 55000, pedidos: 1460, conversion: 3.4 },
  { mes: "Abr", gmv: 51000, pedidos: 1340, conversion: 3.3 },
  { mes: "May", gmv: 62000, pedidos: 1640, conversion: 3.6 },
  { mes: "Jun", gmv: 69000, pedidos: 1842, conversion: 3.8 },
];

const TRAFFIC_SOURCES = [
  { fuente: "Orgánico",   visitas: 18400, pct: 38, color: "#6366f1" },
  { fuente: "Redes soc.", visitas: 12200, pct: 25, color: "#8b5cf6" },
  { fuente: "Email",      visitas: 8600,  pct: 18, color: "#a78bfa" },
  { fuente: "Paid",       visitas: 6800,  pct: 14, color: "#c4b5fd" },
  { fuente: "Directo",    visitas: 2200,  pct: 5,  color: "#ddd6fe" },
];

const DEVICE_BREAKDOWN = [
  { device: "Mobile",  sessions: 28400, conv: 3.2 },
  { device: "Desktop", sessions: 14200, conv: 4.8 },
  { device: "Tablet",  sessions: 5600,  conv: 3.9 },
];

const PAYMENT_METHODS = [
  { method: "Tarjeta crédito", pct: 44, color: "bg-indigo-500" },
  { method: "PSE",             pct: 28, color: "bg-violet-500" },
  { method: "Nequi / Daviplata",pct:18, color: "bg-purple-400" },
  { method: "Contra entrega",  pct: 10, color: "bg-slate-300"  },
];

const RECENT_ACTIVITY = [
  { label: "Nuevo pico de tráfico — 320 usuarios simultáneos", time: "Hace 12m",  type: "info"    },
  { label: "Pedido #48812 marcado como urgente",               time: "Hace 25m",  type: "warning" },
  { label: "Campaña email 'Rebajas Junio' desplegada",         time: "Hace 1h",   type: "ok"      },
  { label: "Pasarela de pago normalizada",                     time: "Hace 2h",   type: "ok"      },
  { label: "Stock repuesto: Vestido Floral Midi (+80 uds.)",   time: "Hace 3h",   type: "ok"      },
  { label: "Tasa de abandono supera 70% en móvil",             time: "Hace 4h",   type: "warning" },
];

const ACTIVITY_DOT: Record<string, string> = {
  ok: "bg-emerald-400", warning: "bg-amber-400", info: "bg-sky-400",
};

const TOOLTIP_STYLE = {
  background: "#fff", border: "1px solid #e2e8f0",
  borderRadius: "10px", fontSize: "12px", color: "#1e293b",
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
};

function SectionHeading({ icon: Icon, label, sub }: { icon: React.ElementType; label: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
        <Icon className="h-3.5 w-3.5 text-indigo-600" />
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

export default function EcommerceDashboard() {
  return (
    <PageEnter className="space-y-10">

      {/* ── 1. GMV diario esta semana ──────────────────────────── */}
      <AnimateItem>
        <SectionHeading icon={BarChart2} label="GMV y Pedidos — Esta Semana" sub="Ingresos diarios vs visitantes" />
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DAILY_GMV}>
                <defs>
                  <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#a78bfa" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Area  yAxisId="left"  type="monotone" dataKey="gmv"      name="GMV ($)"    stroke="#6366f1" fill="url(#gmvGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                <Area  yAxisId="right" type="monotone" dataKey="visitors" name="Visitantes" stroke="#a78bfa" fill="url(#visGrad)" strokeWidth={2}   dot={false} activeDot={{ r: 4 }} />
                <Bar   yAxisId="right" dataKey="pedidos" name="Pedidos" fill="#e0e7ff" radius={[3,3,0,0]} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </AnimateItem>

      {/* ── 2. Tendencia mensual + Conversión ─────────────────── */}
      <AnimateItem>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Monthly trend — 3 cols */}
          <div className="lg:col-span-3">
            <SectionHeading icon={TrendingUp} label="Tendencia Mensual" sub="GMV, pedidos y conversión — últimos 6 meses" />
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MONTHLY_TREND}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `${v}%`} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                    <Line yAxisId="left"  type="monotone" dataKey="gmv"        name="GMV"         stroke="#6366f1" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                    <Line yAxisId="right" type="monotone" dataKey="conversion" name="Conversión%" stroke="#10b981" strokeWidth={2} strokeDasharray="5 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Traffic sources — 2 cols */}
          <div className="lg:col-span-2">
            <SectionHeading icon={Globe} label="Fuentes de Tráfico" />
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="space-y-3">
                {TRAFFIC_SOURCES.map((src, i) => (
                  <div key={src.fuente}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: src.color }} />
                        <span className="text-[12px] font-medium text-slate-700">{src.fuente}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-slate-400">{src.visitas.toLocaleString()}</span>
                        <span className="font-bold text-slate-700">{src.pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: src.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${src.pct}%` }}
                        transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </AnimateItem>

      {/* ── 3. Dispositivos + Métodos de pago + Actividad ─────── */}
      <AnimateItem>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Devices */}
          <div>
            <SectionHeading icon={Users} label="Sesiones por Dispositivo" />
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              {DEVICE_BREAKDOWN.map((d, i) => (
                <div key={d.device} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-medium text-slate-700">{d.device}</span>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-slate-400">{d.sessions.toLocaleString()}</span>
                        <span className="font-semibold text-indigo-600">Conv. {d.conv}%</span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round(d.sessions / 48200 * 100)}%` }}
                        transition={{ duration: 0.7, delay: i * 0.1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Device conversion insight */}
              <div className="mt-2 rounded-lg bg-indigo-50 border border-indigo-100 p-3">
                <p className="text-[11px] text-indigo-700 leading-snug">
                  <span className="font-semibold">Desktop convierte 1.5× más</span> que mobile. Considera optimizar el checkout móvil.
                </p>
              </div>
            </div>
          </div>

          {/* Payment methods */}
          <div>
            <SectionHeading icon={CreditCard} label="Métodos de Pago" />
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3.5">
              {PAYMENT_METHODS.map((pm) => (
                <div key={pm.method}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-medium text-slate-700">{pm.method}</span>
                    <span className="text-[12px] font-bold text-slate-800">{pm.pct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full ${pm.color}`} style={{ width: `${pm.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div>
            <SectionHeading icon={Activity} label="Actividad Reciente" />
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <ul className="divide-y divide-slate-50">
                {RECENT_ACTIVITY.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50/50 transition-colors">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${ACTIVITY_DOT[item.type]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-slate-700 leading-snug">{item.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </AnimateItem>

      {/* ── 4. KPI summary table ──────────────────────────────── */}
      <AnimateItem>
        <SectionHeading icon={ShoppingCart} label="Resumen de Indicadores — Junio 2024" sub="vs mes anterior" />
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Indicador", "Actual", "Mes anterior", "Variación", "Estado"].map((col) => (
                  <th key={col} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-400">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { label: "GMV",                    curr: "$69k",   prev: "$62k",   var: "+11.3%", up: true,  status: "Excelente" },
                { label: "Tasa de conversión",      curr: "3.8%",   prev: "3.4%",   var: "+0.4pts",up: true,  status: "Bueno"     },
                { label: "Ticket promedio",          curr: "$37.5",  prev: "$35.4",  var: "+5.9%",  up: true,  status: "Bueno"     },
                { label: "Tasa de abandono carrito", curr: "68%",    prev: "71%",    var: "-3pts",  up: true,  status: "Mejorando" },
                { label: "Pedidos devueltos",        curr: "4.2%",   prev: "3.8%",   var: "+0.4pts",up: false, status: "Atención"  },
                { label: "Calificación tienda",      curr: "4.7★",   prev: "4.6★",   var: "+0.1",   up: true,  status: "Excelente" },
                { label: "Visitantes únicos",        curr: "48.2k",  prev: "43.4k",  var: "+11.1%", up: true,  status: "Excelente" },
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
                      row.status === "Mejorando" ? "bg-sky-50 border-sky-100 text-sky-700" :
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