/**
 * @module ITKPIStrip
 * Franja de indicadores KPI para el dashboard del área de TI.
 *
 * @remarks
 * Este módulo renderiza una cuadrícula de tarjetas compactas con métricas
 * clave de desempeño operacional, tales como disponibilidad, MTTR,
 * tickets abiertos, cumplimiento de SLA, incidentes críticos y parches pendientes.
 *
 * Incluye:
 * - Indicadores resumidos de alto nivel
 * - Señales visuales de tendencia
 * - Colores de estado y bordes diferenciados
 * - Animaciones escalonadas de entrada con Framer Motion
 *
 * Está diseñado para proporcionar una lectura rápida del estado general
 * del área de TI en la parte superior del dashboard.
 */

// app/it/components/ITKPIStrip.tsx
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
 * - permanece sin cambios
 */
type Trend = "up" | "down" | "neutral";

/**
 * Modelo de datos de un indicador KPI.
 *
 * @property label Nombre del indicador.
 * @property value Valor principal mostrado en la tarjeta.
 * @property subtext Texto secundario contextual.
 * @property trend Dirección de la tendencia del KPI.
 * @property trendValue Valor textual asociado a la tendencia.
 * @property positive Indica si una subida de la métrica es favorable.
 * @property dot Color del punto de estado mostrado junto al título.
 * @property borderColor Clase CSS para el color del borde lateral.
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
 * Conjunto estático de KPIs mostrados en la franja del dashboard.
 *
 * @remarks
 * Cada elemento define la información visual y semántica necesaria
 * para renderizar una tarjeta KPI independiente.
 */
const kpis: KPI[] = [
  {
    label: "Disponibilidad de sistemas",
    value: "99.92%",
    subtext: "Promedio últimos 30 días",
    trend: "up",
    trendValue: "+0.04%",
    positive: true,
    dot: "green",
    borderColor: "border-l-emerald-500",
  },
  {
    label: "MTTR",
    value: "18 min",
    subtext: "Tiempo medio de resolución",
    trend: "down",
    trendValue: "−3 min",
    positive: false,
    dot: "green",
    borderColor: "border-l-teal-500",
  },
  {
    label: "Tickets abiertos",
    value: "47",
    subtext: "12 de alta prioridad",
    trend: "down",
    trendValue: "−8 vs ayer",
    positive: false,
    dot: "yellow",
    borderColor: "border-l-amber-400",
  },
  {
    label: "Cumplimiento SLA",
    value: "96.3%",
    subtext: "Meta corporativa: 95%",
    trend: "up",
    trendValue: "+1.1%",
    positive: true,
    dot: "green",
    borderColor: "border-l-indigo-500",
  },
  {
    label: "Incidentes críticos",
    value: "2",
    subtext: "Activos en este momento",
    trend: "neutral",
    trendValue: "Sin cambio",
    positive: false,
    dot: "red",
    borderColor: "border-l-red-500",
  },
  {
    label: "Parches pendientes",
    value: "134",
    subtext: "Servidores sin actualizar",
    trend: "down",
    trendValue: "−21 esta semana",
    positive: false,
    dot: "yellow",
    borderColor: "border-l-slate-400",
  },
];

/**
 * Mapa de colores para el punto indicador de cada KPI.
 *
 * @remarks
 * Se usa como apoyo visual rápido para reforzar el estado general
 * de la métrica mostrada.
 */
const dotColors = {
  green: "bg-emerald-400",
  yellow: "bg-amber-400",
  red: "bg-red-400 animate-pulse",
};

/**
 * Variantes de animación para el contenedor general.
 *
 * @remarks
 * Aplica una animación escalonada a las tarjetas hijas para generar
 * una entrada más fluida y ordenada.
 */
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

/**
 * Variantes de animación para cada tarjeta KPI.
 *
 * @remarks
 * Las tarjetas aparecen con transición vertical suave y opacidad progresiva.
 */
const card: Variants = {
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
 * @returns Ícono que representa subida, bajada o neutralidad.
 *
 * @remarks
 * El color del ícono depende de si la variación del indicador
 * se interpreta como positiva o negativa para el negocio.
 */
const TrendIcon = ({ trend, isGood }: TrendIconProps) => {
  if (trend === "neutral") {
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  }

  if (trend === "up") {
    return (
      <ArrowUpRight
        className={`w-3.5 h-3.5 ${isGood ? "text-emerald-500" : "text-red-400"}`}
      />
    );
  }

  return (
    <ArrowDownRight
      className={`w-3.5 h-3.5 ${isGood ? "text-emerald-500" : "text-red-400"}`}
    />
  );
};

/**
 * Determina si la tendencia de un KPI debe considerarse favorable.
 *
 * @param kpi Indicador a evaluar.
 * @returns `true` si la tendencia es positiva para el KPI; en caso contrario, `false`.
 *
 * @remarks
 * La evaluación depende de la naturaleza de la métrica:
 * - Para métricas positivas, subir es bueno
 * - Para métricas negativas, bajar es bueno
 * - Las métricas neutrales se consideran estables
 */
const isGoodTrend = (kpi: KPI): boolean => {
  if (kpi.trend === "neutral") return true;
  return kpi.positive ? kpi.trend === "up" : kpi.trend === "down";
};

/**
 * Franja de indicadores KPI del dashboard de TI.
 *
 * @returns Cuadrícula animada de tarjetas KPI.
 *
 * @remarks
 * Este componente:
 * - Recorre el conjunto de KPIs configurados
 * - Evalúa visualmente si la tendencia es favorable o no
 * - Renderiza tarjetas con estilo y color contextual
 * - Aplica animaciones escalonadas de entrada
 *
 * Está pensado para ubicarse en una zona destacada del dashboard,
 * sirviendo como resumen ejecutivo del estado operativo.
 *
 * @example
 * ```tsx
 * <ITKPIStrip />
 * ```
 */
export function ITKPIStrip() {
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
            variants={card}
            className={`group relative flex flex-col gap-3 rounded-xl border border-l-4 ${kpi.borderColor} border-slate-200 bg-white p-4 shadow-sm cursor-default transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
          >
            <div className="flex items-center gap-1.5">
              {kpi.dot && (
                <span
                  className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${dotColors[kpi.dot]}`}
                />
              )}
              <span className="text-[11px] font-medium text-slate-500 leading-tight line-clamp-1">
                {kpi.label}
              </span>
            </div>

            <div>
              <p className="text-2xl font-bold text-slate-800 leading-none">{kpi.value}</p>
              <p className="mt-0.5 text-[10px] text-slate-400 leading-tight">{kpi.subtext}</p>
            </div>

            <div className="flex items-center gap-0.5">
              <TrendIcon trend={kpi.trend} isGood={good} />
              <span className={`text-[10px] font-semibold ${good ? "text-emerald-600" : "text-red-500"}`}>
                {kpi.trendValue}
              </span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}