/**
 * @module ITSatisfactionCard
 * Tarjeta de visualización de satisfacción de usuarios por departamento.
 *
 * @remarks
 * Este componente presenta métricas de satisfacción agrupadas por área,
 * utilizando barras animadas para facilitar la lectura visual.
 *
 * Incluye:
 * - Promedio general de satisfacción
 * - Indicadores individuales por departamento
 * - Barras con animación progresiva
 * - Colores dinámicos según nivel de satisfacción
 *
 * Está orientado a dashboards de experiencia de usuario (UX / ITSM),
 * permitiendo identificar rápidamente áreas con bajo o alto desempeño.
 */

"use client";

import { motion } from "framer-motion";
import { Smile } from "lucide-react";

/**
 * Representa un registro de satisfacción por departamento.
 *
 * @property department Nombre del área evaluada.
 * @property value Porcentaje de satisfacción (0–100).
 */
type SatisfactionItem = {
  department: string;
  value: number;
};

/**
 * Determina el gradiente de color de la barra según el valor.
 *
 * @param value Nivel de satisfacción.
 * @returns Clases CSS de gradiente para la barra.
 *
 * @remarks
 * Rangos:
 * - >= 85: alto (verde)
 * - >= 65: medio (ámbar)
 * - < 65: bajo (rojo)
 */
function barColor(value: number) {
  if (value >= 85) return "from-emerald-500 to-emerald-400";
  if (value >= 65) return "from-amber-500 to-amber-400";
  return "from-rose-500 to-rose-400";
}

/**
 * Determina el color del texto según el valor.
 *
 * @param value Nivel de satisfacción.
 * @returns Clase CSS de color de texto.
 *
 * @remarks
 * Utiliza la misma lógica de rangos que {@link barColor}
 * para mantener consistencia visual.
 */
function textColor(value: number) {
  if (value >= 85) return "text-emerald-600";
  if (value >= 65) return "text-amber-600";
  return "text-rose-600";
}

/**
 * Props del componente {@link ITSatisfactionCard}.
 *
 * @property data Lista de métricas de satisfacción por departamento.
 */
type ITSatisfactionCardProps = {
  data: SatisfactionItem[];
};

/**
 * Tarjeta de satisfacción de usuarios.
 *
 * @param props Propiedades del componente.
 * @returns Tarjeta con promedio general y desglose por departamento.
 *
 * @remarks
 * Este componente:
 * - Calcula el promedio global de satisfacción
 * - Renderiza barras animadas usando {@link motion.div}
 * - Aplica estilos dinámicos según el nivel de satisfacción
 * - Escalona las animaciones para mejorar la percepción visual
 *
 * La animación se realiza de forma progresiva por elemento,
 * generando un efecto de carga fluido en la interfaz.
 *
 * @example
 * ```tsx
 * <ITSatisfactionCard data={data} />
 * ```
 */
export default function ITSatisfactionCard({ data }: ITSatisfactionCardProps) {
  const avg = Math.round(
    data.reduce((s, i) => s + i.value, 0) / data.length
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
            <Smile className="h-3.5 w-3.5 text-violet-600" />
          </span>
          <h2 className="text-sm font-semibold text-slate-800">
            Satisfacción de Usuarios
          </h2>
        </div>

        <span className={`text-sm font-bold tabular-nums ${textColor(avg)}`}>
          {avg}% promedio
        </span>
      </div>

      {/* Bars */}
      <ul className="divide-y divide-slate-50">
        {data.map((item, i) => (
          <li key={item.department} className="px-5 py-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[13px] font-medium text-slate-700">
                {item.department}
              </span>

              <span className={`text-[13px] font-bold tabular-nums ${textColor(item.value)}`}>
                {item.value}%
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                className={`h-2 rounded-full bg-gradient-to-r ${barColor(item.value)}`}
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.08,
                  ease: "easeOut",
                }}
              />
            </div>
          </li>
        ))}
      </ul>

    </div>
  );
}