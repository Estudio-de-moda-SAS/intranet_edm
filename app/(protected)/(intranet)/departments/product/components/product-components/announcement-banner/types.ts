/**
 * @module ProductAnnouncementBanner/types
 * Tipos y contratos del banner de comunicados del módulo de Producto.
 */

/**
 * Tipos de anuncio admitidos por el banner de comunicados.
 *
 * @remarks
 * Cada tipo determina la semántica visual del anuncio,
 * incluyendo color, ícono y estilo de resaltado.
 */
export type AnnouncementType = "info" | "warning" | "success" | "urgent";

/**
 * Representa un comunicado mostrado en el banner del módulo.
 *
 * @remarks
 * Este tipo modela un anuncio individual que puede mostrarse
 * dentro del carrusel de comunicados del área de Producto.
 *
 * Cada anuncio puede incluir:
 * - tipo semántico
 * - título principal
 * - mensaje descriptivo
 * - fecha de referencia
 * - llamada a la acción opcional
 *
 * @property id Identificador único del anuncio.
 * @property type Categoría visual del anuncio.
 * @property title Título principal mostrado en el banner.
 * @property message Descripción o detalle del comunicado.
 * @property date Fecha opcional asociada al anuncio.
 * @property actionLabel Texto visible de la acción opcional.
 * @property actionHref Destino de la acción opcional.
 */
export interface Announcement {
  id: string;
  type: AnnouncementType;
  title: string;
  message: string;
  date?: string;
  actionLabel?: string;
  actionHref?: string;
}

/**
 * Propiedades del componente {@link ProductAnnouncementBanner}.
 *
 * @property announcements Listado opcional de anuncios a renderizar.
 * @property autoRotateMs Intervalo opcional de rotación automática en milisegundos.
 * @property className Clases CSS adicionales para el contenedor raíz.
 */
export type BannerProps = {
  announcements?: Announcement[];
  autoRotateMs?: number;
  className?: string;
};