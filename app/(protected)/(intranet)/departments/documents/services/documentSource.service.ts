/**
 * @module documentSource.service
 *
 * Facade que unifica el acceso a las fuentes documentales (`my-drive`,
 * `shared`, `corporate-sites`) bajo una única API, para que el hook
 * `useDocumentExplorer` no necesite conocer los scopes ni los detalles
 * internos de cada fuente.
 */

import {
  getMyDriveFolderChildren,
  getMyDriveRootChildren,
  getMyDrivePreviewUrl,
} from "./myDriveDiscovery.service";
import {
  getSharedFolderChildren,
  getSharedWithMe,
  getSharedPreviewUrl,
} from "./sharedWithMeDiscovery.service";
import {
  getSharePointDriveRootChildren,
  getSharePointFolderChildren,
  getSharePointPreviewUrl,
} from "./sharepointDiscovery.service";
import type {
  DocumentItem,
  DocumentLocation,
  DocumentSourceType,
} from "../types/document.types";

/**
 * Carga la vista raíz de una fuente documental.
 *
 * @param corporateLibraryDriveId - Requerido únicamente cuando
 * `source === "corporate-sites"`; es el `driveId` de la biblioteca ya
 * seleccionada por el usuario.
 */
export async function loadSourceRoot(
  source: DocumentSourceType,
  corporateLibraryDriveId?: string
): Promise<DocumentItem[]> {
  switch (source) {
    case "my-drive":
      return getMyDriveRootChildren();
    case "shared":
      return getSharedWithMe();
    case "corporate-sites":
      return corporateLibraryDriveId
        ? getSharePointDriveRootChildren(corporateLibraryDriveId)
        : [];
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
  }
}