/**
 * @module documentDepartment.types
 *
 * Modelos base del módulo de Gestión Documental.
 *
 * @remarks
 * Este archivo define las entidades utilizadas por la capa de presentación
 * y servicios del módulo documental.
 *
 * Los modelos aquí definidos representan el catálogo corporativo de áreas
 * documentales habilitadas dentro de la Intranet y abstraen completamente
 * la estructura interna de Microsoft SharePoint y Microsoft Graph.
 *
 * Ningún componente de interfaz debe depender directamente de entidades
 * provenientes de Graph; toda la aplicación debe consumir estos modelos
 * para mantener un bajo acoplamiento y facilitar futuras migraciones.
 */

/**
 * Representa un área documental corporativa.
 *
 * @remarks
 * Cada instancia corresponde a un subsitio de SharePoint descubierto
 * dinámicamente bajo el sitio raíz del módulo documental (ver
 * `documentSites.ts` y `documentCatalog.service.ts`), enriquecido con
 * cosmética curada opcional (ícono, color, orden) cuando existe.
 *
 * Este modelo constituye la fuente de información utilizada por el sidebar
 * principal del módulo documental y sirve como punto de entrada para cargar
 * bibliotecas, carpetas y documentos asociados a un área específica.
 */
export interface DocumentDepartment {
  /**
   * Identificador interno del catálogo.
   *
   * Debe ser único dentro del módulo documental.
   */
  id: string;

  /**
   * Nombre visible para el usuario.
   *
   * Ejemplo:
   * - Capital Humano
   * - Jurídico
   * - Tecnología
   */
  name: string;

  /**
   * Identificador único del sitio dentro de Microsoft Graph.
   *
   * Este valor es utilizado internamente por los servicios para consultar
   * bibliotecas y contenido documental.
   */
  siteId: string;

  /**
   * URL del sitio de SharePoint.
   */
  siteUrl: string;

  /**
   * Descripción corta del área.
   */
  description?: string;

  /**
   * Nombre del icono asociado al área.
   *
   * La representación visual será resuelta posteriormente por la interfaz.
   */
  icon?: string;

  /**
   * Color de acento utilizado por la interfaz.
   *
   * Ejemplo:
   * - indigo
   * - emerald
   * - blue
   */
  accentColor?: string;

  /**
   * Orden de aparición dentro del menú lateral.
   */
  order: number;

  /**
   * Indica si el área se encuentra habilitada para mostrarse.
   *
   * Permite ocultar temporalmente áreas sin eliminarlas del catálogo.
   */
  enabled: boolean;
}