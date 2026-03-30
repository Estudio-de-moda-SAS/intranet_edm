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

export function RetailKPIStrip() {
  return <DepartmentKPIStrip items={KPI_ITEMS} />;
}