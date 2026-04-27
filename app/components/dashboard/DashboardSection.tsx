/**
 * @module DashboardSection
 * Componente cliente encargado de componer la sección principal del dashboard
 * financiero.
 *
 * @remarks
 * Este archivo implementa una sección de resumen que agrupa distintos bloques
 * visuales del panel financiero, organizando indicadores clave, gráficos,
 * actividad reciente y estado de servicios.
 *
 * Su responsabilidad incluye:
 *
 * - Mostrar el encabezado principal del dashboard.
 * - Renderizar tarjetas KPI con métricas resumidas.
 * - Mostrar un gráfico de rendimiento mensual.
 * - Presentar la actividad reciente del sistema.
 * - Incluir una tarjeta con el estado actual de los servicios.
 *
 * Este componente actúa como contenedor de composición para múltiples
 * componentes visuales del dashboard.
 */

"use client";

import DashboardKPICard from "./DashboardKPICard";
import DashboardChartCard from "./DashboardChartCard";
import DashboardActivityCard from "./DashboardActivityCard";
import DashboardStatusCard from "./DashboardStatusCard";
import { dashboardMonths, activities } from "./dashboardData";

/**
 * Componente cliente que renderiza la sección principal del dashboard financiero.
 *
 * @returns Sección estructurada con encabezado, métricas, gráfico,
 * actividad reciente y estado de servicios.
 *
 * @remarks
 * Flujo de ejecución:
 *
 * 1. Renderiza el encabezado principal de la sección.
 * 2. Muestra una fila de tarjetas KPI con indicadores resumidos.
 * 3. Construye una grilla principal con:
 *    - Un gráfico de rendimiento mensual.
 *    - Una tarjeta de actividad reciente.
 *    - Una tarjeta de estado de servicios.
 * 4. Transforma la fuente `activities` al formato esperado por
 *    {@link DashboardActivityCard}.
 *
 * Este componente centraliza la distribución visual de los bloques
 * principales del dashboard, manteniendo separada la lógica de cada tarjeta.
 */
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
        <DashboardKPICard title="Ingresos totales" value="$32,500" trend="+8.2% este mes" />
        <DashboardKPICard title="Gastos operativos" value="$12,300" trend="Estable" />
        <DashboardKPICard title="Margen" value="62%" trend="Rentable" />
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