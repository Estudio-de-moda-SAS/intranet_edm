"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

import {
  ticketData,
  ticketsByCategory,
  slaData,
  TICKET_STATS,
} from "../config";

/**
 * @module ITDashboardSection/tabs/TicketsTab
 * Pestaña de tickets del dashboard de TI.
 *
 * @remarks
 * Extraída directamente del componente original.
 * No contiene cambios funcionales, solo separación de responsabilidades.
 */
export function TicketsTab() {
  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TICKET_STATS.map((s) => (
          <div
            key={s.label}
            className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100"
          >
            <p className="text-[10px] text-slate-400 font-medium">
              {s.label}
            </p>
            <p className="text-lg font-extrabold leading-tight mt-0.5 text-slate-800">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tickets trend */}
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Tendencia de tickets
        </p>

        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={ticketData}
            margin={{ top: 4, right: 8, left: -22, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
            />

            <XAxis
              dataKey="semana"
              tick={{ fontSize: 10 }}
              stroke="#94a3b8"
            />

            <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />

            <Tooltip />

            <Bar
              dataKey="abiertos"
              fill="#6366f1"
              radius={[4, 4, 0, 0]}
              name="Abiertos"
            />

            <Bar
              dataKey="cerrados"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              name="Cerrados"
            />

            <Bar
              dataKey="escalados"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
              name="Escalados"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category + SLA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pie */}
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Distribución por categoría
          </p>

          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={ticketsByCategory}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
              >
                {ticketsByCategory.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* SLA */}
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Cumplimiento SLA (%)
          </p>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={slaData}
              margin={{ top: 4, right: 8, left: -22, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />

              <XAxis
                dataKey="mes"
                tick={{ fontSize: 10 }}
                stroke="#94a3b8"
              />

              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="cumplimiento"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 2 }}
                name="SLA"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}