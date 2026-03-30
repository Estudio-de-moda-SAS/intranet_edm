"use client";

// ✅ CLIENT COMPONENT — HERO_KPIS vive aquí porque contiene iconos de Lucide.
// Usa el DepartmentKPIStrip compartido para el render.

import {
  TrendingUp, DollarSign, Receipt, PieChart,
  AlertTriangle, BarChart2, Wallet, CreditCard,
} from "lucide-react";
import { DepartmentKPIStrip, type DeptKpiItem } from "@/app/components/ui/animated/DepartmentKPIStrip";

const KPI_ITEMS: DeptKpiItem[] = [
  { label: "Ingresos mensuales",    value: "$120K",  sub: "+8.2% vs mes anterior",  icon: TrendingUp,    trend: "up",      borderColor: "border-l-emerald-500", iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
  { label: "Gastos mensuales",      value: "$80K",   sub: "dentro del presupuesto", icon: CreditCard,    trend: "neutral", borderColor: "border-l-amber-500",   iconBg: "bg-amber-50",   iconColor: "text-amber-600"   },
  { label: "Ganancia neta",         value: "$40K",   sub: "margen del 33%",         icon: DollarSign,    trend: "up",      borderColor: "border-l-violet-500",  iconBg: "bg-violet-50",  iconColor: "text-violet-600"  },
  { label: "Facturas pendientes",   value: "18",     sub: "5 vencidas",             icon: Receipt,       trend: "down",    borderColor: "border-l-rose-500",    iconBg: "bg-rose-50",    iconColor: "text-rose-600"    },
  { label: "Presupuesto ejecutado", value: "67%",    sub: "de $180K asignados",     icon: PieChart,      trend: "neutral", borderColor: "border-l-sky-500",     iconBg: "bg-sky-50",     iconColor: "text-sky-600"     },
  { label: "Por cobrar",            value: "$24.5K", sub: "en 12 facturas",         icon: Wallet,        trend: "up",      borderColor: "border-l-indigo-500",  iconBg: "bg-indigo-50",  iconColor: "text-indigo-600"  },
  { label: "Por pagar",             value: "$11.2K", sub: "vence esta semana",      icon: AlertTriangle, trend: "down",    borderColor: "border-l-orange-500",  iconBg: "bg-orange-50",  iconColor: "text-orange-600"  },
  { label: "Reportes del mes",      value: "7",      sub: "3 pendientes",           icon: BarChart2,     trend: "neutral", borderColor: "border-l-purple-500",  iconBg: "bg-purple-50",  iconColor: "text-purple-600"  },
];

export function FinanceKPIStrip() {
  return <DepartmentKPIStrip items={KPI_ITEMS} />;
}