// ─────────────────────────────────────────────────────────────────
// StoreDashboard.tsx
// Analítica histórica · Estudio de Moda S.A.S · cifras en COP
// ─────────────────────────────────────────────────────────────────
"use client";

import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

const weeklyRevenue = [
  { day: "Lu",  actual: 38_200_000, target: 35_000_000 },
  { day: "Ma",  actual: 42_800_000, target: 35_000_000 },
  { day: "Mi",  actual: 31_400_000, target: 35_000_000 },
  { day: "Ju",  actual: 51_200_000, target: 35_000_000 },
  { day: "Vi",  actual: 61_500_000, target: 45_000_000 },
  { day: "Sa",  actual: 84_300_000, target: 70_000_000 },
  { day: "Do",  actual: 52_100_000, target: 50_000_000 },
];

const salesByStore = [
  { store: "Diesel Andino",        mes: 198, objetivo: 185 },
  { store: "Diesel El Tesoro",     mes: 163, objetivo: 158 },
  { store: "Pilatos Mayorca",      mes: 145, objetivo: 142 },
  { store: "Kipling Unicentro",    mes: 113, objetivo: 105 },
  { store: "Pilatos Fontanar",     mes: 124, objetivo: 140 },
  { store: "Diesel Chipichape",    mes: 99,  objetivo: 120 },
  { store: "Superdry Prime",       mes: 91,  objetivo: 108 },
  { store: "Kipling Buenavista",   mes: 68,  objetivo: 76  },
];

const conversionTrend = [
  { semana: "S1", "Diesel Andino": 5.6, "Pilatos Mayorca": 4.8, Media: 4.1 },
  { semana: "S2", "Diesel Andino": 5.3, "Pilatos Mayorca": 4.5, Media: 3.9 },
  { semana: "S3", "Diesel Andino": 5.9, "Pilatos Mayorca": 5.0, Media: 4.3 },
  { semana: "S4", "Diesel Andino": 5.5, "Pilatos Mayorca": 4.7, Media: 4.1 },
  { semana: "S5", "Diesel Andino": 6.1, "Pilatos Mayorca": 5.2, Media: 4.5 },
  { semana: "S6", "Diesel Andino": 5.8, "Pilatos Mayorca": 4.9, Media: 4.3 },
];

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-lg text-[12px]">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}:{" "}
          <span className="font-bold">
            {typeof p.value === "number" && p.value > 1_000_000
              ? `$${(p.value / 1_000_000).toFixed(1)}M`
              : typeof p.value === "number" && p.value < 20
              ? `${p.value}%`
              : `$${p.value}M`}
          </span>
        </p>
      ))}
    </div>
  );
};

export default function TiendasDashboard() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

      <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">Facturación esta semana</p>
            <p className="text-[11px] text-slate-400">Todas las tiendas · real vs objetivo diario (COP)</p>
          </div>
          <span className="rounded-full bg-orange-50 border border-orange-100 px-3 py-1 text-[11px] font-semibold text-orange-600">
            Total: $361.5M
          </span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={weeklyRevenue} margin={{ left: -10, right: 4, top: 4 }}>
            <defs>
              <linearGradient id="gActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#ea580c" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#ea580c" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day"    tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${Math.round(v / 1_000_000)}M`} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
            <Area  type="monotone" dataKey="actual" name="Facturado" stroke="#ea580c" strokeWidth={2.5} fill="url(#gActual)" dot={{ r: 4, fill: "#ea580c" }} />
            <Line  type="monotone" dataKey="target" name="Objetivo"  stroke="#e2e8f0" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-800">Tasa de conversión</p>
          <p className="text-[11px] text-slate-400">Top tiendas vs media de red (últimas 6 semanas)</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={conversionTrend} margin={{ left: -20, right: 4, top: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="semana" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis domain={[3, 7]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
            <Line type="monotone" dataKey="Diesel Andino"    stroke="#ea580c" strokeWidth={2.5} dot={{ r: 3, fill: "#ea580c" }} />
            <Line type="monotone" dataKey="Pilatos Mayorca"  stroke="#6366f1" strokeWidth={2}   dot={{ r: 3, fill: "#6366f1" }} />
            <Line type="monotone" dataKey="Media"            stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="lg:col-span-12 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">Ventas mes por tienda</p>
            <p className="text-[11px] text-slate-400">Millones COP acumulado vs objetivo mensual</p>
          </div>
          <a href="/tiendas/informes" className="text-[12px] font-medium text-orange-600 hover:text-orange-700 transition-colors">
            Exportar informe →
          </a>
        </div>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={salesByStore} layout="vertical" margin={{ left: 16, right: 24, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}M`} />
            <YAxis type="category" dataKey="store" tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }} axisLine={false} tickLine={false} width={130} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
            <Bar dataKey="objetivo" name="Objetivo (M$)"  fill="#fed7aa" radius={[0, 4, 4, 0]} barSize={10} />
            <Bar dataKey="mes"      name="Facturado (M$)" fill="#ea580c" radius={[0, 4, 4, 0]} barSize={10} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}