/**
 * @module legal.sharepoint.mutations
 * Operaciones de escritura sobre carpetas de SharePoint para el módulo jurídico.
 *
 * @remarks
 * Requiere permiso `legal:manage_documents` en el AccessLevel del usuario.
 *
 * Permisos de Graph necesarios (adicionales a los de lectura):
 * - `Files.ReadWrite.All` — subir, renombrar y reemplazar archivos
 * - `Sites.Manage.All`   — eliminar items
 *
 * Todas las funciones están en modo bypass/mock hasta que haya Admin Consent.
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
// /** Sube un archivo nuevo a la carpeta indicada */
// export async function uploadFile(
//   siteRelativePath: string,
//   file: File,
//   token: string
// ): Promise<void> {
//   const endpoint = `/sites/${SITE_ID}/drives/${DRIVE_ID}/root:/${siteRelativePath}/${file.name}:/content`;
//   await callGraphPost(token, endpoint, file, { "Content-Type": file.type });
// }
//
// /** Renombra un item (archivo o carpeta) */
// export async function renameItem(
//   itemId: string,
//   newName: string,
//   token: string
// ): Promise<void> {
//   const endpoint = `/sites/${SITE_ID}/drives/${DRIVE_ID}/items/${itemId}`;
//   await callGraphPatch(token, endpoint, { name: newName });
// }
//
// /** Sube una nueva versión de un archivo existente */
// export async function replaceFile(
//   siteRelativePath: string,
//   fileName: string,
//   file: File,
//   token: string
// ): Promise<void> {
//   // Mismo endpoint que upload — SharePoint crea versión automáticamente si está activado
//   const endpoint = `/sites/${SITE_ID}/drives/${DRIVE_ID}/root:/${siteRelativePath}/${fileName}:/content`;
//   await callGraphPost(token, endpoint, file, { "Content-Type": file.type });
// }
//
// /** Elimina un item (mueve a papelera de SharePoint) */
// export async function deleteItem(
//   itemId: string,
//   token: string
// ): Promise<void> {
//   const endpoint = `/sites/${SITE_ID}/drives/${DRIVE_ID}/items/${itemId}`;
//   await callGraphDelete(token, endpoint);
// }
// ─────────────────────────────────────────────────────────────────────────────

import type { SharePointDocument } from "@/types/sharepoint";

export interface UploadResult   { success: boolean; error?: string }
export interface RenameResult   { success: boolean; error?: string }
export interface ReplaceResult  { success: boolean; error?: string }
export interface DeleteResult   { success: boolean; error?: string }

/** Simula subida de archivo (mock) */
export async function uploadFile(
  _siteRelativePath: string,
  file: File
): Promise<UploadResult> {
  await new Promise((r) => setTimeout(r, 900));
  return { success: true };
}

/** Simula renombrado de item (mock) */
export async function renameItem(
  _item: SharePointDocument,
  _newName: string
): Promise<RenameResult> {
  await new Promise((r) => setTimeout(r, 600));
  return { success: true };
}

/** Simula reemplazo de archivo (mock) */
export async function replaceFile(
  _item: SharePointDocument,
  _file: File
): Promise<ReplaceResult> {
  await new Promise((r) => setTimeout(r, 900));
  return { success: true };
}

/** Simula eliminación de item (mock) */
export async function deleteItem(
  _item: SharePointDocument
): Promise<DeleteResult> {
  await new Promise((r) => setTimeout(r, 500));
  return { success: true };
}

export interface CreateFolderResult { success: boolean; error?: string }

/** Simula creación de carpeta (mock) */
export async function createFolder(
  _siteRelativePath: string,
  _folderName: string
): Promise<CreateFolderResult> {
  await new Promise((r) => setTimeout(r, 600));
  return { success: true };
}

// TODO Graph:
// export async function createFolder(
//   siteRelativePath: string,
//   folderName: string,
//   token: string
// ): Promise<CreateFolderResult> {
//   const endpoint = `/sites/${SITE_ID}/drives/${DRIVE_ID}/root:/${siteRelativePath}:/children`;
//   await callGraphPost(token, endpoint, {
//     name: folderName,
//     folder: {},
//     "@microsoft.graph.conflictBehavior": "rename",
//   });
//   return { success: true };
// }