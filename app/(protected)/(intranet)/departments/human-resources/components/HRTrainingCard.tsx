/**
 * @module HRTrainingCard
 * Tarjeta de visualización de programas de capacitación en el módulo de RRHH.
 *
 * @remarks
 * Este componente muestra un resumen de programas activos de formación,
 * incluyendo:
 * - Nombre del programa
 * - Categoría
 * - Número de inscritos
 * - Progreso (%) mediante barra visual
 * - Tiempo restante
 *
 * Incluye además un acceso a la vista completa de capacitaciones.
 */

import { BookOpen, ArrowRight, Users } from "lucide-react";
import Link from "next/link";

/**
 * Estructura de un programa de capacitación.
 *
 * @property name Nombre del programa.
 * @property category Categoría o tipo de formación.
 * @property enrolled Número de participantes inscritos.
 * @property progress Porcentaje de avance del programa.
 * @property endsIn Tiempo restante para finalización.
 * @property color Clase CSS para la barra de progreso.
 */
type Program = {
  name: string;
  category: string;
  enrolled: number;
  progress: number;
  endsIn: string;
  color: string;
};

/**
 * Lista de programas de capacitación (mock).
 *
 * @remarks
 * Este dataset es estático y se utiliza como ejemplo para renderizar la UI.
 * En producción, debería reemplazarse por datos provenientes de una API.
 */
const PROGRAMS: Program[] = [
  {
    name: "Liderazgo y Gestión",
    category: "Desarrollo",
    enrolled: 18,
    progress: 65,
    endsIn: "2 semanas",
    color: "bg-violet-500",
  },
  {
    name: "Excel Financiero",
    category: "Herramientas",
    enrolled: 12,
    progress: 40,
    endsIn: "1 mes",
    color: "bg-indigo-500",
  },
  {
    name: "Atención al Cliente",
    category: "Ventas",
    enrolled: 28,
    progress: 80,
    endsIn: "3 días",
    color: "bg-emerald-500",
  },
];

/**
 * Componente de tarjeta de capacitaciones.
 *
 * @returns Tarjeta con listado de programas de formación activos.
 *
 * @remarks
 * Características:
 * - Encabezado con icono y enlace a vista completa
 * - Lista de programas con métricas clave
 * - Barra de progreso animada por programa
 * - Feedback visual en hover
 *
 * Cada ítem muestra:
 * - Nombre del programa
 * - Categoría + inscritos + duración
 * - Porcentaje de avance
 * - Indicador visual de progreso
 *
 * @example
 * ```tsx
 * <HRTrainingCard />
 * ```
 */
export default function HRTrainingCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
            <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
          </span>
          <h2 className="text-sm font-semibold text-slate-800">
            Capacitaciones
          </h2>
        </div>

        <Link
          href="/rrhh/training"
          className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-violet-600 transition-colors"
        >
          Ver todas <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Lista de programas */}
      <ul className="divide-y divide-slate-50">
        {PROGRAMS.map((prog, i) => (
          <li
            key={i}
            className="px-5 py-3.5 hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="text-[13px] font-semibold text-slate-800 leading-tight">
                  {prog.name}
                </p>

                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-medium text-slate-400">
                    {prog.category}
                  </span>

                  <span className="text-slate-200">·</span>

                  <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                    <Users className="h-2.5 w-2.5" /> {prog.enrolled}
                  </span>

                  <span className="text-slate-200">·</span>

                  <span className="text-[10px] text-slate-400">
                    Termina en {prog.endsIn}
                  </span>
                </div>
              </div>

              <span className="shrink-0 text-[12px] font-bold text-slate-700 tabular-nums">
                {prog.progress}%
              </span>
            </div>

            {/* Barra de progreso */}
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${prog.color} transition-all duration-700`}
                style={{ width: `${prog.progress}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}