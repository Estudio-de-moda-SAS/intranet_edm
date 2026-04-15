/**
 * @module CommercialDashboard
 * Dashboard analítico del canal Comercial dentro del módulo de Retail.
 *
 * @remarks
 * Este componente renderiza una vista analítica integral del desempeño
 * comercial, combinando indicadores históricos, rendimiento por categoría,
 * desempeño por tienda, actividad reciente y una tabla resumen de KPIs.
 *
 * El dashboard se organiza en cuatro bloques principales:
 * - ventas vs meta y evolución de clientes
 * - ventas por categoría y embudo de conversión
 * - desempeño por tienda y actividad reciente
 * - resumen comercial comparativo contra el mes anterior
 *
 * Además, incorpora:
 * - gráficos responsivos con Recharts
 * - animaciones de entrada con Framer Motion
 * - secciones reutilizables con encabezado consistente
 * - lectura ejecutiva y operativa del canal comercial
 *
 * La información mostrada es estática y funciona como mock de interfaz.
 * En una implementación productiva, estos datos podrían provenir de:
 * - CRM comercial
 * - ERP o sistema de facturación
 * - plataformas de analítica de ventas
 * - tableros de clientes y NPS
 * - servicios de seguimiento de tiendas y cuentas
 */

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

/**
 * Dataset de ventas mensuales, meta y clientes activos.
 *
 * @remarks
 * Este arreglo representa la evolución mensual del desempeño comercial,
 * integrando tres señales clave:
 * - ventas totales
 * - meta mensual
 * - clientes activos
 *
 * Se utiliza en el gráfico compuesto principal del dashboard.
 */
const MONTHLY_SALES = [
  { mes: "Ene", ventas: 285000, meta: 320000, clientes: 1190 },
  { mes: "Feb", ventas: 302000, meta: 320000, clientes: 1200 },
  { mes: "Mar", ventas: 318000, meta: 340000, clientes: 1212 },
  { mes: "Abr", ventas: 295000, meta: 340000, clientes: 1218 },
  { mes: "May", ventas: 332000, meta: 360000, clientes: 1228 },
  { mes: "Jun", ventas: 348000, meta: 400000, clientes: 1240 },
];

/**
 * Dataset de ventas por categoría de producto.
 *
 * @remarks
 * Este arreglo resume el desempeño comercial por categoría,
 * integrando:
 * - valor vendido
 * - unidades comercializadas
 *
 * Se utiliza para visualizar la contribución relativa
 * de cada categoría durante el período.
 */
const PRODUCT_SALES = [
  { categoria: "Camisas",    ventas: 92000, unidades: 1840 },
  { categoria: "Pantalones", ventas: 78000, unidades: 1300 },
  { categoria: "Vestidos",   ventas: 64000, unidades: 960  },
  { categoria: "Accesorios", ventas: 48000, unidades: 3200 },
  { categoria: "Outerwear",  ventas: 38000, unidades: 380  },
  { categoria: "Denim",      ventas: 28000, unidades: 560  },
];

/**
 * Dataset de desempeño por tienda.
 *
 * @remarks
 * Este arreglo compara el rendimiento comercial de distintas tiendas,
 * incorporando:
 * - ventas acumuladas
 * - meta asignada
 * - nivel de satisfacción del cliente
 *
 * Se utiliza en el bloque de desempeño por tienda.
 */
const STORE_PERFORMANCE = [
  { tienda: "Andino",    ventas: 68000, meta: 70000, satisfaccion: 88 },
  { tienda: "Unicentro", ventas: 54000, meta: 50000, satisfaccion: 91 },
  { tienda: "El Retiro", ventas: 48000, meta: 50000, satisfaccion: 85 },
  { tienda: "Santa Fé",  ventas: 42000, meta: 45000, satisfaccion: 79 },
  { tienda: "Hayuelos",  ventas: 38000, meta: 40000, satisfaccion: 82 },
];

/**
 * Dataset del embudo de conversión comercial.
 *
 * @remarks
 * Este arreglo modela el flujo de conversión desde la parte superior
 * del embudo hasta el cierre efectivo.
 *
 * Permite visualizar cuántos registros avanzan entre etapas como:
 * - visitas
 * - interesados
 * - cotizaciones
 * - negociación
 * - cerrados
 */
const CONVERSION_FUNNEL = [
  { etapa: "Visitas web",  valor: 48000 },
  { etapa: "Interesados",  valor: 12400 },
  { etapa: "Cotizaciones", valor: 4200  },
  { etapa: "Negociación",  valor: 1800  },
  { etapa: "Cerrados",     valor: 610   },
];

/**
 * Dataset de actividad reciente del canal comercial.
 *
 * @remarks
 * Este arreglo contiene eventos operativos y comerciales recientes,
 * como cierres, propuestas, despachos y alertas de seguimiento.
 *
 * Se utiliza en el bloque de actividad reciente para dar contexto
 * inmediato al estado del negocio.
 */
const RECENT_ACTIVITY = [
  { label: "Cierre: Grupo Éxito — $48,000",        time: "Hace 30m", type: "ok"      },
  { label: "Nueva propuesta enviada a Tennis S.A.", time: "Hace 1h",  type: "info"    },
  { label: "Pedido OC-2024-0841 despachado",        time: "Hace 2h",  type: "ok"      },
  { label: "Alerta: 3 clientes sin actividad 30d",  time: "Hace 3h",  type: "warning" },
  { label: "Meta semanal alcanzada — equipo norte", time: "Ayer",     type: "ok"      },
  { label: "Cotización vencida — Punto Blanco",     time: "Ayer",     type: "warning" },
];

/**
 * Mapa de colores para el indicador visual de actividad reciente.
 *
 * @remarks
 * Asocia cada tipo de actividad con el color del punto
 * mostrado en el feed lateral.
 */
const ACTIVITY_DOT: Record<string, string> = {
  ok: "bg-emerald-400",
  warning: "bg-amber-400",
  info: "bg-sky-400",
};

// ── Helpers ───────────────────────────────────────────────────────

/**
 * Estilo base reutilizado para tooltips de Recharts.
 *
 * @remarks
 * Centraliza la apariencia visual de los tooltips
 * utilizados en los gráficos del dashboard.
 */
const TOOLTIP_STYLE = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  fontSize: "12px",
  color: "#1e293b",
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
};

/**
 * Encabezado visual reutilizable para secciones del dashboard.
 *
 * @param props Propiedades del componente.
 * @param props.icon Ícono representativo de la sección.
 * @param props.label Título principal de la sección.
 * @param props.sub Subtítulo opcional descriptivo.
 * @returns Un bloque de encabezado visual para secciones analíticas.
 *
 * @remarks
 * Este subcomponente mantiene consistencia en la presentación
 * de secciones del dashboard, unificando:
 * - iconografía
 * - títulos
 * - subtítulos
 * - línea divisoria visual
 */
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

/**
 * Dashboard analítico del canal Comercial.
 *
 * @returns Un conjunto de visualizaciones y resúmenes del desempeño comercial.
 *
 * @remarks
 * Este componente presenta una vista analítica integral del canal comercial,
 * organizada en cuatro grandes bloques:
 *
 * 1. **Ventas vs Meta**
 *    - compara ventas mensuales frente a meta
 *    - añade evolución de clientes activos
 *
 * 2. **Categorías y embudo**
 *    - muestra desempeño por categoría
 *    - visualiza la caída progresiva del embudo de conversión
 *
 * 3. **Tiendas y actividad**
 *    - compara rendimiento por tienda frente a meta
 *    - complementa con un feed de actividad reciente
 *
 * 4. **Resumen de KPIs**
 *    - compara indicadores clave contra el mes anterior
 *    - clasifica el estado de cada métrica
 *
 * Este dashboard es útil para:
 * - seguimiento ejecutivo de ventas
 * - análisis de categorías y conversión
 * - monitoreo de desempeño por tienda
 * - lectura resumida del estado comercial del negocio
 *
 * @example
 * ```tsx
 * <CommercialDashboard />
 * ```
 */
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
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="ventas"
                  name="Ventas"
                  stroke="#10b981"
                  fill="url(#ventasGrad)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="meta"
                  name="Meta"
                  stroke="#cbd5e1"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="clientes"
                  name="Clientes"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
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
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                      type="category"
                      dataKey="categoria"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      width={80}
                    />
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
                  /**
                   * Primer valor del embudo, usado como base para calcular
                   * el peso relativo de cada etapa frente al volumen inicial.
                   */
                  const first = CONVERSION_FUNNEL[0];

                  /**
                   * Etapa inmediatamente anterior, usada para calcular
                   * la tasa de conversión entre pasos consecutivos.
                   */
                  const prev  = CONVERSION_FUNNEL[i - 1];

                  /**
                   * Porcentaje relativo de la etapa actual frente al inicio del embudo.
                   */
                  const pct = first ? Math.round((item.valor / first.valor) * 100) : 0;

                  /**
                   * Tasa de conversión entre la etapa anterior y la actual.
                   *
                   * @remarks
                   * La primera etapa se considera base y por eso recibe 100%.
                   */
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
                /**
                 * Porcentaje de cumplimiento de la tienda frente a su meta.
                 */
                const pct = Math.round((store.ventas / store.meta) * 100);

                /**
                 * Indica si la tienda alcanzó o superó la meta asignada.
                 */
                const onTrack = store.ventas >= store.meta;

                return (
                  <div key={store.tienda}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] font-medium text-slate-700">{store.tienda}</span>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-slate-400">
                          NPS: <span className="font-semibold text-slate-600">{store.satisfaccion}</span>
                        </span>
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
                  <th key={col} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { label: "Ventas totales",        curr: "$348k",  prev: "$332k",  var: "+4.8%",  up: true,  status: "Bueno"     },
                { label: "Ticket promedio",       curr: "$2,810", prev: "$2,640", var: "+6.4%",  up: true,  status: "Excelente" },
                { label: "Nuevos clientes",       curr: "28",     prev: "24",     var: "+16.7%", up: true,  status: "Excelente" },
                { label: "Tasa de cierre",        curr: "34%",    prev: "31%",    var: "+3pts",  up: true,  status: "Bueno"     },
                { label: "Clientes inactivos 30d", curr: "48",    prev: "41",     var: "+17%",   up: false, status: "Atención"  },
                { label: "NPS",                   curr: "72",     prev: "69",     var: "+3pts",  up: true,  status: "Excelente" },
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