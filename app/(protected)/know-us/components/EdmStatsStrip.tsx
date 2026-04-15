/**
 * @module CompanyStatsStrip
 * Componente de visualización de métricas en formato grid con animación.
 *
 * @remarks
 * Este componente renderiza un conjunto de estadísticas en forma de tarjetas,
 * aplicando animación progresiva (stagger) usando `framer-motion`.
 *
 * Es reutilizable y puede emplearse en diferentes contextos como:
 *
 * - páginas corporativas
 * - dashboards
 * - módulos de analítica
 *
 * Es un **Client Component** porque:
 * - utiliza animaciones (`motion`)
 * - requiere render dinámico en el cliente
 */

"use client";

import { motion } from "framer-motion";

/* -------------------------------------------------------------------------- */
/* Tipos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Representa una métrica individual.
 */
type Stat = {
  /** Etiqueta descriptiva de la métrica */
  label: string;

  /** Valor principal (puede ser número formateado o texto) */
  value: string;

  /** Icono opcional (emoji o string visual) */
  icon?: string;
};

/**
 * Props del componente CompanyStatsStrip.
 */
type Props = {
  /** Lista de métricas a renderizar */
  stats: Stat[];
};

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Grid de métricas con animación escalonada.
 *
 * @param props - Configuración del componente.
 * @returns Lista de tarjetas de estadísticas animadas.
 *
 * @remarks
 * Características principales:
 *
 * - Layout responsive (2 columnas → 4 columnas en pantallas grandes)
 * - Animación tipo **stagger** (entrada progresiva de elementos)
 * - Cada tarjeta incluye:
 *   - icono opcional
 *   - valor destacado
 *   - etiqueta descriptiva
 *
 * Animación:
 * - contenedor define `staggerChildren`
 * - cada ítem aplica fade + translateY
 *
 * @example
 * ```tsx
 * <CompanyStatsStrip
 *   stats={[
 *     { label: "Tiendas", value: "30+" },
 *     { label: "Ciudades", value: "20+" },
 *     { label: "Años", value: "45" }
 *   ]}
 * />
 * ```
 */
export function CompanyStatsStrip({ stats }: Props) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.08 } },
      }}
      className="grid grid-cols-2 gap-3 py-5 sm:grid-cols-4"
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.4 },
            },
          }}
          className="flex flex-col items-center justify-center rounded-2xl bg-white px-4 py-5 shadow-sm border border-gray-100 text-center gap-1"
        >
          {/* Icono opcional */}
          {stat.icon && (
            <span className="text-2xl mb-1">{stat.icon}</span>
          )}

          {/* Valor */}
          <span className="text-2xl font-bold text-[#1e4976]">
            {stat.value}
          </span>

          {/* Label */}
          <span className="text-xs text-gray-500 font-medium">
            {stat.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}