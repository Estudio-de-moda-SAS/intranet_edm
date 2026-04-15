/**
 * @module DashboardKPICard
 * Componente cliente para mostrar indicadores clave de rendimiento (KPI)
 * dentro de un dashboard.
 *
 * @remarks
 * Este archivo implementa una tarjeta visual reutilizable para presentar
 * una métrica principal junto con su título, icono opcional y una tendencia
 * resumida.
 *
 * Su responsabilidad incluye:
 *
 * - Mostrar un valor principal de forma destacada.
 * - Renderizar un icono representativo cuando se proporciona.
 * - Mostrar una tendencia visual mediante {@link TrendChip}.
 * - Aplicar animación de entrada y realce visual al interactuar.
 *
 * Este componente está orientado a paneles de control ejecutivos u operativos
 * donde se requiere una lectura rápida de métricas relevantes.
 */

"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * Props del componente {@link DashboardKPICard}.
 */
interface DashboardKPICardProps {
  /**
   * Título descriptivo del indicador.
   */
  title: string;

  /**
   * Valor principal del KPI.
   *
   * @remarks
   * Puede representarse como texto o número, dependiendo del tipo de métrica.
   */
  value: string | number;

  /**
   * Texto opcional de tendencia asociado al indicador.
   *
   * @remarks
   * Puede incluir valores como porcentajes, variaciones o descriptores
   * cualitativos.
   */
  trend?: string;

  /**
   * Icono opcional para reforzar visualmente el contexto del KPI.
   */
  icon?: LucideIcon;

  /**
   * Clases utilitarias para personalizar el estilo de acento del contenedor
   * del icono.
   *
   * @defaultValue "bg-violet-50 border-violet-100"
   */
  accent?: string;
}

/**
 * Componente auxiliar para representar visualmente la tendencia de un KPI.
 *
 * @param props Propiedades del componente.
 * @param props.trend Texto de tendencia a evaluar y mostrar.
 * @returns Etiqueta visual con icono y estilo según la tendencia detectada.
 *
 * @remarks
 * Flujo de evaluación:
 *
 * 1. Determina si la tendencia es positiva:
 *    - Contiene el símbolo `"+"`.
 *    - Incluye palabras como `"rentable"` o `"estable"`.
 * 2. Determina si la tendencia es negativa:
 *    - Contiene el símbolo `"-"`.
 * 3. Si no entra en las categorías anteriores, se considera neutral.
 *
 * El resultado visual cambia en icono y color según la clasificación.
 */
function TrendChip({ trend }: { trend: string }) {
  /**
   * Indica si la tendencia debe interpretarse como positiva.
   */
  const isUp =
    trend.includes("+") ||
    trend.toLowerCase().includes("rentable") ||
    trend.toLowerCase().includes("estable");

  /**
   * Indica si la tendencia debe interpretarse como negativa.
   */
  const isDown = trend.includes("-");

  if (isDown) {
    return (
      <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-600">
        <TrendingDown className="h-3 w-3" /> {trend}
      </span>
    );
  }

  if (isUp) {
    return (
      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
        <TrendingUp className="h-3 w-3" /> {trend}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
      <Minus className="h-3 w-3" /> {trend}
    </span>
  );
}

/**
 * Componente cliente que renderiza una tarjeta KPI con valor, icono
 * y tendencia opcional.
 *
 * @param props Propiedades del componente.
 * @param props.title Título del indicador.
 * @param props.value Valor principal que se mostrará en la tarjeta.
 * @param props.trend Texto opcional de tendencia.
 * @param props.icon Icono opcional asociado al KPI.
 * @param props.accent Estilo de acento para el contenedor del icono.
 * @returns Tarjeta KPI animada con información resumida.
 *
 * @remarks
 * Flujo de ejecución:
 *
 * 1. Renderiza una tarjeta animada con `framer-motion`.
 * 2. Muestra el título del indicador en la parte superior.
 * 3. Si existe un icono, lo renderiza dentro de un contenedor con acento visual.
 * 4. Presenta el valor principal del KPI con énfasis tipográfico.
 * 5. Si existe una tendencia, delega su representación a {@link TrendChip}.
 *
 * Este componente está pensado para reutilizarse en secciones de resumen,
 * paneles administrativos y dashboards analíticos.
 */
export default function DashboardKPICard({
  title,
  value,
  trend,
  icon: Icon,
  accent = "bg-violet-50 border-violet-100",
}: DashboardKPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-violet-200 hover:-translate-y-0.5"
    >
      {/* Top accent bar */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-violet-500 to-purple-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <div className="flex items-start justify-between">
        <p className="text-[12px] font-medium text-slate-500 leading-tight">{title}</p>
        {Icon && (
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${accent}`}>
            <Icon className="h-3.5 w-3.5 text-violet-600" />
          </span>
        )}
      </div>

      <p className="mt-3 text-2xl font-bold text-slate-900 tabular-nums">{value}</p>

      {trend && (
        <div className="mt-2">
          <TrendChip trend={trend} />
        </div>
      )}
    </motion.div>
  );
}