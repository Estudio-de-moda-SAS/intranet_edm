/**
 * @module DocumentStatBar
 * Barra de indicadores (KPIs) del módulo de Gestión Documental.
 *
 * Este componente muestra métricas clave del sistema documental en formato
 * de tarjetas resumidas con animación.
 *
 * @remarks
 * Se utiliza principalmente en la parte superior del dashboard documental
 * para ofrecer una visión rápida del estado del sistema:
 *
 * - volumen total de documentos,
 * - documentos en proceso,
 * - actividad reciente,
 * - y alertas de cumplimiento.
 *
 * Incluye:
 * - animaciones con Framer Motion,
 * - soporte para modo oscuro,
 * - indicadores visuales por estado,
 * - y énfasis en métricas críticas.
 */

"use client";

import { motion, type Variants } from "framer-motion";
import { FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react";

/**
 * Representa un indicador estadístico dentro de la barra.
 *
 * @property label Nombre del indicador.
 * @property value Valor principal mostrado.
 * @property sub Descripción secundaria del indicador.
 * @property icon Ícono representativo.
 * @property accent Clase visual de acento lateral.
 * @property iconBg Fondo del ícono.
 * @property iconColor Color del ícono.
 * @property highlight Indica si el KPI debe resaltarse visualmente.
 */
type Stat = {
  label:      string;
  value:      string;
  sub:        string;
  icon:       React.ElementType;
  accent:     string;
  iconBg:     string;
  iconColor:  string;
  highlight?: boolean;
};

/**
 * Configuración de los KPIs mostrados en la barra.
 *
 * @remarks
 * Actualmente es un conjunto mock, pero en producción debería provenir de:
 * - API de analítica documental,
 * - o servicio de métricas del sistema.
 *
 * Cada elemento define completamente su comportamiento visual y semántico.
 */
const STATS: Stat[] = [
  {
    label:     "Documentos activos",
    value:     "1,248",
    sub:       "Archivos disponibles en el sistema",
    icon:      FileText,
    accent:    "border-l-indigo-500",
    iconBg:    "bg-indigo-50 dark:bg-indigo-500/[0.12]",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    label:     "Pendientes de aprobación",
    value:     "42",
    sub:       "Documentos en revisión o firma",
    icon:      Clock,
    accent:    "border-l-amber-500",
    iconBg:    "bg-amber-50 dark:bg-amber-500/[0.12]",
    iconColor: "text-amber-600 dark:text-amber-400",
    highlight: true,
  },
  {
    label:     "Aprobados este mes",
    value:     "186",
    sub:       "Documentos validados recientemente",
    icon:      CheckCircle2,
    accent:    "border-l-emerald-500",
    iconBg:    "bg-emerald-50 dark:bg-emerald-500/[0.12]",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    label:     "Incumplimientos",
    value:     "7",
    sub:       "Documentos fuera de cumplimiento",
    icon:      AlertCircle,
    accent:    "border-l-red-500",
    iconBg:    "bg-red-50 dark:bg-red-500/[0.12]",
    iconColor: "text-red-600 dark:text-red-400",
  },
];

/**
 * Variantes de animación para el contenedor.
 *
 * @remarks
 * Implementa animación escalonada (`staggerChildren`) para que cada tarjeta
 * aparezca de forma progresiva.
 */
const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

/**
 * Variantes de animación para cada tarjeta KPI.
 *
 * @remarks
 * Aplica una transición vertical suave con fade-in.
 */
const card: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

/**
 * Renderiza la barra de indicadores del módulo documental.
 *
 * @returns Grid de KPIs animados.
 *
 * @remarks
 * Características principales:
 * - Diseño responsive (2 → 4 columnas).
 * - Animación progresiva al montar.
 * - Soporte para modo oscuro.
 * - Resaltado de KPIs críticos (`highlight`).
 *
 * Uso típico:
 * ```tsx
 * <DocumentStatBar />
 * ```
 */
export function DocumentStatBar() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative z-10 grid grid-cols-2 gap-3 sm:grid-cols-4 -mt-6 mb-6"
    >
      {STATS.map((s) => (
        <motion.div
          key={s.label}
          variants={card}
          className={`
            flex flex-col gap-3 rounded-xl border-l-4 p-4 shadow-sm
            transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
            ${s.accent}
            ${s.highlight
              ? "border border-amber-200 ring-1 ring-amber-100 dark:border-amber-500/25 dark:ring-amber-500/10"
              : "border border-slate-200 dark:border-[#30363d]"
            }
            bg-white dark:bg-[#161b22]
          `}
        >
          {/* Icono */}
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.iconBg}`}>
            <s.icon className={`h-4 w-4 ${s.iconColor}`} />
          </span>

          {/* Contenido */}
          <div>
            <p
              className={`text-2xl font-bold leading-none ${
                s.highlight
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-slate-800 dark:text-[#e6edf3]"
              }`}
            >
              {s.value}
            </p>

            <p className="mt-1 text-[11px] font-semibold leading-tight
                          text-slate-600 dark:text-[#adbac7]">
              {s.label}
            </p>

            <p className="mt-0.5 text-[10px] leading-tight
                          text-slate-400 dark:text-[#545d68]">
              {s.sub}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}