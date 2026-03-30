"use client";

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ── Data ─────────────────────────────────────────────────────────

const shipmentsPerDay = [
  { day: "Lu 3",  enviados: 112, entregados: 98,  retrasados: 4  },
  { day: "Ma 4",  enviados: 135, entregados: 121, retrasados: 3  },
  { day: "Mi 5",  enviados: 98,  entregados: 94,  retrasados: 2  },
  { day: "Ju 6",  enviados: 154, entregados: 140, retrasados: 6  },
  { day: "Vi 7",  enviados: 143, entregados: 130, retrasados: 5  },
  { day: "Lu 10", enviados: 119, entregados: 87,  retrasados: 3  },
];

const deliveryTimes = [
  { semana: "S1 Feb", avg: 2.4, target: 2.0 },
  { semana: "S2 Feb", avg: 2.1, target: 2.0 },
  { semana: "S3 Feb", avg: 2.7, target: 2.0 },
  { semana: "S4 Feb", avg: 2.2, target: 2.0 },
  { semana: "S1 Mar", avg: 1.9, target: 2.0 },
  { semana: "S2 Mar", avg: 2.0, target: 2.0 },
];

const carrierPerf = [
  { carrier: "SEUR",    puntual: 94, retrasado: 6  },
  { carrier: "DHL",     puntual: 97, retrasado: 3  },
  { carrier: "MRW",     puntual: 89, retrasado: 11 },
  { carrier: "GLS",     puntual: 91, retrasado: 9  },
  { carrier: "Correos", puntual: 85, retrasado: 15 },
];

// ── Custom Tooltip ────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-lg text-[12px]">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ── Dashboard ─────────────────────────────────────────────────────

export default function LogisticaDashboard() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

      {/* Envíos diarios — 7 cols */}
      <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">Envíos esta semana</p>
            <p className="text-[11px] text-slate-400">Enviados · Entregados · Retrasados</p>
          </div>
          <span className="rounded-full bg-sky-50 border border-sky-100 px-3 py-1 text-[11px] font-semibold text-sky-600">
            Total: 761
          </span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={shipmentsPerDay} margin={{ left: -20, right: 4, top: 4 }}>
            <defs>
              <linearGradient id="gEnv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gEnt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
            <Area type="monotone" dataKey="enviados"   name="Enviados"   stroke="#0ea5e9" strokeWidth={2} fill="url(#gEnv)" dot={{ r: 3, fill: "#0ea5e9" }} />
            <Area type="monotone" dataKey="entregados" name="Entregados" stroke="#10b981" strokeWidth={2} fill="url(#gEnt)" dot={{ r: 3, fill: "#10b981" }} />
            <Area type="monotone" dataKey="retrasados" name="Retrasados" stroke="#f43f5e" strokeWidth={2} fill="none" strokeDasharray="4 2" dot={{ r: 3, fill: "#f43f5e" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Tiempo medio de entrega — 5 cols */}
      <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-800">Tiempo medio de entrega</p>
          <p className="text-[11px] text-slate-400">Días promedio vs objetivo (2.0d)</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={deliveryTimes} margin={{ left: -20, right: 4, top: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="semana" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis domain={[1.5, 3]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
            <Line type="monotone" dataKey="avg"    name="Promedio (d)"  stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: "#6366f1" }} />
            <Line type="monotone" dataKey="target" name="Objetivo (d)"  stroke="#e2e8f0" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Rendimiento por transportista — full */}
      <div className="lg:col-span-12 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">Rendimiento por transportista</p>
            <p className="text-[11px] text-slate-400">% puntualidad de entrega (último mes)</p>
          </div>
          <a href="/logistica/transportistas" className="text-[12px] font-medium text-sky-600 hover:text-sky-700 transition-colors">
            Ver detalle →
          </a>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={carrierPerf} layout="vertical" margin={{ left: 8, right: 16, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="carrier" tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }} axisLine={false} tickLine={false} width={56} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="puntual"   name="A tiempo (%)"  stackId="a" fill="#0ea5e9" radius={[0, 0, 0, 0]} />
            <Bar dataKey="retrasado" name="Retrasado (%)" stackId="a" fill="#fca5a5" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}