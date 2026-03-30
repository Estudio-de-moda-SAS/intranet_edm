"use client";

import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip,
  CartesianGrid, XAxis, YAxis, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Receipt, CreditCard,
  BarChart2, PieChart as PieIcon, Activity,
} from "lucide-react";
import { PageEnter, AnimateItem } from "@/app/components/ui/PageTransition";

// ── Mock data (replace with real API data) ────────────────────────

const MONTHLY_REVENUE = [
  { mes: "Ene", ingresos: 98000,  gastos: 72000,  ganancia: 26000 },
  { mes: "Feb", ingresos: 105000, gastos: 78000,  ganancia: 27000 },
  { mes: "Mar", ingresos: 112000, gastos: 81000,  ganancia: 31000 },
  { mes: "Abr", ingresos: 108000, gastos: 76000,  ganancia: 32000 },
  { mes: "May", ingresos: 115000, gastos: 82000,  ganancia: 33000 },
  { mes: "Jun", ingresos: 120000, gastos: 80000,  ganancia: 40000 },
];

const BUDGET_EXECUTION = [
  { dept: "Ventas",      asignado: 40000, ejecutado: 38500 },
  { dept: "Operaciones", asignado: 55000, ejecutado: 52000 },
  { dept: "RRHH",        asignado: 28000, ejecutado: 22000 },
  { dept: "TI",          asignado: 32000, ejecutado: 31800 },
  { dept: "Mktg",        asignado: 25000, ejecutado: 28500 },
];

const EXPENSE_CATEGORIES = [
  { name: "Nómina",       value: 45, color: "#8b5cf6" },
  { name: "Operaciones",  value: 22, color: "#6366f1" },
  { name: "Marketing",    value: 14, color: "#a78bfa" },
  { name: "TI",           value: 11, color: "#c4b5fd" },
  { name: "Otros",        value: 8,  color: "#ddd6fe"  },
];

const CASH_FLOW = [
  { mes: "Ene", entradas: 102000, salidas: 74000 },
  { mes: "Feb", entradas: 109000, salidas: 79000 },
  { mes: "Mar", entradas: 118000, salidas: 83000 },
  { mes: "Abr", entradas: 111000, salidas: 77000 },
  { mes: "May", entradas: 119000, salidas: 84000 },
  { mes: "Jun", entradas: 125000, salidas: 81000 },
];

const TRANSACTIONS = [
  { desc: "Pago proveedor Textiles S.A.",   amount: -8400,  date: "Hoy, 10:22",     type: "out", status: "completed" },
  { desc: "Cobro factura #F-2024-0412",     amount: +15200, date: "Hoy, 09:15",     type: "in",  status: "completed" },
  { desc: "Nómina quincena junio",          amount: -22500, date: "Ayer, 18:00",    type: "out", status: "completed" },
  { desc: "Anticipo cliente corporativo",   amount: +9800,  date: "Ayer, 14:30",    type: "in",  status: "pending"   },
  { desc: "Servicios TI — mantenimiento",   amount: -1200,  date: "Hace 2 días",    type: "out", status: "completed" },
  { desc: "Devolución IVA Q1",              amount: +4320,  date: "Hace 3 días",    type: "in",  status: "pending"   },
];

const RECEIVABLES = [
  { client: "Almacenes Éxito",    amount: 12400, days: 8,  status: "current"  },
  { client: "Falabella Colombia", amount: 8600,  days: 22, status: "current"  },
  { client: "Arturo Calle",       amount: 5200,  days: 38, status: "overdue"  },
  { client: "Studio F",           amount: 3800,  days: 55, status: "critical" },
];

// ── Helpers ───────────────────────────────────────────────────────

function SectionHeading({ icon: Icon, label, sub }: { icon: React.ElementType; label: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
        <Icon className="h-3.5 w-3.5 text-violet-600" />
      </span>
      <div>
        <h2 className="text-sm font-semibold text-slate-800 leading-none">{label}</h2>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <div className="flex-1 h-px bg-slate-100 ml-2" />
    </div>
  );
}

const TOOLTIP_STYLE = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  fontSize: "12px",
  color: "#1e293b",
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
};

// ── Component ─────────────────────────────────────────────────────

export default function FinanceDashboard() {
  const totalReceivable = RECEIVABLES.reduce((s, r) => s + r.amount, 0);
  const overdueCount    = RECEIVABLES.filter((r) => r.status !== "current").length;

  return (
    <PageEnter className="space-y-10">

      {/* ── 1. Ingresos vs Gastos (Area chart) ─────────────────── */}
      <AnimateItem>
        <SectionHeading icon={BarChart2} label="Ingresos vs Gastos vs Ganancia" sub="Últimos 6 meses" />
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_REVENUE}>
                <defs>
                  <linearGradient id="ingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gasGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ganGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={52}
                  tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`$${Number(v).toLocaleString()}`, ""]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Area type="monotone" dataKey="ingresos"  name="Ingresos"  stroke="#8b5cf6" fill="url(#ingGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="gastos"    name="Gastos"    stroke="#f59e0b" fill="url(#gasGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="ganancia"  name="Ganancia"  stroke="#10b981" fill="url(#ganGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </AnimateItem>

      {/* ── 2. Flujo de caja + Distribución gastos ─────────────── */}
      <AnimateItem>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Cash flow — 3 cols */}
          <div className="lg:col-span-3">
            <SectionHeading icon={Activity} label="Flujo de Caja" sub="Entradas vs salidas mensuales" />
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CASH_FLOW} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={52}
                      tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`$${Number(v).toLocaleString()}`, ""]} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                    <Bar dataKey="entradas" name="Entradas" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="salidas"  name="Salidas"  fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={1} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Expense distribution — 2 cols */}
          <div className="lg:col-span-2">
            <SectionHeading icon={PieIcon} label="Distribución de Gastos" />
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-44 w-44 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={EXPENSE_CATEGORIES} cx="50%" cy="50%" innerRadius={42} outerRadius={68}
                        dataKey="value" paddingAngle={3} strokeWidth={0}>
                        {EXPENSE_CATEGORIES.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${Number(v)}%`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <li key={cat.name} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: cat.color }} />
                        <span className="text-[12px] text-slate-600">{cat.name}</span>
                      </div>
                      <span className="text-[12px] font-semibold text-slate-800">{cat.value}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

        </div>
      </AnimateItem>

      {/* ── 3. Ejecución presupuestal ──────────────────────────── */}
      <AnimateItem>
        <SectionHeading icon={BarChart2} label="Ejecución Presupuestal por Departamento" sub="Asignado vs ejecutado — junio 2024" />
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="space-y-4">
            {BUDGET_EXECUTION.map((dept, i) => {
              const pct = Math.round((dept.ejecutado / dept.asignado) * 100);
              const over = pct > 100;
              return (
                <div key={dept.dept}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] font-medium text-slate-700">{dept.dept}</span>
                    <div className="flex items-center gap-3 text-[12px]">
                      <span className="text-slate-400">${(dept.asignado/1000).toFixed(0)}k asignado</span>
                      <span className={`font-semibold tabular-nums ${over ? "text-rose-600" : "text-emerald-600"}`}>
                        {over ? <ArrowUpRight className="inline h-3 w-3" /> : null}{pct}%
                      </span>
                    </div>
                  </div>
                  <div className="relative h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${over ? "bg-gradient-to-r from-rose-500 to-rose-400" : "bg-gradient-to-r from-violet-500 to-violet-400"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(pct, 100)}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                    />
                    <div className="absolute right-0 top-0 h-full w-px bg-slate-300" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AnimateItem>

      {/* ── 4. Transacciones recientes + Cuentas por cobrar ────── */}
      <AnimateItem>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Transactions */}
          <div>
            <SectionHeading icon={CreditCard} label="Transacciones Recientes" />
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <ul className="divide-y divide-slate-50">
                {TRANSACTIONS.map((tx, i) => (
                  <li key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                      tx.type === "in" ? "bg-emerald-50" : "bg-rose-50"
                    }`}>
                      {tx.type === "in"
                        ? <ArrowDownRight className="h-4 w-4 text-emerald-600" />
                        : <ArrowUpRight className="h-4 w-4 text-rose-500" />
                      }
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-slate-700 truncate">{tx.desc}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-400">{tx.date}</span>
                        {tx.status === "pending" && (
                          <span className="rounded-full bg-amber-50 border border-amber-100 px-1.5 py-px text-[9px] font-semibold text-amber-600">
                            Pendiente
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`shrink-0 text-[13px] font-bold tabular-nums ${
                      tx.amount > 0 ? "text-emerald-600" : "text-slate-700"
                    }`}>
                      {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Accounts receivable aging */}
          <div>
            <SectionHeading icon={Receipt} label="Cuentas por Cobrar" sub={`$${(totalReceivable/1000).toFixed(0)}k total · ${overdueCount} vencidas`} />
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

              {/* Summary chips */}
              <div className="flex gap-3 px-5 py-4 border-b border-slate-100">
                {[
                  { label: "Al día",    count: RECEIVABLES.filter(r => r.status === "current").length,  color: "bg-emerald-50 border-emerald-100 text-emerald-700" },
                  { label: "Vencidas",  count: RECEIVABLES.filter(r => r.status === "overdue").length,  color: "bg-amber-50 border-amber-100 text-amber-700"   },
                  { label: "Críticas",  count: RECEIVABLES.filter(r => r.status === "critical").length, color: "bg-rose-50 border-rose-100 text-rose-700"     },
                ].map((chip) => (
                  <span key={chip.label} className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${chip.color}`}>
                    {chip.count} {chip.label}
                  </span>
                ))}
              </div>

              <ul className="divide-y divide-slate-50">
                {RECEIVABLES.map((rec, i) => {
                  const cfg =
                    rec.status === "critical" ? { dot: "bg-rose-400",   text: "text-rose-600",   badge: "bg-rose-50 border-rose-100",     label: "Crítico"  } :
                    rec.status === "overdue"  ? { dot: "bg-amber-400",  text: "text-amber-600",  badge: "bg-amber-50 border-amber-100",   label: "Vencida"  } :
                                                { dot: "bg-emerald-400", text: "text-emerald-600",badge: "bg-emerald-50 border-emerald-100",label: "Al día"  };
                  return (
                    <li key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-slate-700 truncate">{rec.client}</p>
                        <p className="text-[11px] text-slate-400">{rec.days} días</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[13px] font-bold tabular-nums ${cfg.text}`}>
                          ${rec.amount.toLocaleString()}
                        </span>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cfg.badge} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

        </div>
      </AnimateItem>

      {/* ── 5. P&L mensual resumen ─────────────────────────────── */}
      <AnimateItem>
        <SectionHeading icon={TrendingUp} label="Resumen P&L — Junio 2024" sub="Estado de resultados simplificado" />
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-400">Concepto</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-slate-400">Mes actual</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-slate-400">Mes anterior</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-slate-400">Variación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { label: "Ingresos totales",    curr: 120000, prev: 115000, positive: true  },
                { label: "Costo de ventas",      curr: -48000, prev: -46000, positive: false },
                { label: "Utilidad bruta",       curr: 72000,  prev: 69000,  positive: true, bold: true },
                { label: "Gastos operacionales", curr: -32000, prev: -31000, positive: false },
                { label: "EBITDA",               curr: 40000,  prev: 38000,  positive: true, bold: true },
                { label: "Depreciación",         curr: -2400,  prev: -2400,  positive: false },
                { label: "Utilidad neta",        curr: 37600,  prev: 35600,  positive: true, bold: true, highlight: true },
              ].map((row, i) => {
                const diff = row.curr - row.prev;
                const pct  = Math.abs(Math.round((diff / Math.abs(row.prev)) * 100));
                return (
                  <tr key={i} className={`hover:bg-slate-50/50 transition-colors ${row.highlight ? "bg-violet-50/30" : ""}`}>
                    <td className={`px-5 py-3 text-[13px] ${row.bold ? "font-semibold text-slate-800" : "text-slate-600"}`}>
                      {row.label}
                    </td>
                    <td className={`px-5 py-3 text-right tabular-nums text-[13px] ${row.bold ? "font-bold" : "font-medium"} ${row.curr < 0 ? "text-rose-600" : "text-slate-800"}`}>
                      {row.curr < 0 ? "-" : ""}${Math.abs(row.curr).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-[13px] text-slate-400">
                      {row.prev < 0 ? "-" : ""}${Math.abs(row.prev).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${diff >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                        {diff >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AnimateItem>

    </PageEnter>
  );
}