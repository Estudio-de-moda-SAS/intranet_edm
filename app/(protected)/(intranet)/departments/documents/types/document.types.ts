/**
 * @module document.types
 *
 * Modelo documental unificado del Explorador Documental Corporativo.
 *
 * @remarks
 * Abstrae completamente las diferencias entre OneDrive, "Compartido conmigo"
 * y las bibliotecas de SharePoint (Áreas Corporativas). Ningún componente
 * de interfaz o hook debe depender de tipos crudos de Microsoft Graph
 * (`driveItem`, `site`, `drive`); toda la capa de presentación consume
 * exclusivamente los modelos definidos aquí.
 */

/**
 * Fuente documental soportada por el explorador.
 *
 * @remarks
 * - `my-drive`: OneDrive del usuario autenticado.
 * - `shared`: elementos compartidos con el usuario (`/me/drive/sharedWithMe`).
 * - `corporate-sites`: bibliotecas de SharePoint del catálogo de áreas.
 */
export type DocumentSourceType = "my-drive" | "shared" | "corporate-sites";

/**
 * Referencia mínima para navegar cualquier ubicación documental mediante
 * Graph, independientemente de la fuente de origen.
 *
 * @remarks
 * Toda carpeta, biblioteca o raíz de drive se direcciona con el par
 * `driveId` + `itemId` (`itemId: null` para la raíz del drive). Esto es
 * lo que permite que la navegación sea genérica entre fuentes.
 */
export interface DocumentLocation {
  driveId: string;
  itemId: string | null;
}

/** Elemento documental unificado (archivo o carpeta). */
/** Elemento documental unificado (archivo o carpeta). */
export interface DocumentItem {
  id: string;
  name: string;
  webUrl?: string;
  size?: number;
  createdDateTime?: string;
  lastModifiedDateTime?: string;
  isFolder: boolean;
  childCount?: number;
  mimeType?: string;
  source: DocumentSourceType;

  /** Drive al que pertenece este elemento (siempre presente). */
  driveId: string;

  /** URL de descarga directa provista por Graph (`@microsoft.graph.downloadUrl`). */
  downloadUrl?: string;

  /** Propietario original; solo relevante para la fuente `shared`. */
  sharedBy?: string;
}

/** Breadcrumb genérico, válido para cualquier fuente documental. */
export interface DocumentBreadcrumbItem {
  id: string;
  name: string;
  location: DocumentLocation;
}