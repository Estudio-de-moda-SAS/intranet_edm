/**
 * @module documentQuickLinks
 * Configuración de accesos rápidos del módulo de Gestión Documental.
 *
 * Define los enlaces principales que permiten al usuario navegar rápidamente
 * hacia las funcionalidades clave del sistema documental.
 *
 * @remarks
 * Estos accesos son utilizados en componentes de UI como:
 * - QuickLinksSection
 * - dashboards del módulo documental
 *
 * Permiten mejorar la eficiencia del usuario al reducir la navegación manual.
 */

/**
 * Representa un acceso rápido dentro del módulo documental.
 *
 * @interface DocumentQuickLink
 * @property title Título visible del acceso.
 * @property description Descripción breve de la funcionalidad.
 * @property href Ruta interna dentro de la aplicación.
 */
export type DocumentQuickLink = {
  title: string;
  description: string;
  href: string;
};

/**
 * Lista de accesos rápidos del módulo de Gestión Documental.
 *
 * @remarks
 * Cada elemento corresponde a una funcionalidad crítica del sistema:
 * - Creación de documentos
 * - Flujo de aprobaciones
 * - Búsqueda en repositorio
 * - Control de vencimientos
 *
 * Estos enlaces pueden ser extendidos en el futuro con:
 * - control de permisos
 * - acciones dinámicas (modales, callbacks)
 * - iconografía o categorización visual
 */
export const documentQuickLinks: DocumentQuickLink[] = [
  {
    title: "Nuevo documento",
    description: "Crear y registrar documento",
    href: "/documentos/nuevo",
  },
  {
    title: "Pendientes aprobación",
    description: "Documentos esperando firma",
    href: "/documentos/aprobaciones",
  },
  {
    title: "Buscar documentos",
    description: "Explorar repositorio documental",
    href: "/documentos/buscar",
  },
  {
    title: "Control de vencimientos",
    description: "Documentos próximos a vencer",
    href: "/documentos/vencimientos",
  },
];