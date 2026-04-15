/**
 * @module DashboardActivityCard
 * Componente cliente para mostrar un resumen de actividad reciente
 * dentro de un dashboard.
 *
 * @remarks
 * Este archivo implementa una tarjeta reutilizable que presenta una lista
 * de eventos o actividades recientes en formato compacto.
 *
 * Su responsabilidad incluye:
 *
 * - Mostrar un encabezado con título e icono.
 * - Renderizar una lista de actividades con indicador visual por tipo.
 * - Mostrar un estado vacío cuando no existen actividades.
 *
 * Este componente está diseñado para ser flexible y reutilizable en distintos
 * módulos del dashboard.
 */

"use client";

import { Activity, Clock } from "lucide-react";

/**
 * Representa un ítem individual de actividad.
 */
type ActivityItem = {
  /**
   * Descripción principal de la actividad.
   */
  label: string;

  /**
   * Tiempo asociado a la actividad (ej. "hace 2 min", "10:30 AM").
   */
  time: string;

  /**
   * Tipo de actividad, utilizado para definir el indicador visual.
   *
   * @remarks
   * Valores posibles:
   * - `"ok"`: actividad exitosa.
   * - `"warning"`: actividad con advertencia.
   * - `"error"`: actividad con error.
   * - `"info"`: actividad informativa.
   */
  type?: "ok" | "warning" | "error" | "info";
};

/**
 * Props del componente {@link DashboardActivityCard}.
 */
type DashboardActivityCardProps = {
  /**
   * Título principal de la tarjeta.
   */
  title: string;

  /**
   * Lista de actividades a mostrar.
   *
   * @defaultValue []
   */
  activities?: ActivityItem[];

  /**
   * Icono opcional para el encabezado.
   *
   * @remarks
   * Debe ser un componente compatible con `React.ElementType`.
   * Por defecto se utiliza {@link Activity}.
   */
  icon?: React.ElementType;
};

/**
 * Mapa de estilos para los indicadores de tipo de actividad.
 *
 * @remarks
 * Define clases CSS que representan visualmente cada tipo mediante un punto de color.
 */
const TYPE_DOT: Record<string, string> = {
  ok: "bg-emerald-400",
  warning: "bg-amber-400",
  error: "bg-rose-400",
  info: "bg-sky-400",
};

/**
 * Componente cliente que renderiza una tarjeta de actividad reciente.
 *
 * @param props Propiedades del componente.
 * @param props.title Título de la tarjeta.
 * @param props.activities Lista de actividades a mostrar.
 * @param props.icon Icono opcional para el encabezado.
 * @returns Tarjeta de actividad con lista o estado vacío.
 *
 * @remarks
 * Flujo de ejecución:
 *
 * 1. Renderiza el encabezado con el icono y título.
 * 2. Evalúa si existen actividades:
 *    - Si no hay actividades, muestra un estado vacío.
 *    - Si hay actividades, renderiza cada elemento de la lista.
 * 3. Cada actividad incluye:
 *    - Indicador visual según su tipo.
 *    - Descripción.
 *    - Tiempo asociado.
 *
 * Este componente está optimizado para mostrar información breve y relevante
 * en dashboards operativos.
 */
export default function DashboardActivityCard({
  title,
  activities = [],
  icon: Icon = Activity,
}: DashboardActivityCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
          <Icon className="h-3.5 w-3.5 text-violet-600" />
        </span>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>

      {/* List */}
      <ul className="divide-y divide-slate-50">
        {activities.length === 0 ? (
          /**
           * Estado vacío cuando no hay actividades disponibles.
           */
          <li className="flex items-center gap-2 px-5 py-4 text-[13px] text-slate-400">
            <Clock className="h-4 w-4" /> No hay actividad reciente
          </li>
        ) : (
          /**
           * Renderizado de la lista de actividades.
           */
          activities.map((item, i) => (
            <li
              key={i}
              className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50/50"
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  TYPE_DOT[item.type ?? "info"] ?? "bg-slate-300"
                }`}
              />
              <span className="flex-1 text-[13px] text-slate-700 leading-snug">
                {item.label}
              </span>
              <span className="shrink-0 text-[11px] text-slate-400">
                {item.time}
              </span>
            </li>
          ))
        )}
      </ul>

    </div>
  );
}