/**
 * @module HRRecruitmentCard
 * Tarjeta de resumen del proceso de reclutamiento en el módulo de RRHH.
 *
 * @remarks
 * Este componente presenta una vista compacta del estado de reclutamiento,
 * dividida en dos bloques principales:
 * - Vacantes abiertas
 * - Pipeline activo de candidatos
 *
 * Incluye métricas resumidas, prioridades de vacantes y etapas del proceso
 * de selección, además de un enlace hacia la vista completa de reclutamiento.
 */

import { Briefcase, ArrowRight } from "lucide-react";
import Link from "next/link";

/**
 * Etapas disponibles dentro del pipeline de reclutamiento.
 */
type Stage = "applied" | "screening" | "interview" | "offer" | "hired";

/**
 * Estructura de una vacante abierta.
 *
 * @property title Nombre del cargo o vacante.
 * @property department Departamento responsable.
 * @property candidates Número de candidatos asociados.
 * @property priority Nivel de prioridad de la vacante.
 * @property daysOpen Cantidad de días que la vacante ha permanecido abierta.
 */
type Position = {
  title: string;
  department: string;
  candidates: number;
  priority: "high" | "medium" | "low";
  daysOpen: number;
};

/**
 * Estructura de un elemento del pipeline de selección.
 *
 * @property name Nombre del candidato.
 * @property position Cargo o vacante asociada.
 * @property stage Etapa actual dentro del pipeline.
 * @property date Fecha relativa del movimiento o actualización.
 */
type PipelineItem = {
  name: string;
  position: string;
  stage: Stage;
  date: string;
};

/**
 * Configuración visual por nivel de prioridad.
 *
 * @remarks
 * Define clases de fondo, borde, color y etiqueta legible
 * para cada prioridad de vacante.
 */
const PRIORITY = {
  high: {
    bg: "bg-rose-50 border-rose-100",
    text: "text-rose-600",
    label: "Alta",
  },
  medium: {
    bg: "bg-amber-50 border-amber-100",
    text: "text-amber-600",
    label: "Media",
  },
  low: {
    bg: "bg-slate-50 border-slate-100",
    text: "text-slate-500",
    label: "Baja",
  },
};

/**
 * Configuración visual y textual por etapa del pipeline.
 *
 * @remarks
 * Cada etapa define:
 * - Etiqueta legible
 * - Color del texto
 * - Color del punto indicador
 */
const STAGE_CONFIG: Record<Stage, { label: string; color: string; dot: string }> =
  {
    applied: {
      label: "Aplicó",
      color: "text-slate-500",
      dot: "bg-slate-300",
    },
    screening: {
      label: "Screening",
      color: "text-sky-600",
      dot: "bg-sky-400",
    },
    interview: {
      label: "Entrevista",
      color: "text-violet-600",
      dot: "bg-violet-400",
    },
    offer: {
      label: "Oferta",
      color: "text-amber-600",
      dot: "bg-amber-400",
    },
    hired: {
      label: "Contratado",
      color: "text-emerald-600",
      dot: "bg-emerald-400",
    },
  };

/**
 * Lista de vacantes abiertas.
 *
 * @remarks
 * Dataset estático utilizado para representar oportunidades activas.
 * En producción, estos datos deberían provenir de una API o servicio.
 */
const OPEN_POSITIONS: Position[] = [
  {
    title: "Diseñador Sr.",
    department: "Diseño",
    candidates: 14,
    priority: "high",
    daysOpen: 8,
  },
  {
    title: "Analista de Ventas",
    department: "Ventas",
    candidates: 22,
    priority: "high",
    daysOpen: 12,
  },
  {
    title: "Dev Frontend",
    department: "TI",
    candidates: 31,
    priority: "medium",
    daysOpen: 18,
  },
  {
    title: "Analista Financiero",
    department: "Finanzas",
    candidates: 9,
    priority: "medium",
    daysOpen: 5,
  },
];

/**
 * Lista de candidatos en pipeline activo.
 *
 * @remarks
 * Representa movimientos recientes o estados relevantes dentro
 * del proceso de selección.
 */
const PIPELINE: PipelineItem[] = [
  {
    name: "Sofía Vargas",
    position: "Diseñador Sr.",
    stage: "offer",
    date: "Hoy",
  },
  {
    name: "Andrés Cárdenas",
    position: "Dev Frontend",
    stage: "interview",
    date: "Mañana",
  },
  {
    name: "Valentina López",
    position: "Analista Ventas",
    stage: "screening",
    date: "Hace 1 día",
  },
  {
    name: "Mateo Suárez",
    position: "Analista Financiero",
    stage: "interview",
    date: "Hace 2 días",
  },
];

/**
 * Tarjeta de reclutamiento del módulo de RRHH.
 *
 * @returns Tarjeta con vacantes abiertas y pipeline activo.
 *
 * @remarks
 * Estructura visual:
 * - Header con icono, título y contador de vacantes
 * - Columna de vacantes abiertas
 * - Columna de pipeline activo
 *
 * Características:
 * - Resumen compacto y escaneable
 * - Indicadores visuales por prioridad
 * - Identificación rápida de etapa por color
 * - Enlace hacia el módulo completo de reclutamiento
 *
 * @example
 * ```tsx
 * <HRRecruitmentCard />
 * ```
 */
export default function HRRecruitmentCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
            <Briefcase className="h-3.5 w-3.5 text-indigo-600" />
          </span>
          <h2 className="text-sm font-semibold text-slate-800">
            Reclutamiento
          </h2>
          <span className="rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-600">
            {OPEN_POSITIONS.length} vacantes
          </span>
        </div>

        <Link
          href="/rrhh/reclutamiento"
          className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-violet-600 transition-colors"
        >
          Ver todo <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        {/* Open positions */}
        <div className="p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            Vacantes abiertas
          </p>

          <ul className="space-y-2">
            {OPEN_POSITIONS.map((pos, i) => {
              const p = PRIORITY[pos.priority];

              return (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5 hover:border-violet-200 hover:bg-violet-50/30 transition-all duration-150 cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 truncate">
                      {pos.title}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {pos.department} · {pos.daysOpen} días abierta
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[12px] font-bold text-slate-600 tabular-nums">
                      {pos.candidates}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${p.bg} ${p.text}`}
                    >
                      {p.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Pipeline */}
        <div className="p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            Pipeline activo
          </p>

          <ul className="space-y-2">
            {PIPELINE.map((item, i) => {
              const stage = STAGE_CONFIG[item.stage];

              return (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5 hover:border-violet-200 hover:bg-violet-50/30 transition-all duration-150 cursor-pointer"
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${stage.dot}`}
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {item.position}
                    </p>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span
                      className={`text-[11px] font-semibold ${stage.color}`}
                    >
                      {stage.label}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {item.date}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}