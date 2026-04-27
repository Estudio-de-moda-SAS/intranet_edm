/**
 * @module RetailKPIStrip
 * Franja de KPIs del módulo de Retail.
 *
 * @remarks
 * Este componente define y renderiza la franja de indicadores clave
 * del módulo de Retail reutilizando el componente compartido
 * {@link DepartmentKPIStrip}.
 *
 * Su función principal es adaptar el sistema visual genérico
 * de KPIs al contexto específico del área de Retail, consolidando
 * señales de desempeño provenientes de distintos canales:
 * - comercial
 * - e-commerce
 * - tiendas físicas
 *
 * Los indicadores incluidos ofrecen una lectura ejecutiva rápida
 * sobre variables relevantes del módulo, tales como:
 * - facturación total
 * - avance frente a meta mensual
 * - pipeline comercial B2B
 * - volumen de órdenes online
 * - disponibilidad operativa de tiendas
 * - pedidos pendientes
 *
 * La información actual es estática y funciona como mock de interfaz.
 * En una implementación productiva, estos datos podrían integrarse con:
 * - sistemas comerciales
 * - plataformas e-commerce
 * - analítica de tiendas
 * - servicios internos de consolidación multicanal
 */

"use client";

// RetailKPIStrip.tsx
// Migrado al patrón DepartmentKPIStrip — mismo sistema de animación,
// overlap con el hero (-mt-5) y accent border-l-4 que usa FinanceKPIStrip.

import {
  TrendingUp,
  ShoppingCart,
  Store,
  Euro,
  Target,
  Package,
} from "lucide-react";
import {
  DepartmentKPIStrip,
  type DeptKpiItem,
} from "@/app/components/ui/animated/DepartmentKPIStrip";

/**
 * Conjunto de KPIs visibles en la franja principal del módulo de Retail.
 *
 * @remarks
 * Este arreglo define los indicadores que se mostrarán en la franja
 * superior del dashboard, utilizando la estructura {@link DeptKpiItem}.
 *
 * Cada elemento contiene:
 * - etiqueta principal
 * - valor destacado
 * - texto auxiliar o descriptivo
 * - ícono representativo
 * - tendencia visual
 * - configuración visual de borde e ícono
 *
 * Los KPIs han sido diseñados para resumir el estado del negocio
 * en una única capa de lectura, combinando señales de distintos frentes
 * operativos del retail.
 *
 * @example
 * ```ts
 * KPI_ITEMS.map(kpi => kpi.label);
 * ```
 */
const KPI_ITEMS: DeptKpiItem[] = [
  {
    label:       "Facturación total",
    value:       "€179.2K",
    sub:         "todos los canales · hoy",
    icon:        Euro,
    trend:       "up",
    borderColor: "border-l-indigo-500",
    iconBg:      "bg-indigo-50",
    iconColor:   "text-indigo-600",
  },
  {
    label:       "Meta mensual",
    value:       "76%",
    sub:         "€420K objetivo",
    icon:        Target,
    trend:       "up",
    borderColor: "border-l-violet-500",
    iconBg:      "bg-violet-50",
    iconColor:   "text-violet-600",
  },
  {
    label:       "Pipeline B2B",
    value:       "€87K",
    sub:         "14 oportunidades activas",
    icon:        TrendingUp,
    trend:       "up",
    borderColor: "border-l-emerald-500",
    iconBg:      "bg-emerald-50",
    iconColor:   "text-emerald-600",
  },
  {
    label:       "Órdenes online",
    value:       "348",
    sub:         "conversión 3.8% · hoy",
    icon:        ShoppingCart,
    trend:       "up",
    borderColor: "border-l-orange-500",
    iconBg:      "bg-orange-50",
    iconColor:   "text-orange-500",
  },
  {
    label:       "Tiendas operativas",
    value:       "6 / 8",
    sub:         "2 con incidencia activa",
    icon:        Store,
    trend:       "down",
    borderColor: "border-l-rose-500",
    iconBg:      "bg-rose-50",
    iconColor:   "text-rose-500",
  },
  {
    label:       "Pedidos pendientes",
    value:       "127",
    sub:         "B2B + online + tienda",
    icon:        Package,
    trend:       "neutral",
    borderColor: "border-l-slate-400",
    iconBg:      "bg-slate-100",
    iconColor:   "text-slate-600",
  },
];

/**
 * Franja de indicadores clave del módulo de Retail.
 *
 * @returns Un componente visual reutilizable con los KPIs consolidados del área de Retail.
 *
 * @remarks
 * Este componente actúa como una capa de adaptación entre:
 * - la configuración específica de KPIs del dominio Retail
 * - el componente visual compartido {@link DepartmentKPIStrip}
 *
 * Su propósito es desacoplar la definición del contenido
 * de la lógica de presentación, permitiendo que el sistema
 * comparta una misma estructura visual entre departamentos,
 * mientras cada módulo define sus propios indicadores.
 *
 * En este caso, la franja resume el estado global del negocio retail
 * a través de una perspectiva multicanal, integrando señales
 * de facturación, cumplimiento, pipeline, operación e inventario.
 *
 * @example
 * ```tsx
 * <RetailKPIStrip />
 * ```
 */
export function RetailKPIStrip() {
  return <DepartmentKPIStrip items={KPI_ITEMS} />;
}