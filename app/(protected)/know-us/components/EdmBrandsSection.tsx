/**
 * @module CompanyBrandsSection
 * Sección de portafolio de marcas de la compañía.
 *
 * @remarks
 * Este componente presenta las marcas que forman parte del portafolio de EDM,
 * destacando su origen y relación histórica con la empresa.
 *
 * Es un **Server Component**, ya que:
 *
 * - no utiliza hooks ni estado
 * - renderiza datos estáticos
 * - no depende de interacción del usuario
 *
 * Forma parte de la página corporativa y comunica el posicionamiento
 * de la empresa como multimarca en el sector moda.
 */

// ✅ SERVER COMPONENT

/* -------------------------------------------------------------------------- */
/* Configuración de marcas                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Lista de marcas del portafolio.
 *
 * @remarks
 * Cada marca incluye:
 *
 * - `name`: nombre comercial
 * - `origin`: país de origen o tipo (propia/internacional)
 * - `since`: relación histórica con EDM
 *
 * ⚠️ Nota:
 * Actualmente el identificador implícito es `name`.
 * En entornos reales se recomienda usar un `id` único.
 */
const BRANDS = [
  { name: "Diesel",              origin: "Italia",            since: "EDM desde 1989" },
  { name: "Kipling",             origin: "Bélgica",           since: "EDM desde 2000" },
  { name: "Superdry",            origin: "Reino Unido",       since: "EDM portafolio" },
  { name: "Marithé F. Girbaud",  origin: "Francia",           since: "EDM desde 1985" },
  { name: "Pilatos",             origin: "Colombia · Propia", since: "Marca EDM"      },
];

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Sección de portafolio de marcas.
 *
 * @returns Grid visual con las marcas del portafolio EDM.
 *
 * @remarks
 * Las marcas se presentan en un layout tipo grid de **5 columnas fijas**,
 * donde cada celda contiene:
 *
 * - nombre de la marca (principal)
 * - país de origen
 * - relación con la empresa (timeline / posicionamiento)
 *
 * Características visuales:
 *
 * - tipografía serif para reforzar branding premium
 * - alineación centrada tipo showcase
 * - separación por bordes verticales
 * - hover suave para feedback visual
 *
 * ⚠️ Importante:
 *
 * El layout está diseñado específicamente para 5 elementos:
 *
 * ```tsx
 * grid grid-cols-5
 * ```
 *
 * Si se agregan o eliminan marcas:
 *
 * - el diseño puede romperse visualmente
 * - los bordes laterales pueden quedar incorrectos
 *
 * La lógica de bordes depende de:
 *
 * ```ts
 * i < BRANDS.length - 1
 * ```
 *
 * lo cual asume una sola fila.
 *
 * @example
 * ```tsx
 * <CompanyBrandsSection />
 * ```
 */
export function CompanyBrandsSection() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
        <span className="h-[6px] w-[6px] flex-shrink-0 rounded-full bg-violet-600" />
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          Portafolio de marcas
        </p>
      </div>

      {/* Grid de marcas */}
      <div className="grid grid-cols-5">
        {BRANDS.map((brand, index) => (
          <div
            key={brand.name}
            className="px-4 py-6 text-center transition-colors hover:bg-violet-50/50 dark:hover:bg-gray-800"
            style={{
              borderRight:
                index < BRANDS.length - 1
                  ? "0.5px solid rgb(226 232 240)"
                  : "none",
            }}
          >
            {/* Nombre */}
            <p
              className="mb-1 text-[15px] font-bold leading-snug text-slate-700 dark:text-slate-200"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {brand.name}
            </p>

            {/* Origen */}
            <p className="text-[10px] uppercase tracking-[0.08em] text-slate-400">
              {brand.origin}
            </p>

            {/* Relación histórica */}
            <p className="mt-1 text-[11px] font-medium text-violet-600">
              {brand.since}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}