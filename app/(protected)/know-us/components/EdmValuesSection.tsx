/**
 * @module CompanyValuesSection
 * Sección de misión, visión y valores corporativos.
 *
 * @remarks
 * Este componente renderiza los principios fundamentales de la empresa,
 * incluyendo misión, visión y valores, a partir de una fuente de datos
 * centralizada (`companyValues`).
 *
 * Es un **Server Component**, ya que:
 * - no requiere estado local
 * - no utiliza hooks
 * - solo renderiza contenido estático/configurable
 *
 * Su propósito es presentar la identidad organizacional de forma clara
 * y estructurada dentro de la página corporativa.
 */

// ✅ SERVER COMPONENT

import { companyValues } from "../config/edmValues";

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Sección de valores corporativos.
 *
 * @returns Lista visual de valores con icono, título y descripción.
 *
 * @remarks
 * La sección se compone de:
 *
 * 1. **Header**
 *    - etiqueta contextual (misión, visión y valores)
 *
 * 2. **Listado de valores**
 *    - icono representativo
 *    - título del valor
 *    - descripción breve
 *
 * Características:
 * - Render dinámico basado en `companyValues`
 * - Separadores visuales entre ítems
 * - Hover states para mejorar la experiencia visual
 *
 * @example
 * ```tsx
 * <CompanyValuesSection />
 * ```
 */
export function CompanyValuesSection() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white dark:bg-gray-900">

      {/* ============================================================ */}
      {/* Header                                                       */}
      {/* ============================================================ */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
        <span className="h-[6px] w-[6px] flex-shrink-0 rounded-full bg-violet-600" />
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          Misión, visión y valores
        </p>
      </div>

      {/* ============================================================ */}
      {/* Lista de valores                                             */}
      {/* ============================================================ */}
      <div className="flex flex-col">
        {companyValues.map((v, i) => (
          <div
            key={v.title}
            className="flex items-start gap-3 px-6 py-4 transition-colors hover:bg-violet-50/50 dark:hover:bg-gray-800"
            style={{
              borderBottom:
                i < companyValues.length - 1
                  ? "0.5px solid rgb(226 232 240)"
                  : "none",
            }}
          >
            {/* Icono */}
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-violet-50 text-[15px]">
              {v.icon}
            </div>

            {/* Contenido */}
            <div>
              <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">
                {v.title}
              </p>
              <p className="mt-0.5 text-[12px] leading-[1.5] text-slate-400">
                {v.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}