/**
 * @module DepartmentKPIStrip
 * Componente cliente para mostrar una franja de KPIs de un departamento.
 *
 * @remarks
 * Este archivo renderiza un conjunto de indicadores en formato de tarjetas,
 * con animación escalonada, distribución responsive y una marca visual
 * de tendencia para cada métrica.
 */

"use client";

// 📁 app/components/ui/animated/DepartmentKPIStrip.tsx

import { motion, type Variants } from "framer-motion";
import type { ElementType } from "react";
import { useAnimationsEnabled } from "@/app/hooks/useAnimationsEnabled";

/**
 * Representa un KPI individual dentro de la franja.
 */
export type DeptKpiItem = {
  /**
   * Nombre del indicador.
   */
  label: string;

  /**
   * Valor principal mostrado en la tarjeta.
   */
  value: string;

  /**
   * Texto secundario o contexto adicional.
   */
  sub: string;

  /**
   * Icono representativo del KPI.
   */
  icon: ElementType;

  /**
   * Tendencia visual del indicador.
   *
   * @remarks
   * Valores soportados:
   * - `"up"`: tendencia positiva.
   * - `"down"`: tendencia negativa.
   * - `"neutral"`: sin cambio relevante.
   */
  trend: "up" | "down" | "neutral";

  /**
   * Clase de color para el borde izquierdo destacado.
   */
  borderColor: string;

  /**
   * Clase de fondo para el contenedor del icono.
   */
  iconBg: string;

  /**
   * Clase de color para el icono.
   */
  iconColor: string;
  enabled?: boolean;
};

/**
 * Props del componente {@link DepartmentKPIStrip}.
 */
interface Props {
  /**
   * Lista de KPIs a mostrar.
   */
  items: DeptKpiItem[];
}

/**
 * Badge visual para la tendencia del KPI.
 *
 * @param props Propiedades del componente.
 * @param props.trend Tipo de tendencia del indicador.
 * @returns Indicador visual de tendencia.
 */
function TrendBadge({ trend }: { trend: DeptKpiItem["trend"] }) {
  if (trend === "up") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600">
        ▲
      </span>
    );
  }

  if (trend === "down") {
    return (
      <span className="inline-flex items-center rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600">
        ▼
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
      —
    </span>
  );
}

/**
 * Mapa de columnas para pantallas grandes según la cantidad de KPIs.
 */
const lgColsClass: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
  7: "lg:grid-cols-7",
  8: "lg:grid-cols-8",
};

/**
 * Mapa de columnas para pantallas medianas según la cantidad de KPIs.
 */
const smColsClass: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-3",
  6: "sm:grid-cols-3",
  7: "sm:grid-cols-4",
  8: "sm:grid-cols-4",
};

/**
 * Variantes animadas para cada tarjeta KPI.
 */
const cardVariant: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/**
 * Variantes estáticas usadas cuando las animaciones están deshabilitadas.
 */
const cardInstant: Variants = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0 },
};

/**
 * Renderiza una franja de indicadores KPI para un departamento.
 *
 * @param props Propiedades del componente.
 * @param props.items Lista de KPIs a mostrar.
 * @returns Grilla responsive de tarjetas KPI.
 *
 * @remarks
 * Flujo general:
 * 1. Consulta si las animaciones están habilitadas.
 * 2. Calcula la cantidad de elementos para definir la grilla responsive.
 * 3. Aplica animación escalonada al contenedor cuando corresponde.
 * 4. Renderiza cada KPI con:
 *    - icono,
 *    - valor principal,
 *    - etiqueta,
 *    - texto secundario,
 *    - badge de tendencia.
 */
export function DepartmentKPIStrip({ items }: Props) {
  /**
   * Indica si las animaciones globales están activadas.
   */
  const animated = useAnimationsEnabled();

  /**
   * Cantidad total de KPIs recibidos.
   */
  const count = items.length;

  /**
   * Clase de columnas para pantallas grandes.
   */
  const lgCols = lgColsClass[count] ?? "lg:grid-cols-6";

  /**
   * Clase de columnas para pantallas medianas.
   */
  const smCols = smColsClass[count] ?? "sm:grid-cols-3";

  /**
   * Variantes del contenedor para animación escalonada.
   */
  const container: Variants = animated
    ? { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }
    : { hidden: {}, show: {} };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={`relative z-10 grid grid-cols-2 gap-3 ${smCols} ${lgCols} -mt-5 mb-7`}
    >
      {items.map((kpi) => (
        <motion.div
          key={kpi.label}
          variants={animated ? cardVariant : cardInstant}
          className={`group relative flex flex-col gap-3 rounded-xl border border-l-4 ${kpi.borderColor} border-slate-200 bg-white p-4 shadow-sm cursor-default transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
        >
          <div className="flex items-start justify-between">
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${kpi.iconBg}`}>
              <kpi.icon className={`h-4 w-4 ${kpi.iconColor}`} />
            </span>
            <TrendBadge trend={kpi.trend} />
          </div>

          <div>
            <p className="text-2xl font-bold text-slate-800 leading-none">
              {kpi.value}
            </p>
            <p className="mt-1 text-[11px] font-semibold text-slate-600 leading-tight">
              {kpi.label}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-400 leading-tight">
              {kpi.sub}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}