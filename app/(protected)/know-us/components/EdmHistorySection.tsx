/**
 * @module CompanyHistorySection
 * Sección de historia corporativa de la compañía.
 *
 * @remarks
 * Este componente presenta la línea de tiempo institucional de la empresa
 * a partir de la configuración centralizada en {@link companyHistory}.
 *
 * La información se renderiza en una grilla visual de tres columnas,
 * donde cada hito histórico muestra:
 *
 * - referencia temporal
 * - título del evento
 * - descripción del hito
 *
 * Es un **Server Component**, ya que:
 *
 * - no requiere estado local
 * - no utiliza hooks
 * - consume contenido estático/configurable
 *
 * Su propósito es comunicar la evolución de la compañía de forma clara,
 * visual y estructurada dentro de la página corporativa.
 */

// ✅ SERVER COMPONENT

import { companyHistory } from "../config/edmHistory";

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Sección de historia de la empresa.
 *
 * @returns Grid visual con los hitos históricos de la organización.
 *
 * @remarks
 * Este componente organiza los elementos de {@link companyHistory}
 * en una grilla de tres columnas.
 *
 * La lógica visual actual aplica bordes condicionales para:
 *
 * - separar columnas intermedias
 * - separar filas excepto la última
 *
 * Esta lógica asume explícitamente una distribución fija de 3 columnas,
 * por lo que si el layout cambia en el futuro, deberá ajustarse también
 * el cálculo de bordes.
 *
 * Estructura de cada item:
 *
 * 1. Año o referencia temporal
 * 2. Título del hito
 * 3. Descripción contextual
 *
 * @example
 * ```tsx
 * <CompanyHistorySection />
 * ```
 */
export function CompanyHistorySection() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
        <span className="h-[6px] w-[6px] flex-shrink-0 rounded-full bg-violet-600" />
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          Nuestra historia
        </p>
      </div>

      {/* Grid de hitos */}
      <div className="grid grid-cols-3">
        {companyHistory.map((item, index) => (
          <div
            key={item.year}
            className="group px-6 py-5 transition-colors hover:bg-violet-50/50 dark:hover:bg-gray-800"
            style={{
              borderRight:
                (index + 1) % 3 !== 0
                  ? "0.5px solid rgb(226 232 240)"
                  : "none",
              borderBottom:
                index < companyHistory.length - 3
                  ? "0.5px solid rgb(226 232 240)"
                  : "none",
            }}
          >
            {/* Año */}
            <p
              className="mb-1.5 text-[26px] font-bold leading-none text-violet-700"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {item.year}
            </p>

            {/* Título */}
            <p className="mb-1 text-[13px] font-semibold leading-snug text-slate-700 dark:text-slate-200">
              {item.title}
            </p>

            {/* Descripción */}
            <p className="text-[12px] leading-[1.55] text-slate-400 dark:text-slate-400">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}