/**
 * @module CompanyCanalesSection
 * Sección de canales de distribución de la compañía.
 *
 * @remarks
 * Este componente presenta los principales canales comerciales de la empresa
 * en un formato visual tipo grid, resaltando:
 *
 * - orden o numeración del canal
 * - nombre del canal
 * - descripción funcional
 *
 * Es un **Server Component**, ya que:
 *
 * - no utiliza estado ni hooks
 * - renderiza datos estáticos definidos localmente
 * - no depende de interacción del usuario
 *
 * Forma parte de la página corporativa y comunica cómo la empresa
 * distribuye sus productos en el mercado.
 */

// ✅ SERVER COMPONENT

/* -------------------------------------------------------------------------- */
/* Configuración de canales                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Lista de canales de distribución.
 *
 * @remarks
 * Cada canal incluye:
 *
 * - `num`: orden visual (no necesariamente ID lógico)
 * - `name`: nombre del canal
 * - `desc`: descripción breve del canal
 */
const CANALES = [
  {
    num: "1",
    name: "Tiendas propias",
    desc: "Puntos de venta en los principales centros comerciales del país",
  },
  {
    num: "2",
    name: "Wholesale",
    desc: "Socios comerciales con cobertura en más de 50 ciudades",
  },
  {
    num: "3",
    name: "E-commerce",
    desc: "Tienda online propia con envíos a todo Colombia",
  },
  {
    num: "4",
    name: "Marketplaces",
    desc: "Presencia en los principales marketplaces colombianos",
  },
];

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Sección de canales de distribución.
 *
 * @returns Grid visual con los canales comerciales de la empresa.
 *
 * @remarks
 * Los canales se renderizan en una grilla fija de **4 columnas**,
 * donde cada elemento representa un canal de distribución.
 *
 * Características del layout:
 *
 * - numeración destacada como elemento visual principal
 * - separación por bordes verticales entre columnas
 * - hover visual para mejorar la interacción
 *
 * ⚠️ Importante:
 *
 * La lógica de bordes depende directamente del tamaño del array:
 *
 * ```ts
 * borderRight: i < CANALES.length - 1
 * ```
 *
 * Esto asume que todos los elementos están en una sola fila.
 * Si en el futuro:
 *
 * - se agregan más canales
 * - o se hace responsive el grid
 *
 * esta lógica deberá ajustarse.
 *
 * @example
 * ```tsx
 * <CompanyCanalesSection />
 * ```
 */
export function CompanyCanalesSection() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
        <span className="h-[6px] w-[6px] flex-shrink-0 rounded-full bg-violet-600" />
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          Canales de distribución
        </p>
      </div>

      {/* Grid de canales */}
      <div className="grid grid-cols-4">
        {CANALES.map((canal, index) => (
          <div
            key={canal.num}
            className="px-5 py-6 text-center transition-colors hover:bg-violet-50/50 dark:hover:bg-gray-800"
            style={{
              borderRight:
                index < CANALES.length - 1
                  ? "0.5px solid rgb(226 232 240)"
                  : "none",
            }}
          >
            {/* Número */}
            <p
              className="mb-1 text-[36px] font-black leading-none text-violet-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {canal.num}
            </p>

            {/* Nombre */}
            <p className="mb-1 text-[12px] font-semibold text-slate-700 dark:text-slate-200">
              {canal.name}
            </p>

            {/* Descripción */}
            <p className="text-[11px] leading-[1.45] text-slate-400">
              {canal.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}