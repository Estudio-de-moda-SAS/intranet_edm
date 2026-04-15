/**
 * @module graph/departments/product.service
 * Tipos y service de datos para el departamento de Producto de la
 * intranet EDM.
 *
 * @remarks
 * Provee la estructura de datos que el servidor pasa al componente
 * `ProductPageContent` para renderizar el dashboard de la temporada
 * activa y los KPIs del área de Producto y Colecciones.
 *
 * Actualmente retorna datos mock. Cuando se conecte el ERP o PLM
 * corporativo, {@link getProductData} debe reemplazarse con llamadas
 * reales a la fuente de datos correspondiente:
 *
 * | Dato              | Fuente prevista                              |
 * |-------------------|----------------------------------------------|
 * | `activeSeason`    | ERP Odoo / Centric PLM                       |
 * | `kpis`            | ERP Odoo / Centric PLM / base de datos propia|
 * | `lastSync`        | Timestamp de última sincronización del ERP   |
 *
 * @example
 * ```tsx
 * // En un Server Component:
 * export default async function ProductPage() {
 *   const data = await getProductData();
 *   return <ProductPageContent data={data} />;
 * }
 * ```
 */

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Resumen de la temporada de colecciones activa.
 *
 * @remarks
 * Una temporada agrupa todas las referencias (productos) que se lanzan
 * en un período comercial específico (ej. Primavera Verano, Otoño Invierno).
 * El campo `daysToLaunch` es el número de días hasta el lanzamiento
 * principal de la temporada — puede ser negativo si ya pasó la fecha.
 */
export type ActiveSeason = {
  /**
   * Código corto de la temporada (ej. `"SS-25"` para Spring/Summer 2025,
   * `"AW-25"` para Autumn/Winter 2025).
   */
  code: string;

  /** Nombre completo de la temporada (ej. `"Primavera Verano 2025"`). */
  name: string;

  /** Número total de referencias (SKUs) registradas en la temporada. */
  totalRefs: number;

  /**
   * Número de referencias aprobadas y listas para producción o lanzamiento.
   */
  approved: number;

  /** Número de referencias actualmente en proceso de desarrollo. */
  inDev: number;

  /**
   * Días restantes hasta el lanzamiento principal de la temporada.
   * Negativo si la fecha de lanzamiento ya pasó.
   */
  daysToLaunch: number;
};

/**
 * KPIs del dashboard de Producto para el widget `KPIStrip`.
 *
 * @remarks
 * Los porcentajes (`samplesApprovedPct`, `techSheetsCompletePct`) están
 * expresados como enteros de 0 a 100 sin el símbolo `%` para facilitar
 * su uso en gráficas de progreso y cálculos en la UI.
 */
export type ProductKPIs = {
  /** Total de referencias activas en la temporada en curso. */
  totalRefsActiveSeason: number;

  /**
   * Porcentaje de muestras aprobadas sobre el total de referencias
   * (0–100).
   */
  samplesApprovedPct: number;

  /**
   * Porcentaje de fichas técnicas completadas sobre el total de
   * referencias (0–100).
   */
  techSheetsCompletePct: number;

  /** Número de proveedores activos colaborando en la temporada actual. */
  activeSuppliers: number;

  /** Número de muestras pendientes de revisión o aprobación. */
  pendingSamples: number;

  /**
   * Días restantes hasta el lanzamiento principal de la temporada.
   * Equivale a {@link ActiveSeason.daysToLaunch}.
   */
  daysToMainLaunch: number;
};

/**
 * Agregado de datos del dashboard del departamento de Producto.
 *
 * @remarks
 * Es el tipo que recibe el componente `ProductPageContent` como prop.
 * Extiende este tipo cuando conectes nuevas fuentes de datos al dashboard
 * (ej. calendario de colecciones, estado por proveedor, alertas de PLM).
 */
export type ProductData = {
  /** Resumen de la temporada de colecciones actualmente activa. */
  activeSeason: ActiveSeason;

  /** KPIs del área de Producto para el widget `KPIStrip`. */
  kpis: ProductKPIs;

  /**
   * Timestamp ISO 8601 de la última sincronización con el ERP o PLM.
   * Útil para mostrar la frescura de los datos en la UI.
   */
  lastSync: string;
};

// ── Service principal ─────────────────────────────────────────────────────────

/**
 * Obtiene los datos del dashboard del departamento de Producto.
 *
 * @remarks
 * Actualmente retorna datos mock representativos de la temporada
 * SS-25 (Primavera Verano 2025). El campo `lastSync` se genera
 * dinámicamente en cada llamada con `new Date().toISOString()`.
 *
 * ⏳ Pendiente de reemplazar con llamadas reales al ERP o PLM corporativo
 * cuando las integraciones estén disponibles. Se recomienda usar
 * `Promise.all` para las llamadas paralelas cuando haya múltiples
 * endpoints involucrados.
 *
 * @returns Objeto {@link ProductData} con el resumen de la temporada
 *   activa, KPIs y timestamp de sincronización.
 *
 * @example
 * ```ts
 * const data = await getProductData();
 * // data.activeSeason.code     → "SS-25"
 * // data.kpis.samplesApprovedPct → 61
 * // data.lastSync              → "2026-03-10T14:30:00.000Z"
 * ```
 */
export async function getProductData(): Promise<ProductData> {
  return {
    activeSeason: {
      code:         "SS-25",
      name:         "Primavera Verano 2025",
      totalRefs:    248,
      approved:     151,
      inDev:        74,
      daysToLaunch: 34,
    },
    kpis: {
      totalRefsActiveSeason: 248,
      samplesApprovedPct:    61,
      techSheetsCompletePct: 89,
      activeSuppliers:       23,
      pendingSamples:        8,
      daysToMainLaunch:      34,
    },
    lastSync: new Date().toISOString(),
  };
}