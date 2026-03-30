// lib/graph/departments/product.service.ts
// ─────────────────────────────────────────────────────────────────────────────
// Tipo de datos que el servidor pasa al componente ProductPageContent.
// Extiende cuando conectes a tu fuente de datos real (ERP Odoo, Centric PLM,
// base de datos propia, etc.).
// ─────────────────────────────────────────────────────────────────────────────

export type ProductData = {
  // Resumen de la temporada activa
  activeSeason: {
    code:       string;   // "SS-25"
    name:       string;   // "Primavera Verano 2025"
    totalRefs:  number;
    approved:   number;
    inDev:      number;
    daysToLaunch: number;
  };

  // Totales para KPIStrip (los componentes usan mock data;
  // pasa los datos reales aquí cuando conectes el ERP)
  kpis: {
    totalRefsActiveSeason: number;
    samplesApprovedPct:    number;
    techSheetsCompletePct: number;
    activeSuppliers:       number;
    pendingSamples:        number;
    daysToMainLaunch:      number;
  };

  // Metadatos de última sincronización
  lastSync: string; // ISO timestamp
};

// Función de ejemplo para obtener los datos desde el servidor
// (reemplazar con llamada real a ERP o base de datos)
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
