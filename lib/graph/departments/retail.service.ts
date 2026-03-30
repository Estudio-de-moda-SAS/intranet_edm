import { getCommercialData }  from "@/lib/graph/departments/commercial.service";
import { getEcommerceData }   from "@/lib/graph/departments/ecommerce.service";
import { getStoresData }      from "@/lib/graph/departments/stores.service";

// ── Retail service ────────────────────────────────────────────────
// Agrega los datos de los 3 canales en una sola llamada paralela.
// No duplica lógica — delega en cada service de canal existente.
// Los datos compartidos (usuario, org) vienen de getSharedData()
// y ya están incluidos dentro de cada service individual.

export async function getRetailData() {
  const [commercial, ecommerce, stores] = await Promise.all([
    getCommercialData(),
    getEcommerceData(),
    getStoresData(),
  ]);

  return {
    commercial,
    ecommerce,
    stores,
  };
}

export type RetailData = Awaited<ReturnType<typeof getRetailData>>;
