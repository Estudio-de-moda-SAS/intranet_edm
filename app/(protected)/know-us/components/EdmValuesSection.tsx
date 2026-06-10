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
 * @returns Grid visual de valores con icono, título y descripción.
 *
 * @remarks
 * La sección se compone de:
 *
 * 1. **Header**
 *    - etiqueta contextual (misión, visión y valores)
 *    - descripción breve de apoyo
 *
 * 2. **Grid de valores**
 *    - icono representativo
 *    - título del valor
 *    - descripción breve
 *
 * Características:
 * - Render dinámico basado en `companyValues`
 * - Cards internas para mejorar jerarquía visual
 * - Hover states para mejorar la experiencia visual
 * - Tipografía heredada del sistema visual global de la intranet
 *
 * @example
 * ```tsx
 * <CompanyValuesSection />
 * ```
 */
export function CompanyValuesSection() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white dark:border-[#30363d] dark:bg-gray-900">
      {/* ============================================================ */}
      {/* Header                                                       */}
      {/* ============================================================ */}
      <div className="flex flex-col gap-2 border-b border-slate-100 px-6 py-5 dark:border-[#21262d]">
        <div className="flex items-center gap-3">
          <span className="h-[6px] w-[6px] flex-shrink-0 rounded-full bg-violet-600" />
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            Misión, visión y valores
          </p>
        </div>

        <p className="max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Principios que guían la cultura, el crecimiento y la forma en que EDM
          construye relaciones con sus equipos, marcas y clientes.
        </p>
      </div>

      {/* ============================================================ */}
      {/* Grid de valores                                              */}
      {/* ============================================================ */}
      <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
        {companyValues.map((v) => (
          <article
            key={v.title}
            className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/60 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-100 hover:bg-white hover:shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:hover:border-violet-500/30 dark:hover:bg-[#1c2128]"
          >
            {/* Decoración sutil */}
            <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-violet-500/[0.05] transition-opacity group-hover:opacity-100 dark:bg-violet-500/[0.08]" />

            {/* Icono */}
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-lg shadow-sm ring-1 ring-violet-100 dark:bg-violet-500/[0.12] dark:ring-violet-500/20">
              {v.icon}
            </div>

            {/* Contenido */}
            <div className="relative">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {v.title}
              </h3>

              <p className="mt-2 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                {v.description}
              </p>
            </div>

            {/* Línea inferior de acento */}
            <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300 group-hover:w-full" />
          </article>
        ))}
      </div>
    </section>
  );
}