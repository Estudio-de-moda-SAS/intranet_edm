/**
 * @module myDriveDiscovery.service
 *
 * Fuente documental "Mi Unidad" (OneDrive del usuario autenticado).
 *
 * @remarks
 * Resuelve el `driveId` del OneDrive personal y delega la navegación en
 * {@link driveNavigation.service}. Requiere el scope `Files.Read.All`.
 */

import { graphFetch } from "./graphClient";
import {
  getDriveFolderChildren,
  getDriveRootChildren,
} from "./driveNavigation.service";
import type { DocumentItem } from "../types/document.types";
import { getDocumentPreviewUrl } from "./driveNavigation.service";

const MY_DRIVE_SCOPES = ["Files.Read.All"] as const;
const SOURCE = "my-drive" as const;

interface GraphDrive {
  id: string;
}

let cachedMyDriveId: string | null = null;

/**
 * Resuelve y cachea en memoria el `driveId` del OneDrive del usuario
 * autenticado (no cambia durante la sesión).
 */
export async function getMyDriveId(): Promise<string> {
  if (cachedMyDriveId) return cachedMyDriveId;

  const drive = await graphFetch<GraphDrive>("/me/drive", MY_DRIVE_SCOPES);
  cachedMyDriveId = drive.id;
  return drive.id;
}

/** Contenido de la raíz del OneDrive del usuario autenticado. */
export async function getMyDriveRootChildren(): Promise<DocumentItem[]> {
  const driveId = await getMyDriveId();
  return getDriveRootChildren(driveId, SOURCE, MY_DRIVE_SCOPES);
}

/** Contenido de una carpeta dentro del OneDrive del usuario autenticado. */
export async function getMyDriveFolderChildren(
  itemId: string
): Promise<DocumentItem[]> {
  const driveId = await getMyDriveId();
  return getDriveFolderChildren(driveId, itemId, SOURCE, MY_DRIVE_SCOPES);
}
/** URL de previsualización embebible para un archivo del OneDrive del usuario. */
export async function getMyDrivePreviewUrl(
  itemId: string
): Promise<string | undefined> {
  const driveId = await getMyDriveId();
  return getDocumentPreviewUrl(driveId, itemId, MY_DRIVE_SCOPES);
}