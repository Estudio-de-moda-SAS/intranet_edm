/**
 * @module types/announcement
 * Tipos para el sistema de anuncios corporativos de la intranet EDM.
 *
 * @remarks
 * Los anuncios son comunicados publicados por los departamentos para
 * informar a todos los colaboradores sobre novedades, cambios o eventos
 * relevantes. Se muestran en el homepage y en la sección de noticias.
 */

import { DEPARTMENTS } from "@/config/config";

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Categoría de un anuncio corporativo derivada dinámicamente de los
 * labels de {@link DEPARTMENTS} en `lib/config.ts`.
 *
 * @remarks
 * Al derivarse de `DEPARTMENTS`, cualquier departamento nuevo que se
 * agregue a la configuración estará automáticamente disponible como
 * categoría válida sin necesidad de actualizar este tipo manualmente.
 *
 * Valores actuales: `"Finanzas"` | `"Juridica"` | `"Producto"` |
 * `"Retail"` | `"RRHH"` | `"Servicios Administrativos"` | `"TI"` |
 * `"Documentos"`.
 */
export type AnnouncementCategory = typeof DEPARTMENTS[number]["label"];

/**
 * Anuncio corporativo publicado en la intranet EDM.
 *
 * @remarks
 * Los anuncios se obtienen desde SharePoint a través de Microsoft Graph
 * en producción. En desarrollo se sirven desde los datos mock de
 * `getHomeData`.
 *
 * El campo `excerpt` es opcional — cuando no está disponible, el
 * componente consumidor debe truncar el `title` o mostrar un placeholder.
 * El campo `imageUrl` es opcional — los tiles sin imagen muestran un
 * fondo de gradiente determinado por {@link AnnouncementCategory}.
 */
export type Announcement = {
  /** Identificador único del anuncio. */
  id: string;

  /** Título del anuncio tal como aparece en el tile. */
  title: string;

  /**
   * Resumen corto del contenido del anuncio.
   * `undefined` si el anuncio no tiene extracto configurado.
   */
  excerpt?: string;

  /** Fecha de publicación en formato ISO 8601 (ej. `"2026-03-10"`). */
  date: string;

  /** Categoría del anuncio que determina el color del tile en la UI. */
  category: AnnouncementCategory;

  /**
   * URL de la imagen de portada del anuncio.
   * `undefined` si el anuncio no tiene imagen — se muestra gradiente
   * de color según {@link AnnouncementCategory}.
   */
  imageUrl?: string;
};