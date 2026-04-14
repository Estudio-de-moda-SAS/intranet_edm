/**
 * @module LegalKPIStrip
 * Franja de indicadores KPI del módulo jurídico.
 *
 * @remarks
 * Este componente renderiza una cuadrícula de métricas clave del área legal,
 * permitiendo visualizar rápidamente el estado general de contratos,
 * solicitudes, litigios y cumplimiento normativo.
 *
 * Incluye:
 * - Indicadores compactos de alto nivel
 * - Señales visuales de tendencia
 * - Colores contextuales según criticidad
 * - Animaciones escalonadas de entrada con Framer Motion
 *
 * Está pensado para ocupar una posición destacada en la home del área jurídica
 * como resumen ejecutivo del estado operativo.
 */

"use client";

import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { motion, type Variants } from "framer-motion";

/**
 * Dirección de tendencia de un indicador KPI.
 *
 * @remarks
 * Se utiliza para representar visualmente si una métrica:
 * - aumenta
 * - disminuye
 * - permanece estable
 */
type Trend = "up" | "down" | "neutral";

/**
 * Modelo de datos de un indicador KPI del área legal.
 *
 * @property label Nombre del indicador.
 * @property value Valor principal mostrado.
 * @property subtext Texto secundario contextual.
 * @property trend Dirección de la tendencia.
 * @property trendValue Valor textual asociado a la tendencia.
 * @property positive Indica si una subida de la métrica es favorable.
 * @property dot Color del punto indicador.
 * @property borderColor Clase CSS del borde lateral.
 */
interface KPI {
  label: string;
  value: string;
  subtext: string;
  trend: Trend;
  trendValue: string;
  positive: boolean;
  dot?: "green" | "yellow" | "red";
  borderColor: string;
}

/**
 * Conjunto estático de KPIs mostrados en la franja legal.
 *
 * @remarks
 * Cada elemento define la configuración visual y semántica
 * necesaria para renderizar una tarjeta KPI.
 */
const kpis: KPI[] = [
  {
    label: "Contratos activos",
    value: "142",
    subtext: "Vigentes al día de hoy",
    trend: "up",
    trendValue: "+5 este mes",
    positive: true,
    dot: "green",
    borderColor: "border-l-emerald-500",
  },
  {
    label: "Por vencer (30 días)",
    value: "8",
    subtext: "Requieren renovación",
    trend: "up",
    trendValue: "+3 vs semana pasada",
    positive: false,
    dot: "yellow",
    borderColor: "border-l-amber-400",
  },
  {
    label: "Contratos vencidos",
    value: "3",
    subtext: "Sin renovar — atención",
    trend: "neutral",
    trendValue: "Sin cambio",
    positive: false,
    dot: "red",
    borderColor: "border-l-red-500",
  },
  {
    label: "Solicitudes pendientes",
    value: "11",
    subtext: "En espera de atención",
    trend: "down",
    trendValue: "−4 vs ayer",
    positive: false,
    dot: "yellow",
    borderColor: "border-l-orange-400",
  },
  {
    label: "Litigios activos",
    value: "5",
    subtext: "Casos en proceso",
    trend: "neutral",
    trendValue: "Sin cambio",
    positive: false,
    dot: "yellow",
    borderColor: "border-l-slate-400",
  },
  {
    label: "Índice de cumplimiento",
    value: "97%",
    subtext: "Compliance corporativo",
    trend: "up",
    trendValue: "+1% este trimestre",
    positive: true,
    dot: "green",
    borderColor: "border-l-sky-500",
  },
];

/**
 * Mapa de colores para el punto indicador del KPI.
 *
 * @remarks
 * Refuerza visualmente el estado general de cada métrica.
 */
const dotColors = {
  green: "bg-emerald-400",
  yellow: "bg-amber-400",
  red: "bg-red-400 animate-pulse",
};

/**
 * Variantes de animación del contenedor principal.
 *
 * @remarks
 * Aplica una animación escalonada a las tarjetas hijas.
 */
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

/**
 * Variantes de animación para cada tarjeta KPI.
 *
 * @remarks
 * Cada tarjeta aparece con una transición suave de opacidad y desplazamiento vertical.
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
 * Props del componente {@link TrendIcon}.
 *
 * @property trend Dirección de la tendencia.
 * @property isGood Indica si la tendencia debe interpretarse como favorable.
 */
type TrendIconProps = {
  trend: Trend;
  isGood: boolean;
};

/**
 * Ícono visual asociado a la tendencia de un KPI.
 *
 * @param props Propiedades del componente.
 * @returns Ícono que representa crecimiento, descenso o estabilidad.
 *
 * @remarks
 * El color del ícono depende de si la tendencia es positiva o negativa
 * para la naturaleza específica del indicador.
 */
const TrendIcon = ({ trend, isGood }: TrendIconProps) => {
  if (trend === "neutral") {
    return <Minus className="w-3.5 h-3.5 text-slate-400 dark:text-[#545d68]" />;
  }

  if (trend === "up") {
    return (
      <ArrowUpRight
        className={`w-3.5 h-3.5 ${
          isGood ? "text-emerald-500 dark:text-emerald-400" : "text-red-400 dark:text-red-400"
        }`}
      />
    );
  }

  return (
    <ArrowDownRight
      className={`w-3.5 h-3.5 ${
        isGood ? "text-emerald-500 dark:text-emerald-400" : "text-red-400 dark:text-red-400"
      }`}
    />
  );
};

/**
 * Determina si la tendencia de un KPI debe considerarse favorable.
 *
 * @param kpi Indicador a evaluar.
 * @returns `true` si la tendencia es positiva para la métrica; de lo contrario, `false`.
 *
 * @remarks
 * La evaluación depende de la lógica de negocio del indicador:
 * - Para métricas positivas, subir es bueno
 * - Para métricas negativas, bajar es bueno
 * - Las tendencias neutrales se consideran estables
 */
const isGoodTrend = (kpi: KPI): boolean => {
  if (kpi.trend === "neutral") return true;
  return kpi.positive ? kpi.trend === "up" : kpi.trend === "down";
};

/**
 * Franja de KPIs del área jurídica.
 *
 * @returns Cuadrícula animada de indicadores clave del módulo legal.
 *
 * @remarks
 * Este componente:
 * - Recorre la configuración estática de KPIs
 * - Evalúa si la tendencia de cada indicador es favorable
 * - Renderiza tarjetas con color, estado y variación contextual
 * - Aplica animaciones escalonadas para mejorar la percepción visual
 *
 * Está orientado a servir como resumen ejecutivo dentro del dashboard legal.
 *
 * @example
 * ```tsx
 * <LegalKPIStrip />
 * ```
 */
export function LegalKPIStrip() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative z-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 -mt-5 mb-7"
    >
      {kpis.map((kpi) => {
        const good = isGoodTrend(kpi);

        return (
          <motion.div
            key={kpi.label}
            variants={cardVariant}
            className={`
              group relative flex flex-col gap-3 rounded-xl border-l-4 p-4 shadow-sm
              cursor-default transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
              ${kpi.borderColor}
              border border-slate-200 bg-white
              dark:border-[#30363d] dark:bg-[#161b22]
            `}
          >
            <div className="flex items-center gap-1.5">
              {kpi.dot && (
                <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${dotColors[kpi.dot]}`} />
              )}
              <span
                className="text-[11px] font-medium leading-tight line-clamp-1
                               text-slate-500 dark:text-[#768390]"
              >
                {kpi.label}
              </span>
            </div>

            <div>
              <p
                className="text-2xl font-bold leading-none
                             text-slate-800 dark:text-[#e6edf3]"
              >
                {kpi.value}
              </p>
              <p
                className="mt-0.5 text-[10px] leading-tight
                            text-slate-400 dark:text-[#545d68]"
              >
                {kpi.subtext}
              </p>
            </div>

            <div className="flex items-center gap-0.5">
              <TrendIcon trend={kpi.trend} isGood={good} />
              <span
                className={`text-[10px] font-semibold ${
                  good
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-500 dark:text-red-400"
                }`}
              >
                {kpi.trendValue}
              </span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}