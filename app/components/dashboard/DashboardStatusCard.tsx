/**
 * @module DashboardStatusCard
 * Componente cliente para mostrar el estado general de servicios o métricas
 * operativas dentro de un dashboard.
 *
 * @remarks
 * Este archivo implementa una tarjeta reutilizable que combina una lista
 * de estados con un indicador visual circular cuando existe un ítem de salud.
 *
 * Su responsabilidad incluye:
 *
 * - Mostrar un encabezado con título e icono.
 * - Renderizar una lista de estados con indicador visual por severidad.
 * - Identificar el estado de salud general cuando existe un ítem `"salud"`.
 * - Calcular y representar un gauge circular basado en porcentaje.
 * - Mostrar un estado vacío cuando no se proporcionan datos.
 *
 * Este componente está orientado a paneles de monitoreo, operación o control,
 * donde se necesita una lectura rápida del estado de un sistema.
 */

"use client";

import { motion } from "framer-motion";
import { Gauge } from "lucide-react";

/**
 * Representa un ítem individual de estado.
 */
type StatusItem = {
  /**
   * Nombre o etiqueta descriptiva del estado.
   */
  label: string;

  /**
   * Valor visible asociado al estado.
   *
   * @remarks
   * Puede ser un porcentaje, texto corto o valor resumido.
   */
  value: string;

  /**
   * Nivel visual del estado.
   *
   * @remarks
   * Valores posibles:
   * - `"ok"`: estado correcto.
   * - `"warning"`: estado con advertencia.
   * - `"error"`: estado crítico o con fallo.
   */
  status: "ok" | "warning" | "error";
};

/**
 * Props del componente {@link DashboardStatusCard}.
 */
type DashboardStatusCardProps = {
  /**
   * Título principal de la tarjeta.
   */
  title: string;

  /**
   * Lista de estados a mostrar.
   *
   * @defaultValue []
   */
  status?: StatusItem[];
};

/**
 * Mapa de estilos para el punto visual asociado a cada estado.
 *
 * @remarks
 * Define una clase CSS por tipo de severidad para representar
 * el estado con un color específico.
 */
const DOT: Record<string, string> = {
  ok: "bg-emerald-400",
  warning: "bg-amber-400",
  error: "bg-rose-400",
};

/**
 * Componente cliente que renderiza una tarjeta de estado con lista
 * de servicios y medidor circular opcional.
 *
 * @param props Propiedades del componente.
 * @param props.title Título de la tarjeta.
 * @param props.status Lista de estados a mostrar.
 * @returns Tarjeta de estado con gauge opcional y listado de ítems.
 *
 * @remarks
 * Flujo de ejecución:
 *
 * 1. Recibe la lista de estados y el título de la tarjeta.
 * 2. Busca un ítem con la etiqueta `"salud"` para usarlo como referencia
 *    del medidor circular.
 * 3. Si existe ese ítem:
 *    - Extrae el valor porcentual.
 *    - Calcula circunferencia, desplazamiento y color del gauge.
 * 4. Renderiza el encabezado con icono y título.
 * 5. Muestra:
 *    - Un gauge circular si existe el ítem de salud.
 *    - Una lista de estados si hay datos.
 *    - Un mensaje vacío si no hay estados disponibles.
 *
 * Este componente integra visualización resumida y monitoreo operativo
 * en una sola unidad reutilizable.
 */
export default function DashboardStatusCard({
  title,
  status = [],
}: DashboardStatusCardProps) {
  /**
   * Ítem correspondiente al indicador de salud general.
   *
   * @remarks
   * Se detecta buscando una etiqueta igual a `"salud"` en minúsculas.
   */
  const healthItem = status.find((s) => s.label.toLowerCase() === "salud");

  /**
   * Valor numérico del porcentaje de salud.
   *
   * @remarks
   * Si no existe un ítem de salud, toma el valor `0`.
   */
  const healthValue = healthItem ? parseInt(healthItem.value.replace("%", "")) : 0;

  /**
   * Radio del círculo principal del gauge.
   */
  const radius = 34;

  /**
   * Longitud total de la circunferencia del gauge.
   */
  const circumference = 2 * Math.PI * radius;

  /**
   * Desplazamiento del trazo para representar visualmente el porcentaje actual.
   */
  const offset = circumference - (healthValue / 100) * circumference;

  /**
   * Color del indicador circular según el nivel de salud calculado.
   *
   * @remarks
   * Reglas actuales:
   * - Mayor a 80: verde.
   * - Mayor a 40: amarillo.
   * - 40 o menos: rojo.
   */
  const gaugeStroke =
    healthValue > 80 ? "#10b981" :
    healthValue > 40 ? "#f59e0b" : "#ef4444";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
          <Gauge className="h-3.5 w-3.5 text-violet-600" />
        </span>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>

      <div className="flex items-center gap-5 px-5 py-4">
        {/* Circular gauge */}
        {healthItem && (
          <div className="relative h-[75px] w-[75px] shrink-0">
            <svg className="-rotate-90" width="75" height="75">
              <circle
                cx="37.5"
                cy="37.5"
                r={radius}
                strokeWidth="7"
                stroke="#f1f5f9"
                fill="transparent"
              />
              <circle
                cx="37.5"
                cy="37.5"
                r={radius}
                strokeWidth="7"
                fill="transparent"
                stroke={gaugeStroke}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-slate-800">{healthValue}%</span>
            </div>
          </div>
        )}

        {/* Status list */}
        <div className="flex-1 space-y-2">
          {status.length === 0 ? (
            <p className="text-[13px] text-slate-400">No hay estados disponibles</p>
          ) : (
            status.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${DOT[item.status] ?? "bg-slate-300"}`} />
                  <span className="text-[13px] text-slate-600">{item.label}</span>
                </div>
                <span className="text-[13px] font-medium text-slate-800">{item.value}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}