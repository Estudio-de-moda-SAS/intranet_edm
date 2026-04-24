"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";

import { uptimeData, UPTIME_STATS } from "../config";

/**
 * @module ITDashboardSection/tabs/AvailabilityTab
 * Pestaña de disponibilidad del dashboard de TI.
 *
 * @remarks
 * Extraída directamente del componente original.
 * No contiene cambios funcionales, solo separación de responsabilidades.
 */
export function AvailabilityTab() {
  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {UPTIME_STATS.map((s) => (
          <div
            key={s.label}
            className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100"
          >
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

      {/* Area chart */}
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Uptime & Latencia — últimas 24 h
        </p>

        <ResponsiveContainer width="100%" height={200}>
          <AreaChart
            data={uptimeData}
            margin={{ top: 4, right: 8, left: -22, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gUp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="gLat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
            />

            <XAxis
              dataKey="hora"
              tick={{ fontSize: 10 }}
              stroke="#94a3b8"
            />

            <YAxis
              yAxisId="left"
              domain={[95, 100]}
              tick={{ fontSize: 10 }}
              stroke="#94a3b8"
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10 }}
              stroke="#94a3b8"
            />

            <Tooltip />

            <Legend iconSize={8} />

            <Area
              yAxisId="left"
              type="monotone"
              dataKey="uptime"
              stroke="#6366f1"
              fill="url(#gUp)"
              strokeWidth={2}
              dot={false}
              name="Uptime (%)"
            />

            <Area
              yAxisId="right"
              type="monotone"
              dataKey="latencia"
              stroke="#10b981"
              fill="url(#gLat)"
              strokeWidth={2}
              dot={false}
              name="Latencia (ms)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Error line chart */}
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Errores por hora
        </p>

        <ResponsiveContainer width="100%" height={160}>
          <LineChart
            data={uptimeData}
            margin={{ top: 4, right: 8, left: -22, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
            />

            <XAxis
              dataKey="hora"
              tick={{ fontSize: 10 }}
              stroke="#94a3b8"
            />

            <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="errores"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 2 }}
              name="Errores"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}