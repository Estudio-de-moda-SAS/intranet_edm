/**
 * @module announcementUtils
 * Utilidades de presentación para anuncios de la intranet EDM.
 *
 * @remarks
 * Centraliza la lógica visual asociada a las categorías de anuncio,
 * evitando duplicar clases de Tailwind CSS en los componentes de UI.
 * Cualquier cambio en la paleta de categorías debe realizarse únicamente
 * aquí y se propagará automáticamente a todos los tiles que consuman
 * {@link tileBgByCategory}.
 */

import type { AnnouncementCategory } from "@/types/announcement";

// ── Colores por categoría ─────────────────────────────────────────────────────

/**
 * Devuelve las clases de gradiente de Tailwind CSS correspondientes a la
 * categoría de un anuncio, para aplicar como fondo del tile.
 *
 * @remarks
 * Las clases retornadas son del tipo `from-{color} to-{color}` y están
 * diseñadas para usarse junto con `bg-gradient-to-br` (o la dirección que
 * corresponda) en el componente contenedor.
 *
 * Categorías soportadas:
 * | Categoría                    | Gradiente           | Uso previsto                    |
 * |------------------------------|---------------------|---------------------------------|
 * | `TI`                         | violeta → fucsia    | Comunicados de TI               |
 * | `RRHH`                       | rosa → pink         | Comunicados de RRHH             |
 * | `Finanzas`                   | esmeralda → teal    | Comunicados de Finanzas         |
 * | `Juridica`                   | azul → índigo       | Comunicados de Jurídica         |
 * | `Producto`                   | naranja → ámbar     | Comunicados de Producto         |
 * | `Retail`                     | cyan → celeste      | Comunicados de Retail           |
 * | `Servicios Administrativos`  | lima → verde        | Comunicados de Servicios Admin  |
 * | `Documentos`                 | slate neutro        | Comunicados de Documentos       |
 * | _(resto)_                    | slate neutro        | Categorías futuras              |
 *
 * @param cat - Categoría del anuncio según {@link AnnouncementCategory}.
 * @returns Clases de Tailwind para el gradiente de fondo del tile.
 *
 * @example
 * ```tsx
 * <div className={`bg-gradient-to-br ${tileBgByCategory(announcement.category)}`}>
 *   {announcement.title}
 * </div>
 * ```
 */
export function tileBgByCategory(cat: AnnouncementCategory): string {
  switch (cat) {
    case "TI":
      return "from-violet-600 to-fuchsia-600";
    case "RRHH":
      return "from-rose-500 to-pink-500";
    case "Finanzas":
      return "from-emerald-500 to-teal-500";
    case "Juridica":
      return "from-blue-500 to-indigo-500";
    case "Producto":
      return "from-orange-500 to-amber-500";
    case "Retail":
      return "from-cyan-500 to-sky-500";
    case "Servicios Administrativos":
      return "from-lime-500 to-green-500";
    default:
      return "from-slate-500 to-slate-600";
  }
}