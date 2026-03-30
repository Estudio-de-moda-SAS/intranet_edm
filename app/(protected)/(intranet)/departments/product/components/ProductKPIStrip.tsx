"use client";

// ✅ CLIENT COMPONENT — KPI_ITEMS vive aquí porque contiene iconos de Lucide.
// Usa el DepartmentKPIStrip compartido para el render.

import {
  Shirt, Scissors, CheckCircle2, AlertTriangle,
  Clock, Package, Store, FileText,
} from "lucide-react";
import { DepartmentKPIStrip, type DeptKpiItem } from "@/app/components/ui/animated/DepartmentKPIStrip";

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

export function ProductKPIStrip() {
  return <DepartmentKPIStrip items={KPI_ITEMS} />;
}