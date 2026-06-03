/**
 * @module powerbi.catalog
 * @remarks
 * Central registry for all Power BI embedded dashboards.
 * Add new dashboards here; the boards page consumes this catalog automatically.
 *
 * How to get the correct reportUrl:
 * 1. Open the report in Teams → "..." → "Open in Power BI"
 * 2. Copy the URL from the browser address bar
 *    Format: https://app.powerbi.com/groups/{workspaceId}/reports/{reportId}/...
 * 3. Paste as-is in reportUrl — {@link toEmbedUrl} handles conversion automatically.
 *
 * @example
 * ```ts
 * {
 *   id: "tablero-comercial",
 *   title: "Tablero Comercial",
 *   description: "Indicadores clave del área comercial.",
 *   area: "Comercial",
 *   reportUrl: "https://app.powerbi.com/groups/.../reports/.../ReportSection...",
 * }
 * ```
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Operational area — matches department names used across the intranet. */
export type PowerBIArea =
  | "Comercial"
  | "E-Commerce"
  | "Finanzas"
  | "RRHH"
  | "Logística"
  | "Compras"
  | "TI"
  | "Tiendas"
  | "Jurídico"
  | "Producto"
  | "Servicios Administrativos"
  | "Corporativo";

export interface PowerBIDashboard {
  /** Unique slug — used as React key and DOM anchor. */
  id: string;
  title: string;
  description: string;
  area: PowerBIArea;
  /**
   * Full Power BI report URL copied from the browser address bar.
   * Converted to an embed URL at runtime via {@link toEmbedUrl}.
   */
  reportUrl: string;
  /** Iframe aspect ratio. Defaults to "16/9" when omitted. */
  aspectRatio?: "16/9" | "4/3" | "21/9";
  tags?: string[];

  openMode?: "external";
   /** External navigation instead of iframe embed */
}

// ---------------------------------------------------------------------------
// Catalog — add dashboards here as you collect URLs from app.powerbi.com
// ---------------------------------------------------------------------------

export const POWERBI_DASHBOARDS: PowerBIDashboard[] = [
  {
    id: "tablero-comercial",
    title: "Tablero Comercial",
    description: "",
    area: "Comercial",
    reportUrl:
      "https://estudiodemoda.sharepoint.com/sites/TransformacionDigital/TablerosEDM/CO/SitePages/Tablero-comercial.aspx?csf=1&web=1&e=YihZ7G&cid=e6aa629f-9f8e-4490-b7b1-5e0aed93a9ea",
    tags: [],
    openMode: "external",
  },
  {
    id:"tablero-activacion-comercial",
    title: "Tablero Activación Comercial",
    description: "",
    area: "Comercial",
    reportUrl:
      "t",
    tags: [],
  },
  {
    id:"tablero-panorama",
    title: "Tablero Panorama",
    description: "",
    area: "Corporativo",
    reportUrl:
      "https://estudiodemoda.sharepoint.com/sites/TransformacionDigital/TablerosEDM/CO/SitePages/Tablero-comercial.aspx?csf=1&web=1&e=YihZ7G&cid=e6aa629f-9f8e-4490-b7b1-5e0aed93a9ea",
    tags: [],
    openMode: "external",
  },
  {
    id: "tablero-nacionalizacion",
    title: "Tablero Nacionalización ZF",
    description: "",
    area: "Corporativo",
    reportUrl:
      "t",
    tags: [],
  },
  {
    id:"tablero-wholesale",
    title: "Tablero Wholesale",
    description: "",
    area: "Corporativo",
    reportUrl:
      "t",
    tags: [],

  },
   {
    id: "tablero-indicadores",
    title: "Tablero de Indicadores",
    description: "",
    area: "Corporativo",
    reportUrl:
      "https://estudiodemoda.sharepoint.com/sites/TransformacionDigital/TablerosEDM/CO/SitePages/Tablero-de-Indicadores.aspx",
    tags: [],
    openMode: "external",
  },
  {
    id:"tablero-ventas-diarias",
    title: "Tablero Ventas Diarias",
    description: "",
    area: "Corporativo",
    reportUrl:
      "https://estudiodemoda.sharepoint.com/sites/TransformacionDigital/TablerosEDM/VB/SitePages/Ventas-Diarias.aspx",
    openMode: "external",
    tags: [],
  },
  {
    id:"tablero-abc-familias",
    title: "Tablero ABC Familias",
    description: "",
    area: "Corporativo",
    reportUrl:
      "https://estudiodemoda.sharepoint.com/sites/TransformacionDigital/TablerosEDM/CO/SitePages/ABC-Familias.aspx",
    openMode: "external",
    tags: [],
  },
  {
    id: "tablero-analisis-almacen",
    title: "Tablero Análisis por Almacén",
    description: "",
    area: "Corporativo",
    reportUrl:
      "https://estudiodemoda.sharepoint.com/sites/TransformacionDigital/TablerosEDM/CO/SitePages/Análisis-por-almacen.aspx",
    openMode: "external",
    tags: [],
  },
  {
    id:"tablero-you",
    title: "Tablero You",
    description: "",
    area: "Corporativo",
    reportUrl:
      "https://estudiodemoda.sharepoint.com/sites/TransformacionDigital/TablerosEDM/you/SitePages/YOU.aspx",
    openMode: "external",
    tags: [],
  },
  // Agrega los demás tableros cuando tengas sus URLs:
  // {
  //   id: "tablero",
  //   title: "Tablero ",
  //   description: "Cartera, recaudo y estados financieros.",
  //   area: "Finanzas",
  //   reportUrl: "https://app.powerbi.com/groups/.../reports/.../...",
  //   tags: ["cartera", "recaudo"],
  // },
];

// ---------------------------------------------------------------------------
// Derived helpers
// ---------------------------------------------------------------------------

/** Unique areas present in the catalog — drives the tab filter. */
export const POWERBI_AREAS: PowerBIArea[] = [
  ...new Set(POWERBI_DASHBOARDS.map((d) => d.area)),
];

/**
 * Converts a standard Power BI browser URL into its embeddable iframe URL.
 * Safe to call with an already-converted embed URL — returns it unchanged.
 *
 * @param reportUrl - URL from the browser address bar
 * @returns Embed URL suitable for use as an iframe `src`
 *
 * @example
 * ```ts
 * toEmbedUrl(
 *   "https://app.powerbi.com/groups/abc/reports/def/ReportSection"
 * )
 * // → "https://app.powerbi.com/reportEmbed?reportId=def"
 * ```
 */
export function toEmbedUrl(reportUrl: string): string {
  try {
    const url = new URL(reportUrl);
    if (url.pathname.includes("/reportEmbed")) return reportUrl;

    const reportMatch = url.pathname.match(/\/reports\/([^/]+)/);
    const groupMatch  = url.pathname.match(/\/groups\/([^/]+)/);

    const reportId = reportMatch?.[1];
    const groupId  = groupMatch?.[1];

    if (!reportId) return reportUrl;

    const params = new URLSearchParams();
    params.set("reportId", reportId);
    if (groupId) params.set("groupId", groupId);

    return `https://app.powerbi.com/reportEmbed?${params.toString()}`;
  } catch {
    return reportUrl;
  }
}