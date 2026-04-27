/**
 * @module legal.sharepoint.versions
 * Servicio para obtener y restaurar versiones de archivos en SharePoint.
 *
 * @remarks
 * Permisos de Graph necesarios:
 * - `Files.Read.All`      — para listar versiones
 * - `Files.ReadWrite.All` — para restaurar versiones (requiere legal:manage_documents)
 */

// ─────────────────────────────────────────────────────────────────────────────
// TODO: Implementar cuando haya Admin Consent
// ─────────────────────────────────────────────────────────────────────────────
//
// import { callGraph, callGraphPost } from "@/lib/graph/graphClient";
//
// const SITE_ID  = process.env.SHAREPOINT_SITE_ID!;
// const DRIVE_ID = process.env.SHAREPOINT_DRIVE_ID!;
//
// /** Obtiene el historial de versiones de un archivo */
// export async function getFileVersions(
//   itemId: string,
//   token: string
// ): Promise<FileVersion[]> {
//   const endpoint = `/sites/${SITE_ID}/drives/${DRIVE_ID}/items/${itemId}/versions`;
//   const res = await callGraph<{ value: GraphDriveItemVersion[] }>(token, endpoint);
//   return res.value.map((v) => ({
//     id:          v.id,
//     versionLabel: v.id,                          // Graph devuelve "1.0", "2.0", etc.
//     size:        v.size ?? 0,
//     modifiedAt:  v.lastModifiedDateTime,
//     modifiedBy:  v.lastModifiedBy?.user?.displayName ?? "—",
//     isCurrent:   v.id === res.value[0]?.id,
//     downloadUrl: v["@microsoft.graph.downloadUrl"],
//   }));
// }
//
// /** Restaura una versión anterior como versión actual */
// export async function restoreVersion(
//   itemId: string,
//   versionId: string,
//   token: string
// ): Promise<RestoreResult> {
//   // Graph crea una nueva versión con el contenido de la versión restaurada
//   const endpoint = `/sites/${SITE_ID}/drives/${DRIVE_ID}/items/${itemId}/versions/${versionId}/restoreVersion`;
//   await callGraphPost(token, endpoint, {});
//   return { success: true };
// }
// ─────────────────────────────────────────────────────────────────────────────

/** Versión individual de un archivo en SharePoint */
export interface FileVersion {
  /** ID interno de la versión en Graph (ej. "1.0", "2.0") */
  id:           string;
  /** Etiqueta visible de la versión */
  versionLabel: string;
  /** Tamaño del archivo en esa versión (bytes) */
  size:         number;
  /** Fecha de modificación (ISO 8601) */
  modifiedAt:   string;
  /** Autor de la versión */
  modifiedBy:   string;
  /** Indica si es la versión actualmente activa */
  isCurrent:    boolean;
  /** URL de descarga de esta versión específica */
  downloadUrl:  string | undefined;
}

export interface RestoreResult { success: boolean; error?: string }

/** Retorna el historial de versiones de un archivo (mock) */
export async function getFileVersions(
  _itemId: string,
  _token?: string
): Promise<FileVersion[]> {
  await new Promise((r) => setTimeout(r, 500));
  return MOCK_VERSIONS;
}

/** Restaura una versión anterior como versión actual (mock) */
export async function restoreVersion(
  _itemId: string,
  _versionId: string,
  _token?: string
): Promise<RestoreResult> {
  await new Promise((r) => setTimeout(r, 700));
  return { success: true };
}

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_VERSIONS: FileVersion[] = [
  {
    id:           "4.0",
    versionLabel: "4.0",
    size:         52800,
    modifiedAt:   "2026-04-10T14:30:00Z",
    modifiedBy:   "María Cardona",
    isCurrent:    true,
    downloadUrl:  undefined,
  },
  {
    id:           "3.0",
    versionLabel: "3.0",
    size:         51200,
    modifiedAt:   "2026-03-15T09:00:00Z",
    modifiedBy:   "Andrés Torres",
    isCurrent:    false,
    downloadUrl:  undefined,
  },
  {
    id:           "2.0",
    versionLabel: "2.0",
    size:         49600,
    modifiedAt:   "2026-02-01T11:15:00Z",
    modifiedBy:   "María Cardona",
    isCurrent:    false,
    downloadUrl:  undefined,
  },
  {
    id:           "1.0",
    versionLabel: "1.0",
    size:         47000,
    modifiedAt:   "2026-01-10T08:00:00Z",
    modifiedBy:   "María Cardona",
    isCurrent:    false,
    downloadUrl:  undefined,
  },
];