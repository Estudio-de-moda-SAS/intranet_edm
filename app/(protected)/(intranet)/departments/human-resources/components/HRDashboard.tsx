/**
 * @module HRDashboard
 * Dashboard analítico del módulo de Recursos Humanos.
 *
 * @remarks
 * Este componente renderiza un panel visual con métricas y tendencias clave
 * del área de RRHH, incluyendo:
 * - Evolución del headcount
 * - Rotación comparada con la industria
 * - Engagement del personal
 * - Desempeño por departamento
 * - Actividad reciente
 * - Resumen tabular de personal por área
 *
 * Utiliza:
 * - `recharts` para visualización de datos
 * - `framer-motion` para animaciones
 * - componentes de transición como {@link PageEnter} y {@link AnimateItem}
 *
 * Actualmente trabaja con datos mock, pensados para prototipado o desarrollo.
 */

"use client";

import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import {
  Users,
  TrendingDown,
  UserCheck,
  Activity,
  BarChart2,
  Target,
} from "lucide-react";
import {
  PageEnter,
  AnimateItem,
} from "@/app/components/ui/PageTransition";

// ── Mock data ─────────────────────────────────────────────────────

/**
 * Tendencia de headcount en los últimos meses.
 *
 * @remarks
 * Incluye:
 * - Empleados activos
 * - Nuevos ingresos
 * - Salidas
 */
const HEADCOUNT_TREND = [
  { mes: "Ene", activos: 268, nuevos: 5, salidas: 3 },
  { mes: "Feb", activos: 270, nuevos: 4, salidas: 2 },
  { mes: "Mar", activos: 274, nuevos: 6, salidas: 2 },
  { mes: "Abr", activos: 276, nuevos: 3, salidas: 1 },
  { mes: "May", activos: 280, nuevos: 5, salidas: 1 },
  { mes: "Jun", activos: 284, nuevos: 6, salidas: 2 },
];

/**
 * Datos de rotación mensual comparados contra benchmark de industria.
 */
const TURNOVER = [
  { mes: "Ene", rotacion: 2.8, industria: 3.5 },
  { mes: "Feb", rotacion: 2.5, industria: 3.4 },
  { mes: "Mar", rotacion: 2.2, industria: 3.6 },
  { mes: "Abr", rotacion: 2.4, industria: 3.3 },
  { mes: "May", rotacion: 2.0, industria: 3.2 },
  { mes: "Jun", rotacion: 2.1, industria: 3.1 },
];

/**
 * Métricas de desempeño departamental.
 *
 * @remarks
 * Incluye:
 * - Desempeño
 * - Satisfacción
 * - Ausentismo
 */
const DEPT_PERFORMANCE = [
  { dept: "Ventas", desempeno: 88, satisfaccion: 82, ausentismo: 1.2 },
  { dept: "Operaciones", desempeno: 79, satisfaccion: 74, ausentismo: 2.1 },
  { dept: "TI", desempeno: 92, satisfaccion: 91, ausentismo: 0.8 },
  { dept: "Finanzas", desempeno: 85, satisfaccion: 80, ausentismo: 1.0 },
  { dept: "Marketing", desempeno: 83, satisfaccion: 85, ausentismo: 1.5 },
  { dept: "RRHH", desempeno: 90, satisfaccion: 88, ausentismo: 0.9 },
];

/**
 * Resultados de engagement por dimensión.
 */
const ENGAGEMENT_RADAR = [
  { area: "Clima laboral", score: 82 },
  { area: "Comunicación", score: 74 },
  { area: "Liderazgo", score: 78 },
  { area: "Crecimiento", score: 68 },
  { area: "Compensación", score: 71 },
  { area: "Reconocimiento", score: 65 },
];

/**
 * Actividad reciente relevante del área de RRHH.
 *
 * @remarks
 * Cada evento incluye:
 * - Descripción breve
 * - Tiempo relativo
 * - Tipo visual (`ok`, `warning`, `info`)
 */
const RECENT_ACTIVITY = [
  { label: "Onboarding completado — Laura M.", time: "Hace 1h", type: "ok" },
  { label: "Evaluación de desempeño — Ventas", time: "Hace 2h", type: "info" },
  { label: "3 solicitudes de vacaciones nuevas", time: "Hace 3h", type: "warning" },
  { label: "Nuevo candidato en etapa final", time: "Hace 5h", type: "ok" },
  { label: "Contrato vence — J. Herrera", time: "Ayer", type: "warning" },
  { label: "Nómina procesada correctamente", time: "Ayer", type: "ok" },
];

/**
 * Mapa de color para el indicador visual de eventos recientes.
 */
const EVENT_DOT: Record<string, string> = {
  ok: "bg-emerald-400",
  warning: "bg-amber-400",
  info: "bg-sky-400",
};

// ── Helpers ───────────────────────────────────────────────────────

/**
 * Estilo base para los tooltips de gráficos.
 *
 * @remarks
 * Se reutiliza en todos los charts para mantener consistencia visual.
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
 * Props del componente {@link SectionHeading}.
 *
 * @property icon Ícono representativo de la sección.
 * @property label Título principal.
 * @property sub Texto secundario opcional.
 */
type SectionHeadingProps = {
  icon: React.ElementType;
  label: string;
  sub?: string;
};

/**
 * Encabezado reutilizable para secciones del dashboard.
 *
 * @param props Propiedades del encabezado.
 * @returns Encabezado con ícono, título, subtítulo opcional y divisor.
 *
 * @remarks
 * Se utiliza para mantener uniformidad visual entre todas las secciones.
 */
function SectionHeading({ icon: Icon, label, sub }: SectionHeadingProps) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
        <Icon className="h-3.5 w-3.5 text-violet-600" />
      </span>
      <div>
        <h2 className="text-sm font-semibold text-slate-800 leading-none">
          {label}
        </h2>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <div className="flex-1 h-px bg-slate-100 ml-2" />
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────

/**
 * Dashboard principal de analítica de RRHH.
 *
 * @returns Panel con gráficas, métricas y resumen tabular del área.
 *
 * @remarks
 * El dashboard está organizado en cuatro bloques principales:
 * 1. Evolución del headcount
 * 2. Rotación vs industria + radar de engagement
 * 3. Desempeño por departamento + actividad reciente
 * 4. Tabla resumen por departamento
 *
 * Características:
 * - Entrada animada por secciones
 * - Visualización responsive
 * - Uso combinado de charts de área, línea, radar y barras
 * - Resumen visual y tabular complementario
 *
 * @example
 * ```tsx
 * <HRDashboard />
 * ```
 */
export default function HRDashboard() {
  return (
    <PageEnter className="space-y-10">
      {/* ── 1. Headcount trend ─────────────────────────────────── */}
      <AnimateItem>
        <SectionHeading
          icon={Users}
          label="Evolución de Headcount"
          sub="Empleados activos, ingresos y salidas — últimos 6 meses"
        />

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HEADCOUNT_TREND}>
                <defs>
                  <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  domain={["auto", "auto"]}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                />

                <Area
                  type="monotone"
                  dataKey="activos"
                  name="Activos"
                  stroke="#8b5cf6"
                  fill="url(#actGrad)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
                <Bar
                  dataKey="nuevos"
                  name="Ingresos"
                  fill="#10b981"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="salidas"
                  name="Salidas"
                  fill="#fca5a5"
                  radius={[3, 3, 0, 0]}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </AnimateItem>

      {/* ── 2. Turnover + Engagement radar ────────────────────── */}
      <AnimateItem>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Turnover vs industry — 3 cols */}
          <div className="lg:col-span-3">
            <SectionHeading
              icon={TrendingDown}
              label="Rotación vs. Industria"
              sub="% mensual"
            />

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={TURNOVER}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="mes"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v}%`}
                      domain={[0, 5]}
                    />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(v) => [`${Number(v)}%`, ""]}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                    />

                    <Line
                      type="monotone"
                      dataKey="rotacion"
                      name="EDM"
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="industria"
                      name="Industria"
                      stroke="#cbd5e1"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Engagement radar — 2 cols */}
          <div className="lg:col-span-2">
            <SectionHeading
              icon={Target}
              label="Engagement"
              sub="Encuesta trimestral"
            />

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={ENGAGEMENT_RADAR}>
                    <PolarGrid stroke="#f1f5f9" />
                    <PolarAngleAxis
                      dataKey="area"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                    />
                    <Radar
                      name="Engagement"
                      dataKey="score"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(v) => [`${Number(v)}/100`, ""]}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </AnimateItem>

      {/* ── 3. Dept performance + Activity ────────────────────── */}
      <AnimateItem>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Department performance bars */}
          <div>
            <SectionHeading
              icon={BarChart2}
              label="Desempeño por Departamento"
            />

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              {DEPT_PERFORMANCE.map((dept, i) => (
                <div key={dept.dept}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] font-medium text-slate-700">
                      {dept.dept}
                    </span>

                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-slate-400">
                        Satisfacción:{" "}
                        <span className="font-semibold text-slate-600">
                          {dept.satisfaccion}%
                        </span>
                      </span>
                      <span className="font-bold text-violet-600">
                        {dept.desempeno}%
                      </span>
                    </div>
                  </div>

                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${dept.desempeno}%` }}
                      transition={{
                        duration: 0.8,
                        delay: i * 0.08,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent HR activity */}
          <div>
            <SectionHeading icon={Activity} label="Actividad Reciente" />

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <ul className="divide-y divide-slate-50">
                {RECENT_ACTIVITY.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors"
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${EVENT_DOT[item.type]}`}
                    />
                    <span className="flex-1 text-[13px] text-slate-700 leading-snug">
                      {item.label}
                    </span>
                    <span className="shrink-0 text-[11px] text-slate-400">
                      {item.time}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </AnimateItem>

      {/* ── 4. Dept detail table ───────────────────────────────── */}
      <AnimateItem>
        <SectionHeading
          icon={UserCheck}
          label="Resumen de Personal por Departamento"
        />

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {[
                  "Departamento",
                  "Activos",
                  "Desempeño",
                  "Satisfacción",
                  "Ausentismo",
                  "Estado",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-400"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {DEPT_PERFORMANCE.map((dept, i) => {
                const isHealthy =
                  dept.desempeno >= 85 && dept.satisfaccion >= 80;
                const isWarning =
                  dept.desempeno < 80 || dept.ausentismo > 1.8;

                return (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-5 py-3 text-[13px] font-semibold text-slate-800">
                      {dept.dept}
                    </td>
                    <td className="px-5 py-3 text-[13px] tabular-nums text-slate-600">
                      —
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-violet-500"
                            style={{ width: `${dept.desempeno}%` }}
                          />
                        </div>
                        <span className="text-[12px] font-semibold text-slate-700 tabular-nums">
                          {dept.desempeno}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[13px] font-medium tabular-nums text-slate-600">
                      {dept.satisfaccion}%
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-[13px] font-semibold tabular-nums ${
                          dept.ausentismo > 1.8
                            ? "text-rose-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {dept.ausentismo}%
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                          isHealthy
                            ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                            : isWarning
                              ? "bg-amber-50 border-amber-100 text-amber-700"
                              : "bg-violet-50 border-violet-100 text-violet-700"
                        }`}
                      >
                        {isHealthy
                          ? "Saludable"
                          : isWarning
                            ? "Atención"
                            : "Normal"}
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