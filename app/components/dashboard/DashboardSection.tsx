"use client";

import DashboardKPICard from "./DashboardKPICard";
import DashboardChartCard from "./DashboardChartCard";
import DashboardActivityCard from "./DashboardActivityCard";
import DashboardStatusCard from "./DashboardStatusCard";
import { dashboardMonths, activities } from "./dashboardData";

export default function DashboardSection() {
  return (
    <section className="space-y-8">

      {/* Heading */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Dashboard Financiero</h2>
        <p className="text-sm text-slate-400">Resumen de rendimiento y actividad del sistema</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardKPICard title="Ingresos totales"   value="$32,500" trend="+8.2% este mes" />
        <DashboardKPICard title="Gastos operativos"  value="$12,300" trend="Estable"         />
        <DashboardKPICard title="Margen"             value="62%"     trend="Rentable"        />
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <DashboardChartCard
          title="Rendimiento mensual"
          data={dashboardMonths}
          dataKey="value"
          xKey="name"
        />
        <DashboardActivityCard
          title="Actividad reciente"
          activities={activities.map((a) => ({ label: a.text, time: a.time }))}
        />
        <DashboardStatusCard title="Estado de servicios" />
      </div>

    </section>
  );
}