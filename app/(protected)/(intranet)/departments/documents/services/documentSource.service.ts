/**
 * @module documentSource.service
 *
 * Facade que unifica el acceso a las fuentes documentales (`my-drive`,
 * `shared`, `corporate-sites`, `teams`) bajo una única API, para que el
 * hook `useDocumentExplorer` no necesite conocer los scopes ni los
 * detalles internos de cada fuente.
 */

import {
  getMyDriveFolderChildren,
  getMyDrivePreviewUrl,
  getMyDriveRootChildren,
} from "./myDriveDiscovery.service";
import {
  getSharedFolderChildren,
  getSharedPreviewUrl,
  getSharedWithMe,
} from "./sharedWithMeDiscovery.service";
import {
  getSharePointDriveRootChildren,
  getSharePointFolderChildren,
  getSharePointPreviewUrl,
  uploadSharePointFile,
} from "./sharepointDiscovery.service";
import {
  getMyTeamDriveRootChildren,
  getMyTeamFolderChildren,
  getMyTeamPreviewUrl,
} from "./teamsDriveDiscovery.service";
import type {
  DocumentItem,
  DocumentLocation,
  DocumentSourceType,
} from "../types/document.types";

/**
 * Carga la vista raíz de una fuente documental.
 *
 * @param libraryDriveId - Requerido para `corporate-sites` (biblioteca de
 * SharePoint seleccionada) y `teams` (equipo seleccionado); es el
 * `driveId` de la biblioteca/equipo ya elegido por el usuario.
 */
export async function loadSourceRoot(
  source: DocumentSourceType,
  libraryDriveId?: string
): Promise<DocumentItem[]> {
  switch (source) {
    case "my-drive":
      return getMyDriveRootChildren();
    case "shared":
      return getSharedWithMe();
    case "corporate-sites":
      return libraryDriveId
        ? getSharePointDriveRootChildren(libraryDriveId)
        : [];
    case "teams":
      return libraryDriveId ? getMyTeamDriveRootChildren(libraryDriveId) : [];
  }
}

/** Carga el contenido de una carpeta, sin importar la fuente a la que pertenece. */
export async function loadFolderChildren(
  location: DocumentLocation,
  source: DocumentSourceType
): Promise<DocumentItem[]> {
  if (!location.itemId) return [];

  switch (source) {
    case "my-drive":
      return getMyDriveFolderChildren(location.itemId);
    case "shared":
      return getSharedFolderChildren(location.driveId, location.itemId);
    case "corporate-sites":
      return getSharePointFolderChildren(location.driveId, location.itemId);
    case "teams":
      return getMyTeamFolderChildren(location.driveId, location.itemId);
  }
}

/**
 * Solicita la URL de previsualización de un documento, sin importar
 * su fuente de origen.
 */
export async function loadDocumentPreviewUrl(
  item: DocumentItem
): Promise<string | undefined> {
  if (item.isFolder) return undefined;

  switch (item.source) {
    case "my-drive":
      return getMyDrivePreviewUrl(item.id);
    case "shared":
      return getSharedPreviewUrl(item.driveId, item.id);
    case "corporate-sites":
      return getSharePointPreviewUrl(item.driveId, item.id);
    case "teams":
      return getMyTeamPreviewUrl(item.driveId, item.id);
  }
}

/**
 * Sube un archivo a la ubicación actual (carpeta o raíz de biblioteca),
 * sin importar la fuente a la que pertenece.
 *
 * @remarks
 * Por ahora solo `corporate-sites` soporta escritura (requiere el scope
 * `Files.ReadWrite.All`, ya aprobado). Las demás fuentes lanzan un error
 * explícito — el botón de subida debe ocultarse fuera de ese contexto.
 */
export async function uploadDocument(
  location: DocumentLocation,
  source: DocumentSourceType,
  file: File
): Promise<DocumentItem> {
  switch (source) {
    case "corporate-sites":
      return uploadSharePointFile(location.driveId, location.itemId, file);
    case "my-drive":
    case "shared":
    case "teams":
      throw new Error(
        `La subida de archivos no está disponible para la fuente "${source}" todavía.`
      );
  }
}