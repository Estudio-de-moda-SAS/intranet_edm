/**
 * @module FinanceKPIStrip
 * Configuración y renderizado de la franja de KPIs del módulo financiero.
 *
 * @remarks
 * Este componente actúa como capa de configuración para los indicadores
 * clave del área de Finanzas y delega su renderizado al componente genérico
 * {@link DepartmentKPIStrip}.
 *
 * Define métricas relevantes del dominio financiero, incluyendo:
 *
 * - ingresos y gastos mensuales
 * - ganancia neta
 * - estado de facturación
 * - ejecución presupuestaria
 * - cuentas por cobrar y pagar
 * - actividad de reportes
 *
 * Cada KPI incluye configuración visual (color, icono, estado)
 * y semántica (tendencia), lo que permite mantener consistencia
 * en la representación de datos a nivel de UI.
 */

"use client";

import {
  TrendingUp,
  DollarSign,
  Receipt,
  PieChart,
  AlertTriangle,
  BarChart2,
  Wallet,
  CreditCard,
} from "lucide-react";

import {
  DepartmentKPIStrip,
  type DeptKpiItem,
} from "@/app/components/ui/animated/DepartmentKPIStrip";

/* -------------------------------------------------------------------------- */
/* Configuración de KPIs                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Lista de indicadores clave del módulo financiero.
 *
 * @remarks
 * Cada elemento representa un KPI con:
 *
 * - `label`: nombre del indicador
 * - `value`: valor principal mostrado
 * - `sub`: contexto o descripción adicional
 * - `icon`: icono representativo
 * - `trend`: comportamiento del indicador (`up`, `down`, `neutral`)
 * - configuración visual (colores y estilos)
 *
 * Esta estructura desacopla completamente la lógica de datos
 * de la presentación, permitiendo reutilizar el componente
 * visual `DepartmentKPIStrip` con diferentes dominios.
 */
const KPI_ITEMS: DeptKpiItem[] = [
  {
    label: "Ingresos mensuales",
    value: "$120K",
    sub: "+8.2% vs mes anterior",
    icon: TrendingUp,
    trend: "up",
    borderColor: "border-l-emerald-500",
    iconBg: "bg-emerald-50 dark:bg-emerald-500/[0.12]",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    label: "Gastos mensuales",
    value: "$80K",
    sub: "dentro del presupuesto",
    icon: CreditCard,
    trend: "neutral",
    borderColor: "border-l-amber-500",
    iconBg: "bg-amber-50 dark:bg-amber-500/[0.12]",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    label: "Ganancia neta",
    value: "$40K",
    sub: "margen del 33%",
    icon: DollarSign,
    trend: "up",
    borderColor: "border-l-violet-500",
    iconBg: "bg-violet-50 dark:bg-violet-500/[0.12]",
    iconColor: "text-violet-600 dark:text-violet-400",
    enabled: false, // Ejemplo de KPI deshabilitado
  },
  {
    label: "Facturas pendientes",
    value: "18",
    sub: "5 vencidas",
    icon: Receipt,
    trend: "down",
    borderColor: "border-l-rose-500",
    iconBg: "bg-rose-50 dark:bg-rose-500/[0.12]",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    label: "Presupuesto ejecutado",
    value: "67%",
    sub: "de $180K asignados",
    icon: PieChart,
    trend: "neutral",
    borderColor: "border-l-sky-500",
    iconBg: "bg-sky-50 dark:bg-sky-500/[0.12]",
    iconColor: "text-sky-600 dark:text-sky-400",
  },
  {
    label: "Por cobrar",
    value: "$24.5K",
    sub: "en 12 facturas",
    icon: Wallet,
    trend: "up",
    borderColor: "border-l-indigo-500",
    iconBg: "bg-indigo-50 dark:bg-indigo-500/[0.12]",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    enabled: false, // Ejemplo de KPI deshabilitado
  },
  {
    label: "Por pagar",
    value: "$11.2K",
    sub: "vence esta semana",
    icon: AlertTriangle,
    trend: "down",
    borderColor: "border-l-orange-500",
    iconBg: "bg-orange-50 dark:bg-orange-500/[0.12]",
    iconColor: "text-orange-600 dark:text-orange-400",
    enabled: false, // Ejemplo de KPI deshabilitado
  },
  {
    label: "Reportes del mes",
    value: "7",
    sub: "3 pendientes",
    icon: BarChart2,
    trend: "neutral",
    borderColor: "border-l-purple-500",
    iconBg: "bg-purple-50 dark:bg-purple-500/[0.12]",
    iconColor: "text-purple-600 dark:text-purple-400",
    enabled: false, // Ejemplo de KPI deshabilitado
  },
];

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Franja de indicadores financieros (KPI Strip).
 *
 * @returns Componente visual de KPIs renderizado mediante {@link DepartmentKPIStrip}.
 *
 * @remarks
 * Este componente no contiene lógica de negocio directa,
 * sino que actúa como adaptador entre:
 *
 * - la configuración de KPIs del dominio financiero
 * - el componente genérico de presentación
 *
 * Esto permite:
 *
 * - reutilización del componente base en otros departamentos
 * - mantenimiento centralizado de métricas
 * - fácil sustitución de datos mock por datos reales en el futuro
 *
 * @example
 * ```tsx
 * <FinanceKPIStrip />
 * ```
 */
export function FinanceKPIStrip() {
  return <DepartmentKPIStrip items={KPI_ITEMS.filter((item) => item.enabled !== false)} />;
}