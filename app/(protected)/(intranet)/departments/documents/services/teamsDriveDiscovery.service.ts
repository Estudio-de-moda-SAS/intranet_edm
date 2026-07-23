/**
 * @module teamsDriveDiscovery.service
 *
 * Fuente documental "Mis equipos": bibliotecas de documentos de los
 * Microsoft 365 Groups (Teams) a los que pertenece el usuario autenticado,
 * descubiertas por membresía real — no requieren un enlace de compartición.
 *
 * @remarks
 * Requiere `User.Read` (ya incluido en los scopes base de sesión) para
 * listar las membresías del usuario vía `/me/memberOf`, y `Files.Read.All`
 * para leer la biblioteca de documentos de cada equipo vía `/groups/{id}/drive`.
 */

import { graphFetch, graphFetchCollection } from "./graphClient";
import {
  getDocumentPreviewUrl,
  getDriveFolderChildren,
  getDriveRootChildren,
} from "./driveNavigation.service";
import type { DocumentItem } from "../types/document.types";

const TEAMS_SCOPES = ["Files.Read.All"] as const;
const MEMBEROF_SCOPES = ["User.Read"] as const;
const SOURCE = "teams" as const;

interface GraphDirectoryObject {
  "@odata.type"?: string;
  id: string;
  displayName?: string;
  groupTypes?: string[];
}

interface GraphDrive {
  id: string;
  webUrl?: string;
}

export interface TeamDriveDiscoveryResult {
  /** `driveId` de la biblioteca de documentos del equipo. */
  id: string;
  name?: string;
  webUrl?: string;
}

function sortByName<T extends { name?: string }>(items: T[]) {
  return [...items].sort((a, b) =>
    (a.name ?? "").localeCompare(b.name ?? "", "es")
  );
}

/**
 * Grupos Microsoft 365 (Teams) a los que pertenece el usuario autenticado.
 *
 * @remarks
 * Filtra únicamente grupos unificados (`groupTypes` incluye `"Unified"`),
 * que son los que exponen una biblioteca de documentos (`drive`). Otros
 * tipos de membresía (roles de directorio, unidades administrativas,
 * grupos de seguridad puros) se descartan.
 */
async function getMyUnifiedGroups(): Promise<GraphDirectoryObject[]> {
  const members = await graphFetchCollection<GraphDirectoryObject>(
    "/me/memberOf?$select=id,displayName,groupTypes",
    MEMBEROF_SCOPES,
    3
  );

  return members.filter(
    (member) =>
      member["@odata.type"] === "#microsoft.graph.group" &&
      member.groupTypes?.includes("Unified")
  );
}

/**
 * Bibliotecas de documentos (drives) de los equipos a los que pertenece
 * el usuario autenticado.
 *
 * @remarks
 * Resuelve `/groups/{id}/drive` por cada grupo unificado. Los grupos sin
 * biblioteca de documentos disponible se omiten silenciosamente (no
 * interrumpen la carga de los demás).
 */
export async function getMyTeamDrives(): Promise<TeamDriveDiscoveryResult[]> {
  const groups = await getMyUnifiedGroups();

  const results = await Promise.allSettled(
    groups.map(async (group) => {
      const drive = await graphFetch<GraphDrive>(
        `/groups/${encodeURIComponent(group.id)}/drive`,
        TEAMS_SCOPES
      );

      const teamDrive: TeamDriveDiscoveryResult = {
        id: drive.id,
        ...(group.displayName !== undefined && { name: group.displayName }),
        ...(drive.webUrl !== undefined && { webUrl: drive.webUrl }),
      };

      return teamDrive;
    })
  );
  const drives = results.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : []
  );

  return sortByName(drives);
}

/** Contenido raíz de la biblioteca de un equipo. */
export async function getMyTeamDriveRootChildren(
  driveId: string
): Promise<DocumentItem[]> {
  return getDriveRootChildren(driveId, SOURCE, TEAMS_SCOPES);
}

/** Contenido de una carpeta dentro de la biblioteca de un equipo. */
export async function getMyTeamFolderChildren(
  driveId: string,
  itemId: string
): Promise<DocumentItem[]> {
  return getDriveFolderChildren(driveId, itemId, SOURCE, TEAMS_SCOPES);
}

/** URL de previsualización embebible para un archivo de la biblioteca de un equipo. */
export async function getMyTeamPreviewUrl(
  driveId: string,
  itemId: string
): Promise<string | undefined> {
  return getDocumentPreviewUrl(driveId, itemId, TEAMS_SCOPES);
}