/**
 * @module legalSharePointFolders
 * Configuración de carpetas de SharePoint para el módulo jurídico y de cumplimiento.
 *
 * @remarks
 * Cada entrada representa una carpeta específica de SharePoint con sus metadatos
 * visuales y el identificador necesario para consultar Microsoft Graph.
 *
 * Cuando se activen los permisos de Graph, el campo `siteRelativePath` se usará
 * en la llamada a `/sites/{siteId}/drives/{driveId}/root:/{path}:/children`.
 */

/** Carpeta individual de SharePoint */
export interface SharePointFolder {
  /** Identificador único del visor (para keys de React) */
  id: string;
  /** Etiqueta visible en la UI */
  label: string;
  /** Descripción corta del contenido */
  description: string;
  /**
   * Ruta relativa dentro del sitio SharePoint.
   * Ejemplo: "juridica/gsjuridica_formatosbasicos"
   * Se usará como: GET /sites/{siteId}/drives/{driveId}/root:/{siteRelativePath}:/children
   */
  siteRelativePath: string;
  /** Color de acento (clase Tailwind) para el encabezado del visor */
  accentColor: string;
  /** Ícono Lucide a mostrar en el encabezado */
  iconName: string;
}

/**
 * Carpetas del área Jurídica.
 * Cuatro bibliotecas específicas de SharePoint según indicación del área.
 */
export const JURIDICO_FOLDERS: SharePointFolder[] = [
  {
    id: "gsjuridica_formatosbasicos",
    label: "Formatos Básicos",
    description: "Plantillas y formatos estándar del área jurídica",
    siteRelativePath: "juridica/gsjuridica_formatosbasicos",
    accentColor: "emerald",
    iconName: "FileText",
  },
  {
    id: "juridica_juridica",
    label: "Repositorio Inventario Digital",
    description: "Inventario digital de documentos jurídicos internos",
    siteRelativePath: "juridica/juridica_juridica",
    accentColor: "teal",
    iconName: "Archive",
  },
  {
    id: "juridica_compartida",
    label: "Documentos de Consulta Diaria",
    description: "Documentos compartidos de uso frecuente del equipo",
    siteRelativePath: "juridica/juridica_compartida",
    accentColor: "cyan",
    iconName: "FolderOpen",
  },
  {
    id: "juridica_abebasdata",
    label: "01 - Habeas Data",
    description: "Solicitudes y gestión de habeas data",
    siteRelativePath: "juridica/juridica_01_habebasdata",
    accentColor: "sky",
    iconName: "ShieldCheck",
  },
];

/**
 * Carpetas del área de Cumplimiento.
 * Por ahora incluye el repositorio SARLAFT/modelos de gestión.
 */
export const CUMPLIMIENTO_FOLDERS: SharePointFolder[] = [
  {
    id: "cumplimiento_modelosgestion",
    label: "11 - Modelos Gestión SARLAFT",
    description: "Modelos y procedimientos del sistema antilavado",
    siteRelativePath: "cumplimiento/11modelosgestionasalaf",
    accentColor: "violet",
    iconName: "ShieldAlert",
  },
];