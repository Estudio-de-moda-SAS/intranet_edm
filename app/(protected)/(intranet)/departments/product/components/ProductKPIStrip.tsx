/**
 * @module ProductKPIStrip
 * Franja de KPIs del módulo de Producto.
 *
 * @remarks
 * Este componente define y renderiza el conjunto de indicadores clave
 * (KPIs) específicos del área de Producto, reutilizando el componente
 * compartido {@link DepartmentKPIStrip}.
 *
 * Su responsabilidad principal es configurar los datos visuales y semánticos
 * que describen el estado operativo del módulo, tales como:
 * - referencias activas de temporada
 * - porcentaje de muestras aprobadas
 * - referencias en desarrollo
 * - avance de fichas técnicas
 * - pendientes de aprobación
 * - proveedores activos
 * - días al lanzamiento
 * - cobertura por tiendas
 *
 * A diferencia del componente base compartido, este archivo contiene
 * la definición concreta de los KPIs del dominio de Producto, incluyendo
 * íconos, colores, tendencias y textos auxiliares.
 *
 * La información actual es estática y funciona como mock de interfaz.
 * En una implementación productiva, estos indicadores podrían generarse
 * a partir de datos provenientes de:
 * - sistemas PLM
 * - servicios internos de producto
 * - reportes de abastecimiento
 * - tableros de operación comercial
 */

"use client";

// ✅ CLIENT COMPONENT — KPI_ITEMS vive aquí porque contiene iconos de Lucide.
// Usa el DepartmentKPIStrip compartido para el render.

import {
  Shirt, Scissors, CheckCircle2, AlertTriangle,
  Clock, Package, Store, FileText,
} from "lucide-react";
import { DepartmentKPIStrip, type DeptKpiItem } from "@/app/components/ui/animated/DepartmentKPIStrip";

/**
 * Conjunto de KPIs visibles en la franja superior del módulo de Producto.
 *
 * @remarks
 * Este arreglo define los indicadores clave utilizados para poblar
 * el componente {@link DepartmentKPIStrip} en el contexto del área
 * de Producto.
 *
 * Cada elemento del arreglo sigue la estructura {@link DeptKpiItem}
 * e incluye:
 * - etiqueta principal
 * - valor destacado
 * - texto auxiliar o contextual
 * - ícono representativo
 * - tendencia visual
 * - estilos de color para borde e ícono
 *
 * Estos KPIs están diseñados para ofrecer una lectura rápida
 * del estado operativo de la temporada actual y del flujo de desarrollo
 * de producto.
 *
 * @example
 * ```ts
 * KPI_ITEMS.map(kpi => kpi.label);
 * ```
 */
const KPI_ITEMS: DeptKpiItem[] = [
  { label: "Referencias SS-25",     value: "248",    sub: "+18 vs SS-24",            icon: Shirt,         trend: "up",      borderColor: "border-l-amber-500",   iconBg: "bg-amber-50",   iconColor: "text-amber-600"   },
  { label: "Muestras aprobadas",    value: "61%",    sub: "de 186 enviadas",         icon: CheckCircle2,  trend: "up",      borderColor: "border-l-emerald-500", iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
  { label: "En desarrollo",         value: "74",     sub: "pendientes de muestra",   icon: Scissors,      trend: "down",    borderColor: "border-l-rose-500",    iconBg: "bg-rose-50",    iconColor: "text-rose-600"    },
  { label: "Fichas completas",      value: "89%",    sub: "del total SS-25",         icon: FileText,      trend: "up",      borderColor: "border-l-sky-500",     iconBg: "bg-sky-50",     iconColor: "text-sky-600"     },
  { label: "Muestras pendientes",   value: "8",      sub: "requieren aprobación",    icon: Clock,         trend: "down",    borderColor: "border-l-orange-500",  iconBg: "bg-orange-50",  iconColor: "text-orange-600"  },
  { label: "Proveedores activos",   value: "23",     sub: "esta temporada",          icon: Package,       trend: "neutral", borderColor: "border-l-indigo-500",  iconBg: "bg-indigo-50",  iconColor: "text-indigo-600"  },
  { label: "Días al lanzamiento",   value: "34",     sub: "colección principal",     icon: AlertTriangle, trend: "neutral", borderColor: "border-l-violet-500",  iconBg: "bg-violet-50",  iconColor: "text-violet-600"  },
  { label: "Tiendas confirmadas",   value: "4 / 6",  sub: "con refs completas",      icon: Store,         trend: "up",      borderColor: "border-l-teal-500",    iconBg: "bg-teal-50",    iconColor: "text-teal-600"    },
];

/**
 * Franja de indicadores clave del módulo de Producto.
 *
 * @returns Un componente visual reutilizable con los KPIs del área de Producto.
 *
 * @remarks
 * Este componente actúa como una capa de adaptación entre:
 *
 * - la configuración específica de KPIs del área (`KPI_ITEMS`)
 * - el componente genérico compartido {@link DepartmentKPIStrip}
 *
 * Su propósito es desacoplar la definición de contenido del mecanismo
 * de renderizado, permitiendo que el sistema reutilice una misma base
 * visual para distintos departamentos, mientras cada módulo define
 * sus propios indicadores.
 *
 * En este caso, la franja presenta señales rápidas del estado de:
 * - desarrollo de colección
 * - muestras y aprobaciones
 * - documentación técnica
 * - proveedores
 * - preparación de lanzamiento
 * - cobertura por tiendas
 *
 * @example
 * ```tsx
 * <ProductKPIStrip />
 * ```
 */
export function ProductKPIStrip() {
  return <DepartmentKPIStrip items={KPI_ITEMS} />;
}