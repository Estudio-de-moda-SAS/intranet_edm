/**
 * @module driveNavigation.service
 *
 * Navegación genérica de drives de Microsoft Graph.
 *
 * @remarks
 * Toda carpeta —de OneDrive, de un elemento compartido, o de una biblioteca
 * de SharePoint— se navega con la misma primitiva: `driveId` + `itemId`.
 * Centraliza esa navegación y el mapeo hacia {@link DocumentItem} para que
 * las fuentes documentales no dupliquen lógica de fetch ni de mapeo.
 */

import { graphFetchCollection, graphPost, graphUpload  } from "./graphClient";

import type {
  DocumentItem,
  DocumentSourceType,
} from "../types/document.types";

/** Forma cruda de un `driveItem` de Graph, campos relevantes. */
export interface GraphDriveItem {
  id: string;
  name?: string;
  webUrl?: string;
  size?: number;
  createdDateTime?: string;
  lastModifiedDateTime?: string;
  parentReference?: { driveId?: string };
  folder?: { childCount?: number };
  file?: { mimeType?: string };
  "@microsoft.graph.downloadUrl"?: string;
}

function sortDriveItems(items: GraphDriveItem[]) {
  return [...items].sort((a, b) => {
    const aIsFolder = Boolean(a.folder);
    const bIsFolder = Boolean(b.folder);

    if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1;

    return (a.name ?? "").localeCompare(b.name ?? "", "es");
  });
}

/**
 * Convierte un `driveItem` crudo de Graph al modelo unificado
 * {@link DocumentItem}.
 *
 * @param fallbackDriveId - `driveId` a usar si el elemento no trae
 * `parentReference.driveId` (ocurre en algunas respuestas de `/me/drive`).
 */
export function mapToDocumentItem(
  raw: GraphDriveItem,
  source: DocumentSourceType,
  fallbackDriveId: string
): DocumentItem {
  const isFolder = Boolean(raw.folder);
  const driveId = raw.parentReference?.driveId ?? fallbackDriveId;

  return {
    id: raw.id,
    name: raw.name ?? "Sin nombre",
    ...(raw.webUrl !== undefined && { webUrl: raw.webUrl }),
    ...(raw.size !== undefined && { size: raw.size }),
    ...(raw.createdDateTime !== undefined && {
      createdDateTime: raw.createdDateTime,
    }),
    ...(raw.lastModifiedDateTime !== undefined && {
      lastModifiedDateTime: raw.lastModifiedDateTime,
    }),
    isFolder,
    ...(raw.folder?.childCount !== undefined && {
      childCount: raw.folder.childCount,
    }),
    ...(raw.file?.mimeType !== undefined && { mimeType: raw.file.mimeType }),
    source,
    driveId,
    ...(raw["@microsoft.graph.downloadUrl"] !== undefined && {
      downloadUrl: raw["@microsoft.graph.downloadUrl"],
    }),
  };
}

/** Contenido raíz de un drive. Equivale a `GET /drives/{driveId}/root/children`. */
export async function getDriveRootChildren(
  driveId: string,
  source: DocumentSourceType,
  extraScopes: readonly string[]
): Promise<DocumentItem[]> {
  const items = await graphFetchCollection<GraphDriveItem>(
    `/drives/${encodeURIComponent(driveId)}/root/children`,
    extraScopes,
    3
  );

  return sortDriveItems(items).map((item) =>
    mapToDocumentItem(item, source, driveId)
  );
}

/** Contenido de una carpeta. Equivale a `GET /drives/{driveId}/items/{itemId}/children`. */
export async function getDriveFolderChildren(
  driveId: string,
  itemId: string,
  source: DocumentSourceType,
  extraScopes: readonly string[]
): Promise<DocumentItem[]> {
  const items = await graphFetchCollection<GraphDriveItem>(
    `/drives/${encodeURIComponent(driveId)}/items/${encodeURIComponent(
      itemId
    )}/children`,
    extraScopes,
    3
  );

  return sortDriveItems(items).map((item) =>
    mapToDocumentItem(item, source, driveId)
  );
}

interface GraphPreviewResult {
  getUrl?: string;
}

/**
 * Solicita a Graph una URL embebible de previsualización (con token
 * temporal incrustado) para un archivo, sea PDF u Office.
 *
 * @remarks
 * Equivale a `POST /drives/{driveId}/items/{itemId}/preview`.
 */
export async function getDocumentPreviewUrl(
  driveId: string,
  itemId: string,
  extraScopes: readonly string[]
): Promise<string | undefined> {
  const result = await graphPost<GraphPreviewResult>(
    `/drives/${encodeURIComponent(driveId)}/items/${encodeURIComponent(
      itemId
    )}/preview`,
    {},
    extraScopes
  );

  return result.getUrl;
}

/**
 * Sube un archivo a una carpeta de un drive (o a la raíz si `parentItemId`
 * es `null`).
 *
 * @remarks
 * Usa `@microsoft.graph.conflictBehavior=rename`: si ya existe un archivo
 * con el mismo nombre, Graph lo renombra automáticamente en vez de
 * sobrescribirlo (ej. `informe (1).docx`), evitando pérdida de datos.
 */
export async function uploadFileToDriveFolder(
  driveId: string,
  parentItemId: string | null,
  file: File,
  source: DocumentSourceType,
  extraScopes: readonly string[]
): Promise<DocumentItem> {
  const encodedName = encodeURIComponent(file.name);

  const path = parentItemId
    ? `/drives/${encodeURIComponent(driveId)}/items/${encodeURIComponent(
        parentItemId
      )}:/${encodedName}:/content?@microsoft.graph.conflictBehavior=rename`
    : `/drives/${encodeURIComponent(
        driveId
      )}/root:/${encodedName}:/content?@microsoft.graph.conflictBehavior=rename`;

  const raw = await graphUpload<GraphDriveItem>(path, file, extraScopes);
  return mapToDocumentItem(raw, source, driveId);
}