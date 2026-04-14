/**
 * @module HRKPIStrip
 * Barra de indicadores clave (KPIs) para el módulo de Recursos Humanos.
 *
 * @remarks
 * Este componente renderiza un conjunto de métricas relevantes del área de RRHH
 * utilizando {@link DepartmentKPIStrip}.
 *
 * Incluye indicadores como:
 * - Total de empleados
 * - Vacantes abiertas
 * - Nuevos ingresos
 * - Solicitudes
 * - Rotación
 * - Reconocimientos
 * - Aniversarios
 * - Capacitaciones
 *
 * Cada KPI contiene información visual enriquecida como:
 * - Ícono representativo
 * - Tendencia (up, down, neutral)
 * - Colores temáticos
 */

"use client";

import {
  Users,
  UserPlus,
  UserCheck,
  Clock,
  TrendingUp,
  Award,
  CalendarHeart,
  BookOpen,
} from "lucide-react";
import {
  DepartmentKPIStrip,
  type DeptKpiItem,
} from "@/app/components/ui/animated/DepartmentKPIStrip";

/**
 * Configuración de los KPIs del módulo de RRHH.
 *
 * @remarks
 * Cada elemento define:
 * - `label`: Nombre del indicador
 * - `value`: Valor principal mostrado
 * - `sub`: Texto secundario descriptivo
 * - `icon`: Ícono asociado
 * - `trend`: Tendencia del indicador (`up`, `down`, `neutral`)
 * - `borderColor`: Color del borde lateral
 * - `iconBg`: Fondo del ícono
 * - `iconColor`: Color del ícono
 *
 * Este dataset es estático (mock) y debería conectarse a datos reales
 * provenientes de backend o servicios analíticos en producción.
 */
const KPI_ITEMS: DeptKpiItem[] = [
  {
    label: "Total empleados",
    value: "1,284",
    sub: "+12 este mes",
    icon: Users,
    trend: "up",
    borderColor: "border-l-violet-500",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    label: "Vacantes abiertas",
    value: "9",
    sub: "3 en entrevistas",
    icon: UserPlus,
    trend: "neutral",
    borderColor: "border-l-sky-500",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
  },
  {
    label: "Nuevos ingresos",
    value: "5",
    sub: "este mes",
    icon: UserCheck,
    trend: "up",
    borderColor: "border-l-emerald-500",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    label: "Solicitudes abiertas",
    value: "28",
    sub: "8 pendientes",
    icon: Clock,
    trend: "down",
    borderColor: "border-l-rose-500",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  {
    label: "Rotación mensual",
    value: "2.1%",
    sub: "−0.3% vs anterior",
    icon: TrendingUp,
    trend: "up",
    borderColor: "border-l-amber-500",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    label: "Reconocimientos",
    value: "17",
    sub: "en los últimos 30d",
    icon: Award,
    trend: "up",
    borderColor: "border-l-purple-500",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    label: "Aniversarios",
    value: "4",
    sub: "esta semana",
    icon: CalendarHeart,
    trend: "neutral",
    borderColor: "border-l-pink-500",
    iconBg: "bg-pink-50",
    iconColor: "text-pink-600",
  },
  {
    label: "En capacitación",
    value: "63",
    sub: "3 cursos activos",
    icon: BookOpen,
    trend: "up",
    borderColor: "border-l-teal-500",
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
  },
];

/**
 * Componente de strip de KPIs para RRHH.
 *
 * @returns Barra de indicadores renderizada mediante {@link DepartmentKPIStrip}.
 *
 * @remarks
 * Este componente actúa como un adaptador de configuración,
 * delegando completamente la renderización a {@link DepartmentKPIStrip}.
 *
 * Permite mantener desacoplada la lógica de datos (KPIs)
 * de la implementación visual.
 *
 * @example
 * ```tsx
 * <HRKPIStrip />
 * ```
 */
export function HRKPIStrip() {
  return <DepartmentKPIStrip items={KPI_ITEMS} />;
}