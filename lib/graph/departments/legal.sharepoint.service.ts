/**
 * @module legal.sharepoint.service
 * Servicio de SharePoint para el módulo jurídico.
 *
 * @remarks
 * Obtiene el listado de items (archivos y carpetas) de una ruta de SharePoint
 * vía Microsoft Graph. Actualmente retorna datos mock mientras no haya
 * Admin Consent en el tenant.
 *
 * Permisos necesarios:
 * - `Sites.Read.All` — para acceder a bibliotecas de SharePoint
 * - `Files.Read.All` — para listar archivos y carpetas
 */

import type { SharePointDocument } from "@/types/sharepoint";

// ─────────────────────────────────────────────────────────────────────────────
// TODO: Implementar cuando haya Admin Consent
// ─────────────────────────────────────────────────────────────────────────────
//
// import { callGraph } from "@/lib/graph/graphClient";
//
// const SITE_ID  = process.env.SHAREPOINT_SITE_ID!;
// const DRIVE_ID = process.env.SHAREPOINT_DRIVE_ID!;
//
// export async function getLegalFolderDocuments(
//   siteRelativePath: string,
//   token: string
// ): Promise<SharePointDocument[]> {
//   const endpoint = `/sites/${SITE_ID}/drives/${DRIVE_ID}/root:/${siteRelativePath}:/children`;
//   const res = await callGraph<{ value: GraphDriveItem[] }>(token, endpoint);
//   return res.value.map(driveItemToDocument);
// }
//
// function driveItemToDocument(item: GraphDriveItem): SharePointDocument {
//   const isFolder = !!item.folder;
//   const ext      = isFolder ? "" : (item.name.split(".").pop()?.toLowerCase() ?? "");
//   return {
//     id:         item.id,
//     name:       item.name,
//     kind:       isFolder ? "folder" : "file",
//     extension:  ext,
//     size:       item.size ?? 0,
//     modifiedAt: item.lastModifiedDateTime,
//     modifiedBy: item.lastModifiedBy?.user?.displayName ?? "—",
//     webUrl:     item.webUrl,
//     downloadUrl: isFolder ? "" : (item["@microsoft.graph.downloadUrl"] ?? ""),
//     previewUrl: isFolder ? undefined :
//       ext === "pdf"
//         ? item["@microsoft.graph.downloadUrl"]
//         : `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(item.webUrl)}`,
//     ...(isFolder && { childCount: item.folder?.childCount ?? 0 }),
//   };
// }
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retorna los items (archivos y carpetas) de una ruta de SharePoint.
 *
 * @param siteRelativePath - Ruta relativa dentro del sitio SharePoint.
 * @param _token - Token de acceso (no usado en modo bypass).
 */
export async function getLegalFolderDocuments(
  siteRelativePath: string,
  _token?: string
): Promise<SharePointDocument[]> {
  const bypass = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";
  if (bypass || !_token) return getMockItems(siteRelativePath);
  return getMockItems(siteRelativePath);
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA — refleja una estructura realista con subcarpetas
// ─────────────────────────────────────────────────────────────────────────────

function folder(
  id: string,
  name: string,
  modifiedBy: string,
  modifiedAt: string,
  childCount: number
): SharePointDocument {
  return {
    id, name,
    kind:        "folder",
    extension:   "",
    size:        0,
    modifiedAt,
    modifiedBy,
    webUrl:      "#",
    downloadUrl: "",
    previewUrl:  undefined,
    childCount,
  };
}

function file(
  id: string,
  name: string,
  ext: string,
  size: number,
  modifiedBy: string,
  modifiedAt: string
): SharePointDocument {
  return {
    id, name,
    kind:        "file",
    extension:   ext,
    size,
    modifiedAt,
    modifiedBy,
    webUrl:      "#",
    downloadUrl: "#",
    previewUrl:  undefined,
  };
}

/**
 * Árbol mock de items por ruta.
 *
 * Las claves son rutas relativas. Cuando el usuario navega a una subcarpeta,
 * el visor llama a este servicio con la ruta extendida.
 */
const MOCK_TREE: Record<string, SharePointDocument[]> = {

  // ── gsjuridica: Formatos Básicos ──────────────────────────────────────────
  "juridica/gsjuridica_formatosbasicos": [
    folder("fmt-f01", "Contratos",           "María Cardona",  "2026-03-15T10:00:00Z", 4),
    folder("fmt-f02", "Poderes y Mandatos",  "Andrés Torres",  "2026-02-20T09:00:00Z", 2),
    folder("fmt-f03", "Actas y Acuerdos",    "María Cardona",  "2026-01-10T08:00:00Z", 3),
    file("fmt-001", "Checklist_Revisión_Contratos.xlsx",      "xlsx", 52100,  "Andrés Torres", "2026-02-15T08:00:00Z"),
    file("fmt-002", "Guía_Uso_Formatos_Jurídicos_2026.pdf",   "pdf",  180000, "María Cardona", "2026-01-05T09:00:00Z"),
  ],
  "juridica/gsjuridica_formatosbasicos/Contratos": [
    file("fmt-c01", "Formato_Contrato_Prestacion_Servicios.docx", "docx", 45200, "María Cardona",  "2026-03-15T10:30:00Z"),
    file("fmt-c02", "Formato_Otrosí_Contrato.docx",               "docx", 38100, "María Cardona",  "2026-02-28T09:00:00Z"),
    file("fmt-c03", "Formato_Contrato_Arrendamiento.docx",        "docx", 41000, "Andrés Torres",  "2026-01-20T11:00:00Z"),
    file("fmt-c04", "Formato_Contrato_Laboral.docx",              "docx", 39500, "María Cardona",  "2026-03-01T08:00:00Z"),
  ],
  "juridica/gsjuridica_formatosbasicos/Poderes y Mandatos": [
    file("fmt-p01", "Formato_Poder_Especial.docx",   "docx", 27500, "Andrés Torres", "2026-01-10T14:00:00Z"),
    file("fmt-p02", "Formato_Poder_General.docx",    "docx", 29000, "Andrés Torres", "2026-01-10T14:30:00Z"),
  ],
  "juridica/gsjuridica_formatosbasicos/Actas y Acuerdos": [
    file("fmt-a01", "Formato_Acta_Reunión_Jurídica.docx",   "docx", 31200, "María Cardona", "2026-03-01T11:15:00Z"),
    file("fmt-a02", "Formato_Acuerdo_Confidencialidad.docx","docx", 28400, "María Cardona", "2026-02-10T10:00:00Z"),
    file("fmt-a03", "Formato_Acta_Comité_Jurídico.docx",    "docx", 33100, "Andrés Torres", "2026-01-15T09:00:00Z"),
  ],

  // ── juridica_juridica: Repositorio Inventario Digital ────────────────────
  "juridica/juridica_juridica": [
    folder("inv-f01", "Contratos Activos",   "Sistema",        "2026-04-01T07:00:00Z", 3),
    folder("inv-f02", "Contratos Cerrados",  "Sistema",        "2026-03-31T18:00:00Z", 5),
    folder("inv-f03", "Litigios",            "Andrés Torres",  "2026-03-20T10:00:00Z", 2),
    file("inv-001", "Inventario_General_Contratos_2026.xlsx", "xlsx", 128000, "Sistema",        "2026-04-01T07:00:00Z"),
    file("inv-002", "Matriz_Riesgos_Jurídicos_2026.xlsx",     "xlsx", 95000,  "María Cardona",  "2026-03-20T10:00:00Z"),
  ],
  "juridica/juridica_juridica/Contratos Activos": [
    file("inv-ca01", "CT-2026-001_TechProv_SAS.pdf",          "pdf",  210000, "María Cardona", "2026-02-01T09:00:00Z"),
    file("inv-ca02", "CT-2026-002_Logística_Express.pdf",     "pdf",  195000, "María Cardona", "2026-02-15T10:00:00Z"),
    file("inv-ca03", "CT-2026-003_Arrendamiento_Bello.pdf",   "pdf",  175000, "Andrés Torres", "2026-03-01T11:00:00Z"),
  ],
  "juridica/juridica_juridica/Litigios": [
    file("inv-l01", "Registro_Litigios_Q1_2026.pdf",          "pdf",  310000, "Andrés Torres", "2026-03-31T18:00:00Z"),
    file("inv-l02", "Expediente_Proceso_2025-047.pdf",        "pdf",  420000, "Andrés Torres", "2026-01-10T08:00:00Z"),
  ],

  // ── juridica_compartida: Documentos de Consulta Diaria ───────────────────
  "juridica/juridica_compartida": [
    folder("comp-f01", "Políticas y Circulares", "Gerencia Jurídica", "2026-03-10T09:00:00Z", 3),
    folder("comp-f02", "Habeas Data",            "Andrés Torres",     "2026-01-20T11:00:00Z", 2),
    file("comp-001", "Guía_Revisión_Contratos_2026.pdf",      "pdf",  185000, "Gerencia Jurídica", "2026-03-10T09:30:00Z"),
    file("comp-002", "Tabla_Competencias_Firma.xlsx",         "xlsx", 44000,  "María Cardona",     "2026-02-01T08:00:00Z"),
  ],
  "juridica/juridica_compartida/Políticas y Circulares": [
    file("comp-p01", "Circular_Políticas_Privacidad_2025.pdf",  "pdf", 310000, "Gerencia Jurídica", "2025-12-15T16:00:00Z"),
    file("comp-p02", "Política_Gestión_Contratos_EDM.pdf",      "pdf", 275000, "Gerencia Jurídica", "2026-01-10T10:00:00Z"),
    file("comp-p03", "Circular_Actualización_SARLAFT_2026.pdf", "pdf", 195000, "Oficial Cumplimiento", "2026-02-20T09:00:00Z"),
  ],
  "juridica/juridica_compartida/Habeas Data": [
    file("comp-h01", "Procedimiento_Habeas_Data.pdf",            "pdf", 240000, "Andrés Torres", "2026-01-20T11:00:00Z"),
    file("comp-h02", "Política_Protección_Datos_Personales.pdf", "pdf", 290000, "Andrés Torres", "2026-01-05T09:00:00Z"),
  ],

  // ── juridica_01_habebasdata: Habeas Data ─────────────────────────────────
  "juridica/juridica_01_habebasdata": [
    folder("hd-f01", "2026",  "Sistema", "2026-04-11T09:00:00Z", 3),
    folder("hd-f02", "2025",  "Sistema", "2025-12-31T18:00:00Z", 8),
    file("hd-001", "Registro_Solicitudes_Habeas_Data.xlsx", "xlsx", 68000, "Andrés Torres", "2026-04-11T09:00:00Z"),
  ],
  "juridica/juridica_01_habebasdata/2026": [
    file("hd-26-01", "HD_2026_001_Solicitud.pdf", "pdf", 95000,  "Sistema", "2026-04-10T14:00:00Z"),
    file("hd-26-02", "HD_2026_002_Solicitud.pdf", "pdf", 102000, "Sistema", "2026-04-08T10:30:00Z"),
    file("hd-26-03", "HD_2026_003_Solicitud.pdf", "pdf", 88000,  "Sistema", "2026-04-05T09:00:00Z"),
  ],
  "juridica/juridica_01_habebasdata/2025": [
    file("hd-25-01", "HD_2025_001_Solicitud.pdf", "pdf", 91000,  "Sistema", "2025-03-10T10:00:00Z"),
    file("hd-25-02", "HD_2025_002_Solicitud.pdf", "pdf", 87000,  "Sistema", "2025-05-15T11:00:00Z"),
  ],

  // ── cumplimiento: SARLAFT ─────────────────────────────────────────────────
  "cumplimiento/11modelosgestionasalaf": [
    folder("sarl-f01", "Manuales y Políticas",    "Oficial de Cumplimiento", "2026-01-15T08:00:00Z", 3),
    folder("sarl-f02", "Matrices y Herramientas", "Oficial de Cumplimiento", "2026-03-25T14:00:00Z", 2),
    folder("sarl-f03", "Reportes UIAF",           "Oficial de Cumplimiento", "2026-04-05T11:30:00Z", 4),
    file("sarl-001", "Informe_Seguimiento_UIAF_Q1_2026.pdf", "pdf",  380000, "Oficial de Cumplimiento", "2026-04-05T11:30:00Z"),
  ],
  "cumplimiento/11modelosgestionasalaf/Manuales y Políticas": [
    file("sarl-m01", "Manual_SARLAFT_EDM_2026.pdf",             "pdf", 520000, "Oficial de Cumplimiento", "2026-01-15T08:00:00Z"),
    file("sarl-m02", "Política_Conocimiento_Cliente.pdf",       "pdf", 280000, "Oficial de Cumplimiento", "2026-02-10T10:00:00Z"),
    file("sarl-m03", "Procedimiento_Debida_Diligencia.pdf",     "pdf", 195000, "Oficial de Cumplimiento", "2026-03-01T09:00:00Z"),
  ],
  "cumplimiento/11modelosgestionasalaf/Matrices y Herramientas": [
    file("sarl-h01", "Matriz_Calificación_Riesgo_SARLAFT.xlsx", "xlsx", 145000, "Oficial de Cumplimiento", "2026-03-25T14:00:00Z"),
    file("sarl-h02", "Herramienta_Segmentación_Clientes.xlsx",  "xlsx", 98000,  "Oficial de Cumplimiento", "2026-02-28T10:00:00Z"),
  ],
  "cumplimiento/11modelosgestionasalaf/Reportes UIAF": [
    file("sarl-r01", "ROS_Q4_2025.pdf",  "pdf", 310000, "Oficial de Cumplimiento", "2026-01-10T09:00:00Z"),
    file("sarl-r02", "ROS_Q3_2025.pdf",  "pdf", 295000, "Oficial de Cumplimiento", "2025-10-10T09:00:00Z"),
    file("sarl-r03", "ROS_Q2_2025.pdf",  "pdf", 280000, "Oficial de Cumplimiento", "2025-07-10T09:00:00Z"),
    file("sarl-r04", "ROS_Q1_2025.pdf",  "pdf", 265000, "Oficial de Cumplimiento", "2025-04-10T09:00:00Z"),
  ],
};

function getMockItems(path: string): SharePointDocument[] {
  return MOCK_TREE[path] ?? [];
}