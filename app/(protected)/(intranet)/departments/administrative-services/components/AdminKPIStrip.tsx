/**
 * @module AdminKPIStrip
 * Franja de indicadores clave (KPI) del módulo de Servicios Administrativos.
 *
 * Presenta un conjunto resumido de métricas operativas del área, tales como:
 * - visitantes del día,
 * - solicitudes activas de tarjetas,
 * - accesos bloqueados,
 * - ocupación de salas,
 * - volumen mensual de solicitudes,
 * - tiempo promedio de atención.
 *
 * @remarks
 * Este componente está orientado a ofrecer una lectura rápida del estado
 * operativo del área administrativa mediante tarjetas compactas, animadas y
 * visualmente diferenciadas.
 *
 * Usa `framer-motion` para aplicar animaciones de entrada escalonadas y
 * resalta visualmente la tendencia de cada indicador.
 */

// app/(protected)/(intranet)/departments/administrative/components/AdminKPIStrip.tsx
"use client";

import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { motion, type Variants } from "framer-motion";

/**
 * Dirección de tendencia de un KPI.
 *
 * - `up`: incremento respecto al período de comparación.
 * - `down`: disminución respecto al período de comparación.
 * - `neutral`: sin cambios relevantes.
 */
type Trend = "up" | "down" | "neutral";

/**
 * Representa un indicador clave mostrado en la franja de KPIs.
 *
 * @property label Título breve del indicador.
 * @property value Valor principal mostrado.
 * @property subtext Texto de apoyo o descripción corta del indicador.
 * @property trend Dirección de la tendencia.
 * @property trendValue Texto descriptivo del cambio observado.
 * @property positive Indica si una tendencia ascendente debe considerarse favorable.
 * @property dot Color opcional del punto visual de estado.
 * @property borderColor Clase visual del borde lateral de la tarjeta.
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
 * Conjunto de KPIs mostrados en la franja administrativa.
 *
 * @remarks
 * Actualmente esta colección está definida de forma estática, pero su
 * estructura permite ser reemplazada fácilmente por datos dinámicos del
 * backend o del servicio administrativo.
 */
const kpis: KPI[] = [
  {
    label: "Visitantes hoy",
    value: "38",
    subtext: "Registrados en recepción",
    trend: "up",
    trendValue: "+7 vs ayer",
    positive: true,
    dot: "green",
    borderColor: "border-l-emerald-500",
  },
  {
    label: "Tarjetas de acceso",
    value: "12",
    subtext: "Solicitudes activas",
    trend: "up",
    trendValue: "+3 esta semana",
    positive: true,
    dot: "yellow",
    borderColor: "border-l-amber-400",
  },
  {
    label: "Accesos bloqueados",
    value: "2",
    subtext: "Requieren atención",
    trend: "neutral",
    trendValue: "Sin cambio",
    positive: false,
    dot: "red",
    borderColor: "border-l-red-500",
  },
  {
    label: "Salas reservadas",
    value: "9 / 12",
    subtext: "Ocupación actual",
    trend: "up",
    trendValue: "+2 vs ayer",
    positive: true,
    dot: "yellow",
    borderColor: "border-l-orange-400",
  },
  {
    label: "Solicitudes del mes",
    value: "87",
    subtext: "Accesos, salas y servicios",
    trend: "up",
    trendValue: "+12 vs junio",
    positive: true,
    dot: "green",
    borderColor: "border-l-violet-500",
  },
  {
    label: "Tiempo de atención",
    value: "4.2 min",
    subtext: "Promedio en recepción",
    trend: "down",
    trendValue: "−0.8 min",
    positive: false,
    dot: "green",
    borderColor: "border-l-teal-500",
  },
];

/**
 * Mapa de clases visuales para el punto de estado de cada KPI.
 */
const dotColors = {
  green:  "bg-emerald-400",
  yellow: "bg-amber-400",
  red:    "bg-red-400 animate-pulse",
};

/**
 * Variantes de animación del contenedor principal.
 *
 * @remarks
 * Aplica una animación escalonada a las tarjetas para que entren de forma
 * progresiva y más fluida.
 */
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

/**
 * Variantes de animación individuales para cada tarjeta KPI.
 */
const card: Variants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

/**
 * Ícono visual para representar la tendencia de un KPI.
 *
 * @param props Propiedades del componente.
 * @param props.trend Dirección de tendencia del indicador.
 * @param props.isGood Indica si la tendencia debe considerarse positiva.
 * @returns Ícono correspondiente a la dirección y valoración de la tendencia.
 *
 * @remarks
 * La misma dirección (`up` o `down`) puede interpretarse como buena o mala
 * según el contexto del KPI.
 */
const TrendIcon = ({ trend, isGood }: { trend: Trend; isGood: boolean }) => {
  if (trend === "neutral") return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  if (trend === "up") {
    return <ArrowUpRight className={`w-3.5 h-3.5 ${isGood ? "text-emerald-500" : "text-red-400"}`} />;
  }
  return <ArrowDownRight className={`w-3.5 h-3.5 ${isGood ? "text-emerald-500" : "text-red-400"}`} />;
};

/**
 * Determina si la tendencia de un KPI debe interpretarse como favorable.
 *
 * @param kpi Indicador a evaluar.
 * @returns `true` si la tendencia es positiva en contexto, `false` en caso contrario.
 *
 * @remarks
 * La interpretación depende del campo `positive`:
 * - si `positive` es `true`, una subida es favorable;
 * - si `positive` es `false`, una bajada es favorable;
 * - una tendencia neutral siempre se considera aceptable.
 */
const isGoodTrend = (kpi: KPI): boolean => {
  if (kpi.trend === "neutral") return true;
  return kpi.positive ? kpi.trend === "up" : kpi.trend === "down";
};

/**
 * Renderiza la franja de indicadores clave del módulo administrativo.
 *
 * @returns Conjunto de tarjetas KPI con animación, estado visual y tendencia.
 *
 * @remarks
 * Este componente:
 * - recorre la colección {@link kpis},
 * - interpreta la calidad de la tendencia mediante {@link isGoodTrend},
 * - renderiza íconos de tendencia con {@link TrendIcon},
 * - y presenta la información en un grid responsive.
 */
export function AdminKPIStrip() {
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
                <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${dotColors[kpi.dot]}`} />
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