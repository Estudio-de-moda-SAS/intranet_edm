/**
 * @module ITDashboardSection
 * Panel principal de operaciones del área de TI.
 *
 * @remarks
 * Este componente renderiza una sección de dashboard con navegación por pestañas
 * para visualizar distintos aspectos operativos del entorno de TI.
 *
 * Incluye tres vistas principales:
 * - Disponibilidad: uptime, latencia y errores
 * - Tickets: volumen, categorías y cumplimiento SLA
 * - Infraestructura: estado de recursos y servidores
 *
 * Cada pestaña presenta gráficos y métricas resumidas orientadas
 * a monitoreo y toma de decisiones rápidas.
 */

// app/it/components/ITDashboardSection.tsx
"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Server, Shield, Wifi, HardDrive } from "lucide-react";

// ── Data ─────────────────────────────────────────────────────────────────────

/**
 * Datos de disponibilidad, latencia y errores por franja horaria.
 *
 * @remarks
 * Se utilizan en la pestaña de disponibilidad para representar
 * el comportamiento de los sistemas durante las últimas 24 horas.
 */
const uptimeData = [
  { hora: "00:00", uptime: 100, latencia: 12, errores: 0 },
  { hora: "02:00", uptime: 100, latencia: 10, errores: 0 },
  { hora: "04:00", uptime: 99.8, latencia: 11, errores: 1 },
  { hora: "06:00", uptime: 100, latencia: 14, errores: 0 },
  { hora: "08:00", uptime: 98.2, latencia: 32, errores: 14 },
  { hora: "10:00", uptime: 99.5, latencia: 28, errores: 5 },
  { hora: "12:00", uptime: 100, latencia: 18, errores: 2 },
  { hora: "14:00", uptime: 100, latencia: 16, errores: 1 },
  { hora: "16:00", uptime: 99.1, latencia: 24, errores: 7 },
  { hora: "18:00", uptime: 100, latencia: 13, errores: 0 },
  { hora: "20:00", uptime: 100, latencia: 11, errores: 0 },
  { hora: "22:00", uptime: 100, latencia: 10, errores: 0 },
];

/**
 * Tendencia semanal del flujo de tickets.
 *
 * @remarks
 * Representa tickets abiertos, cerrados y escalados
 * durante las últimas semanas.
 */
const ticketsTrend = [
  { semana: "S1 Ene", abiertos: 68, cerrados: 61, escalados: 7 },
  { semana: "S2 Ene", abiertos: 74, cerrados: 70, escalados: 4 },
  { semana: "S3 Ene", abiertos: 55, cerrados: 58, escalados: 3 },
  { semana: "S4 Ene", abiertos: 62, cerrados: 60, escalados: 5 },
  { semana: "S1 Feb", abiertos: 71, cerrados: 65, escalados: 6 },
  { semana: "S2 Feb", abiertos: 58, cerrados: 62, escalados: 2 },
  { semana: "S3 Feb", abiertos: 47, cerrados: 51, escalados: 3 },
];

/**
 * Distribución de tickets por categoría.
 *
 * @remarks
 * Se utiliza para construir el gráfico circular dentro
 * de la pestaña de tickets.
 */
const ticketsByCategory = [
  { name: "Conectividad", value: 28, color: "#6366f1" },
  { name: "Hardware", value: 19, color: "#38bdf8" },
  { name: "Software/Apps", value: 31, color: "#10b981" },
  { name: "Accesos", value: 14, color: "#f59e0b" },
  { name: "Otros", value: 8, color: "#94a3b8" },
];

/**
 * Histórico mensual de cumplimiento de SLA.
 *
 * @remarks
 * Se representa como una línea de tendencia en la pestaña de tickets.
 */
const slaData = [
  { mes: "Oct", cumplimiento: 93.1 },
  { mes: "Nov", cumplimiento: 94.8 },
  { mes: "Dic", cumplimiento: 91.2 },
  { mes: "Ene", cumplimiento: 95.5 },
  { mes: "Feb", cumplimiento: 96.3 },
  { mes: "Mar", cumplimiento: 97.1 },
];

/**
 * Resumen de servidores monitoreados.
 *
 * @remarks
 * Se utiliza en la pestaña de infraestructura para mostrar
 * estado, CPU y RAM en formato tabular.
 */
const servers = [
  { id: "sv1", name: "SRV-APP-01", role: "Aplicaciones", status: "online", cpu: 42, ram: 67 },
  { id: "sv2", name: "SRV-DB-01", role: "Base de datos", status: "online", cpu: 78, ram: 82 },
  { id: "sv3", name: "SRV-FILE-01", role: "Archivos", status: "online", cpu: 23, ram: 45 },
  { id: "sv4", name: "SRV-BKUP-01", role: "Backups", status: "maintenance", cpu: 0, ram: 12 },
];

/**
 * Métricas resumidas de infraestructura.
 *
 * @remarks
 * Cada elemento representa una tarjeta compacta con icono,
 * porcentaje de cumplimiento y color contextual.
 */
const infraStats = [
  {
    icon: Server,
    label: "Servidores activos",
    value: "14 / 14",
    pct: 97,
    color: "from-indigo-500 to-indigo-600",
    textColor: "text-indigo-700",
  },
  {
    icon: Shield,
    label: "Endpoints protegidos",
    value: "284 / 291",
    pct: 98,
    color: "from-emerald-500 to-teal-500",
    textColor: "text-emerald-700",
  },
  {
    icon: Wifi,
    label: "APs en línea",
    value: "21 / 21",
    pct: 100,
    color: "from-sky-500 to-blue-500",
    textColor: "text-sky-700",
  },
  {
    icon: HardDrive,
    label: "Almacenamiento",
    value: "68% usado",
    pct: 68,
    color: "from-amber-500 to-orange-500",
    textColor: "text-amber-700",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Métricas destacadas de disponibilidad.
 *
 * @remarks
 * Se muestran como una franja superior de estadísticas
 * dentro de la pestaña de disponibilidad.
 */
const UPTIME_STATS = [
  { label: "Uptime promedio", value: "99.7%", good: true },
  { label: "Latencia promedio", value: "17 ms", good: true },
  { label: "Pico de errores", value: "14", good: false },
  { label: "Ventanas de caída", value: "2", good: false },
];

/**
 * Métricas destacadas de tickets.
 *
 * @remarks
 * Se muestran como una franja de resumen en la pestaña de tickets.
 */
const TICKET_STATS = [
  { label: "Total período", value: "435" },
  { label: "Tasa resolución", value: "89%" },
  { label: "MTTR promedio", value: "18 min" },
  { label: "SLA cumplido", value: "96.3%" },
];

/**
 * Determina el color de barra según el porcentaje de uso.
 *
 * @param v Valor porcentual a evaluar.
 * @returns Clase CSS para representar visualmente el nivel de uso.
 *
 * @remarks
 * Rangos:
 * - >= 80: alto
 * - >= 60: medio
 * - < 60: normal
 */
function cpuColor(v: number) {
  if (v >= 80) return "bg-red-500";
  if (v >= 60) return "bg-amber-400";
  return "bg-emerald-400";
}

// ── Tab content ───────────────────────────────────────────────────────────────

/**
 * Contenido de la pestaña de disponibilidad.
 *
 * @returns Vista con métricas de uptime, latencia y errores.
 *
 * @remarks
 * Esta pestaña integra:
 * - Resumen rápido de indicadores clave
 * - Gráfico de áreas para uptime y latencia
 * - Gráfico de línea para errores por hora
 */
function TabDisponibilidad() {
  return (
    <div className="space-y-5">
      {/* Mini stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {UPTIME_STATS.map((s) => (
          <div key={s.label} className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
            <p className="text-[10px] text-slate-400 font-medium">{s.label}</p>
            <p
              className={`text-lg font-extrabold leading-tight mt-0.5 ${
                s.good ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Uptime + latency area chart */}
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Uptime & Latencia — últimas 24 h
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={uptimeData} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="gUp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="gLat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="hora" tick={{ fontSize: 9, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10 }} />
            <Area
              type="monotone"
              dataKey="uptime"
              name="Uptime (%)"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#gUp)"
            />
            <Area
              type="monotone"
              dataKey="latencia"
              name="Latencia (ms)"
              stroke="#38bdf8"
              strokeWidth={2}
              fill="url(#gLat)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Errores por hora (line) */}
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Errores de aplicación por hora
        </p>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={uptimeData} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="hora" tick={{ fontSize: 9, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            <Line
              type="monotone"
              dataKey="errores"
              name="Errores"
              stroke="#f43f5e"
              strokeWidth={2}
              dot={{ r: 2, fill: "#f43f5e" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * Contenido de la pestaña de tickets.
 *
 * @returns Vista con resumen de tickets, categorías y cumplimiento de SLA.
 *
 * @remarks
 * Esta pestaña agrupa:
 * - Indicadores de volumen y resolución
 * - Gráfico de barras por semana
 * - Distribución por categoría
 * - Tendencia histórica de SLA
 */
function TabTickets() {
  return (
    <div className="space-y-5">
      {/* Mini stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TICKET_STATS.map((s) => (
          <div key={s.label} className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
            <p className="text-[10px] text-slate-400 font-medium">{s.label}</p>
            <p className="text-lg font-extrabold text-slate-800 leading-tight mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Volumen semanal */}
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Volumen semanal — últimas 7 semanas
        </p>
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={ticketsTrend} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="semana" tick={{ fontSize: 9, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="abiertos" name="Abiertos" fill="#6366f1" radius={[3, 3, 0, 0]} />
            <Bar dataKey="cerrados" name="Cerrados" fill="#10b981" radius={[3, 3, 0, 0]} />
            <Bar dataKey="escalados" name="Escalados" fill="#f59e0b" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Distribución por categoría + SLA trend — dos columnas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Pie: categorías */}
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Por categoría
          </p>
          <div className="flex items-center gap-3">
            <ResponsiveContainer width={100} height={100}>
              <PieChart>
                <Pie
                  data={ticketsByCategory}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={46}
                  strokeWidth={0}
                >
                  {ticketsByCategory.map((e) => (
                    <Cell key={e.name} fill={e.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <ul className="flex-1 space-y-1">
              {ticketsByCategory.map((c) => (
                <li key={c.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                    <span className="text-[10px] text-slate-500">{c.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700">{c.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Line: SLA histórico */}
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Cumplimiento SLA — 6 meses
          </p>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={slaData} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 9, fill: "#94a3b8" }} />
              <YAxis domain={[88, 100]} tick={{ fontSize: 9, fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
                formatter={(v: number | undefined) => [v != null ? `${v}%` : "—", "SLA"]}
              />
              <Line
                type="monotone"
                dataKey="cumplimiento"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#10b981" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/**
 * Contenido de la pestaña de infraestructura.
 *
 * @returns Vista con métricas de infraestructura y tabla de servidores.
 *
 * @remarks
 * Esta pestaña presenta:
 * - Tarjetas de estado de recursos
 * - Porcentajes de cumplimiento o uso
 * - Tabla resumida de servidores en tiempo real
 */
function TabInfraestructura() {
  return (
    <div className="space-y-5">
      {/* Resource cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {infraStats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex flex-col gap-2"
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium leading-tight">{s.label}</p>
                <p className={`text-sm font-extrabold mt-0.5 ${s.textColor}`}>{s.value}</p>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${s.color} transition-all`}
                  style={{ width: `${s.pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Server table */}
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Servidores — CPU & RAM en tiempo real
        </p>
        <div className="rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-3 py-2 font-semibold text-slate-400">Servidor</th>
                <th className="text-left px-3 py-2 font-semibold text-slate-400">Rol</th>
                <th className="text-left px-3 py-2 font-semibold text-slate-400">Estado</th>
                <th className="px-3 py-2 font-semibold text-slate-400 text-right">CPU</th>
                <th className="px-3 py-2 font-semibold text-slate-400 text-right">RAM</th>
              </tr>
            </thead>
            <tbody>
              {servers.map((sv, i) => (
                <tr key={sv.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                  <td className="px-3 py-2 font-mono font-semibold text-slate-700">{sv.name}</td>
                  <td className="px-3 py-2 text-slate-500">{sv.role}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${
                        sv.status === "online"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      <span
                        className={`w-1 h-1 rounded-full ${
                          sv.status === "online" ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      {sv.status === "online" ? "Online" : "Mant."}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="w-14 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${cpuColor(sv.cpu)}`} style={{ width: `${sv.cpu}%` }} />
                      </div>
                      <span className="text-slate-600 font-semibold w-7 text-right">{sv.cpu}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="w-14 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${cpuColor(sv.ram)}`} style={{ width: `${sv.ram}%` }} />
                      </div>
                      <span className="text-slate-600 font-semibold w-7 text-right">{sv.ram}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Tabs config ───────────────────────────────────────────────────────────────

/**
 * Configuración de pestañas disponibles en el dashboard.
 *
 * @remarks
 * Define la relación entre identificador interno y etiqueta visible.
 */
const TABS = [
  { id: "disponibilidad", label: "Disponibilidad" },
  { id: "tickets", label: "Tickets" },
  { id: "infraestructura", label: "Infraestructura" },
] as const;

/**
 * Identificador válido de pestaña.
 *
 * @remarks
 * Se deriva automáticamente del arreglo {@link TABS}.
 */
type TabId = typeof TABS[number]["id"];

// ── Main ──────────────────────────────────────────────────────────────────────

/**
 * Sección principal del dashboard operativo de TI.
 *
 * @returns Panel con navegación por pestañas y contenido analítico.
 *
 * @remarks
 * Este componente:
 * - Mantiene el estado de la pestaña activa
 * - Renderiza un encabezado general del panel
 * - Permite navegar entre disponibilidad, tickets e infraestructura
 * - Muestra contenido especializado según la selección actual
 *
 * El componente funciona como un contenedor analítico central
 * dentro del dashboard del área de TI.
 *
 * @example
 * ```tsx
 * <ITDashboardSection />
 * ```
 */
export default function ITDashboardSection() {
  const [active, setActive] = useState<TabId>("disponibilidad");

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">Panel de operaciones</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Infraestructura · Tickets · Disponibilidad — actualización cada 2 min
          </p>
        </div>

        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-[11px] font-semibold text-emerald-700 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          EN VIVO
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5 w-fit mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
              active === tab.id
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {active === "disponibilidad" && <TabDisponibilidad />}
      {active === "tickets" && <TabTickets />}
      {active === "infraestructura" && <TabInfraestructura />}
    </div>
  );
}