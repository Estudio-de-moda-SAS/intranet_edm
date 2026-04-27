/**
 * @module ITGaugeCard
 * Tarjeta de indicador semicircular para métricas del área de TI.
 *
 * @remarks
 * Este componente renderiza un gauge en formato semicircular para representar
 * porcentajes o niveles de salud de una métrica.
 *
 * Soporta dos variantes de presentación:
 * - `default`: tarjeta completa con encabezado, badge de estado y gauge grande
 * - `small`: versión compacta para integrarse en tarjetas resumen
 *
 * Incluye:
 * - Cálculo visual del avance del gauge mediante SVG
 * - Animaciones de entrada con Framer Motion
 * - Color dinámico según el valor
 * - Posibilidad de definir ícono y color personalizado
 *
 * Está pensado para reutilizarse en dashboards de monitoreo y observabilidad.
 */

"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

/**
 * Props del componente {@link ITGaugeCard}.
 *
 * @property title Título descriptivo del indicador.
 * @property value Valor porcentual mostrado en el gauge.
 * @property size Define el tamaño del componente.
 * @property icon Ícono opcional mostrado en la cabecera.
 * @property color Color personalizado del trazo del gauge.
 */
interface GaugeProps {
  title: string;
  value: number;
  size?: "default" | "small";
  icon?: LucideIcon;
  color?: string;
}

/**
 * Obtiene la configuración visual del estado según el valor recibido.
 *
 * @param value Valor porcentual a evaluar.
 * @returns Objeto con color de trazo, color de texto, fondo y etiqueta de estado.
 *
 * @remarks
 * Rangos aplicados:
 * - >= 85: crítico
 * - >= 65: atención
 * - < 65: normal
 *
 * Esta configuración se utiliza para el badge de estado y el color
 * principal del indicador cuando no se define un color personalizado.
 */
function getStatusColor(value: number) {
  if (value >= 85) {
    return {
      stroke: "#ef4444",
      text: "text-rose-600",
      bg: "bg-rose-50",
      label: "Crítico",
    };
  }

  if (value >= 65) {
    return {
      stroke: "#f59e0b",
      text: "text-amber-600",
      bg: "bg-amber-50",
      label: "Atención",
    };
  }

  return {
    stroke: "#8b5cf6",
    text: "text-violet-600",
    bg: "bg-violet-50",
    label: "Normal",
  };
}

/**
 * Tarjeta gauge para representar una métrica porcentual.
 *
 * @param props Propiedades del componente.
 * @returns Indicador semicircular en versión compacta o expandida.
 *
 * @remarks
 * Este componente:
 * - Calcula la longitud de arco visible del gauge a partir del porcentaje
 * - Usa `strokeDasharray` y `strokeDashoffset` para animar el progreso
 * - Cambia de tamaño según la variante seleccionada
 * - Permite reutilización en diferentes bloques del dashboard
 *
 * En modo `small`, se muestra únicamente el gauge compacto y el valor.
 * En modo `default`, se agrega cabecera, badge de estado y animación completa.
 *
 * @example
 * ```tsx
 * <ITGaugeCard
 *   title="CPU"
 *   value={68}
 * />
 * ```
 *
 * @example
 * ```tsx
 * <ITGaugeCard
 *   title="Salud"
 *   value={92}
 *   size="small"
 * />
 * ```
 */
export default function ITGaugeCard({
  title,
  value,
  size = "default",
  icon: Icon,
  color,
}: GaugeProps) {
  const status = getStatusColor(value);
  const strokeColor = color ?? status.stroke;

  /**
   * Radio base del gauge según el tamaño seleccionado.
   *
   * @remarks
   * El radio afecta la longitud total del arco y el cálculo del progreso visual.
   */
  const r = size === "small" ? 22 : 36;

  /**
   * Longitud total del semicírculo del gauge.
   *
   * @remarks
   * Se calcula a partir de la fórmula de media circunferencia:
   * `π * r`
   */
  const circumference = Math.PI * r;

  /**
   * Desplazamiento del trazo visible según el porcentaje.
   *
   * @remarks
   * Este valor controla cuánto del arco permanece oculto o visible,
   * permitiendo representar gráficamente el progreso del indicador.
   */
  const dashOffset = circumference - (value / 100) * circumference;

  if (size === "small") {
    return (
      <div className="flex items-center justify-center">
        <svg width="60" height="36" viewBox="0 0 60 36">
          {/* Track */}
          <path
            d="M 8 30 A 22 22 0 0 1 52 30"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Value */}
          <motion.path
            d="M 8 30 A 22 22 0 0 1 52 30"
            fill="none"
            stroke={strokeColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* Value text */}
          <text
            x="30"
            y="34"
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fill="#1e293b"
          >
            {value}%
          </text>
        </svg>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && (
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
              <Icon className="h-3.5 w-3.5 text-violet-600" />
            </span>
          )}
          <p className="text-[13px] font-medium text-slate-600">{title}</p>
        </div>

        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.bg} ${status.text}`}>
          {status.label}
        </span>
      </div>

      {/* SVG Gauge */}
      <div className="flex justify-center">
        <svg width="96" height="56" viewBox="0 0 96 56">
          {/* Track */}
          <path
            d="M 12 48 A 36 36 0 0 1 84 48"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Value */}
          <motion.path
            d="M 12 48 A 36 36 0 0 1 84 48"
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </svg>
      </div>

      {/* Value */}
      <div className="text-center -mt-2">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`text-2xl font-bold ${status.text}`}
        >
          {value}%
        </motion.p>
      </div>
    </motion.div>
  );
}