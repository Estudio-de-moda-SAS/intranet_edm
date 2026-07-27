/**
 * @module sharedWithMeDiscovery.service
 *
 * Fuente documental "Compartidos conmigo".
 *
 * @remarks
 * Consulta `/me/drive/sharedWithMe`, que retorna referencias (`remoteItem`)
 * hacia elementos en drives de terceros. La navegación dentro de una
 * carpeta compartida se delega en {@link driveNavigation.service} usando
 * el `driveId`/`itemId` remoto. Requiere el scope `Files.Read.All`.
 */

import { graphFetchCollection } from "./graphClient";
import {
  getDriveFolderChildren,
  mapToDocumentItem,
  type GraphDriveItem,
} from "./driveNavigation.service";
import type { DocumentItem } from "../types/document.types";
import { getDocumentPreviewUrl } from "./driveNavigation.service";

const SHARED_SCOPES = ["Files.Read.All"] as const;
const SOURCE = "shared" as const;

interface GraphRemoteItem extends GraphDriveItem {
  remoteItem?: GraphDriveItem & {
    parentReference?: { driveId?: string };
    shared?: { owner?: { user?: { displayName?: string } } };
  };
}

/**
 * Elementos compartidos con el usuario autenticado.
 *
 * @remarks
 * Cada elemento se normaliza usando `driveId`/`itemId` de `remoteItem`,
 * que es la referencia real necesaria para navegar dentro de él.
 */
export async function getSharedWithMe(): Promise<DocumentItem[]> {
  const raw = await graphFetchCollection<GraphRemoteItem>(
    "/me/drive/sharedWithMe",
    SHARED_SCOPES,
    3
  );

  return raw
    .filter((item) => item.remoteItem?.parentReference?.driveId)
    .map((item) => {
      const remote = item.remoteItem!;
      const driveId = remote.parentReference!.driveId!;

      const mapped = mapToDocumentItem(
        { ...remote, id: remote.id ?? item.id },
        SOURCE,
        driveId
      );

      const sharedBy = remote.shared?.owner?.user?.displayName;

      return sharedBy ? { ...mapped, sharedBy } : mapped;
    });
}

/** Contenido de una carpeta dentro de un elemento compartido. */
export async function getSharedFolderChildren(
  driveId: string,
  itemId: string
): Promise<DocumentItem[]> {
  return getDriveFolderChildren(driveId, itemId, SOURCE, SHARED_SCOPES);
}
/** URL de previsualización embebible para un archivo compartido. */
export async function getSharedPreviewUrl(
  driveId: string,
  itemId: string
): Promise<string | undefined> {
  return getDocumentPreviewUrl(driveId, itemId, SHARED_SCOPES);
}