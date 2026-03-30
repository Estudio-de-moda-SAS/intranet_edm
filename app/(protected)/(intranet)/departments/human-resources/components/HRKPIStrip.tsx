"use client";

import {
  Users, UserPlus, UserCheck, Clock,
  TrendingUp, Award, CalendarHeart, BookOpen,
} from "lucide-react";
import { DepartmentKPIStrip, type DeptKpiItem } from "@/app/components/ui/animated/DepartmentKPIStrip";

const KPI_ITEMS: DeptKpiItem[] = [
  { label: "Total empleados",      value: "1,284", sub: "+12 este mes",       icon: Users,         trend: "up",      borderColor: "border-l-violet-500",  iconBg: "bg-violet-50",  iconColor: "text-violet-600"  },
  { label: "Vacantes abiertas",    value: "9",     sub: "3 en entrevistas",   icon: UserPlus,      trend: "neutral", borderColor: "border-l-sky-500",     iconBg: "bg-sky-50",     iconColor: "text-sky-600"     },
  { label: "Nuevos ingresos",      value: "5",     sub: "este mes",           icon: UserCheck,     trend: "up",      borderColor: "border-l-emerald-500", iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
  { label: "Solicitudes abiertas", value: "28",    sub: "8 pendientes",       icon: Clock,         trend: "down",    borderColor: "border-l-rose-500",    iconBg: "bg-rose-50",    iconColor: "text-rose-600"    },
  { label: "Rotación mensual",     value: "2.1%",  sub: "−0.3% vs anterior",  icon: TrendingUp,    trend: "up",      borderColor: "border-l-amber-500",   iconBg: "bg-amber-50",   iconColor: "text-amber-600"   },
  { label: "Reconocimientos",      value: "17",    sub: "en los últimos 30d", icon: Award,         trend: "up",      borderColor: "border-l-purple-500",  iconBg: "bg-purple-50",  iconColor: "text-purple-600"  },
  { label: "Aniversarios",         value: "4",     sub: "esta semana",        icon: CalendarHeart, trend: "neutral", borderColor: "border-l-pink-500",    iconBg: "bg-pink-50",    iconColor: "text-pink-600"    },
  { label: "En capacitación",      value: "63",    sub: "3 cursos activos",   icon: BookOpen,      trend: "up",      borderColor: "border-l-teal-500",    iconBg: "bg-teal-50",    iconColor: "text-teal-600"    },
];

export function HRKPIStrip() {
  return <DepartmentKPIStrip items={KPI_ITEMS} />;
}