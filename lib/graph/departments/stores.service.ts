import { getSharedData, getToken } from "@/lib/graph/shared.service";
import { getHighPriorityTasks } from "@/lib/graph/helpers/todo.helper"
import type { GraphTask }       from "@/lib/graph/helpers/todo.helper"

const IS_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

// ── Mock data ────────────────────────────────────────────────────
const MOCK_DATA = {
  stats: {
    facturacionHoy:       "€63.2K",
    tiendasConIncidencia: "2",
    conversionMedia:      "4.6%",
    ticketMedio:          "€64.20",
  },
  stores: [
    { id: "st1", name: "Bogotá Centro",    sales: "€12.4K", target: "€11K",  conversion: "5.1%", status: "operational", staff: 8  },
    { id: "st2", name: "Medellín El Poblado", sales: "€9.8K",  target: "€10K",  conversion: "4.2%", status: "incident",     staff: 6  },
    { id: "st3", name: "Cali Chipichape",  sales: "€8.1K",  target: "€8.5K", conversion: "4.8%", status: "operational", staff: 5  },
    { id: "st4", name: "Barranquilla CC",  sales: "€7.6K",  target: "€7K",   conversion: "5.3%", status: "operational", staff: 6  },
    { id: "st5", name: "Bogotá Usaquén",   sales: "€6.9K",  target: "€8K",   conversion: "3.9%", status: "operational", staff: 5  },
    { id: "st6", name: "Cartagena Centro", sales: "€5.4K",  target: "€6K",   conversion: "4.1%", status: "incident",     staff: 4  },
    { id: "st7", name: "Pereira Unicentro",sales: "€7.2K",  target: "€7K",   conversion: "5.0%", status: "operational", staff: 5  },
    { id: "st8", name: "Bucaramanga CC",   sales: "€5.8K",  target: "€6.5K", conversion: "4.4%", status: "operational", staff: 4  },
  ],
  incidents: [
    { id: "in1", store: "Medellín El Poblado", type: "TPV sin conexión",       severity: "high",   since: "2026-03-10T09:15:00", assignee: "Soporte TI" },
    { id: "in2", store: "Cartagena Centro",    type: "Alarma antihurto activa", severity: "high",   since: "2026-03-10T10:30:00", assignee: "Seguridad"  },
  ],
  salesTable: [
    { id: "st1", store: "Bogotá Centro",        salesAmt: 12400, target: 11000, vsTarget: "+12.7%", tickets: 193, avgTicket: "€64.2", conversion: "5.1%", trend: "up"      },
    { id: "st2", store: "Medellín El Poblado",  salesAmt: 9800,  target: 10000, vsTarget: "−2.0%",  tickets: 148, avgTicket: "€66.2", conversion: "4.2%", trend: "down"    },
    { id: "st3", store: "Cali Chipichape",      salesAmt: 8100,  target: 8500,  vsTarget: "−4.7%",  tickets: 124, avgTicket: "€65.3", conversion: "4.8%", trend: "neutral" },
    { id: "st4", store: "Barranquilla CC",      salesAmt: 7600,  target: 7000,  vsTarget: "+8.6%",  tickets: 118, avgTicket: "€64.4", conversion: "5.3%", trend: "up"      },
    { id: "st5", store: "Bogotá Usaquén",       salesAmt: 6900,  target: 8000,  vsTarget: "−13.8%", tickets: 107, avgTicket: "€64.5", conversion: "3.9%", trend: "down"    },
    { id: "st6", store: "Cartagena Centro",     salesAmt: 5400,  target: 6000,  vsTarget: "−10.0%", tickets: 83,  avgTicket: "€65.1", conversion: "4.1%", trend: "down"    },
    { id: "st7", store: "Pereira Unicentro",    salesAmt: 7200,  target: 7000,  vsTarget: "+2.9%",  tickets: 111, avgTicket: "€64.9", conversion: "5.0%", trend: "up"      },
    { id: "st8", store: "Bucaramanga CC",       salesAmt: 5800,  target: 6500,  vsTarget: "−10.8%", tickets: 90,  avgTicket: "€64.4", conversion: "4.4%", trend: "neutral" },
  ],
  ranking: [
    { position: 1, store: "Bogotá Centro",     vsTarget: "+12.7%", trend: "up"   },
    { position: 2, store: "Barranquilla CC",   vsTarget: "+8.6%",  trend: "up"   },
    { position: 3, store: "Pereira Unicentro", vsTarget: "+2.9%",  trend: "up"   },
    { position: 4, store: "Cali Chipichape",   vsTarget: "−4.7%",  trend: "down" },
    { position: 5, store: "Bogotá Usaquén",    vsTarget: "−13.8%", trend: "down" },
  ],
  replenishment: [
    { id: "rp1", product: "Zapatillas Run X Talla 42", store: "Bogotá Usaquén",    stock: 1,  minStock: 5,  urgency: "critical" },
    { id: "rp2", product: "Camiseta Dry Fit M",        store: "Medellín El Poblado",stock: 0, minStock: 8,  urgency: "critical" },
    { id: "rp3", product: "Short Training S",          store: "Cartagena Centro",   stock: 2,  minStock: 6,  urgency: "high"     },
    { id: "rp4", product: "Mochila Urban Negra",       store: "Bucaramanga CC",     stock: 3,  minStock: 5,  urgency: "high"     },
  ],
  closings: [
    { id: "cl1", store: "Bogotá Usaquén",    expectedClose: "2026-03-10T21:00:00", deviation: "−€1.100", status: "alert"  },
    { id: "cl2", store: "Cartagena Centro",  expectedClose: "2026-03-10T20:30:00", deviation: "−€600",   status: "review" },
  ],
};

export async function getStoresData() {
  const shared = await getSharedData();

  // ── Bypass: datos mock ───────────────────────────────────────
  if (IS_BYPASS) {
    return { ...shared, ...MOCK_DATA };
  }

  // ── Producción: datos reales de Graph ────────────────────────
  const token = await getToken();

const tasks: GraphTask[] = await getHighPriorityTasks(token)

const incidents = tasks.map(t => ({
  id:       t.id,
  store:    "—",
  type:     t.title,
  severity: "high" as const,
  since:    t.createdDateTime ?? new Date().toISOString(),
  assignee: "—",
}))

  return {
    ...shared,
    stats:        MOCK_DATA.stats,        // POS / sistema retail (futuro)
    stores:       MOCK_DATA.stores,       // POS (futuro)
    salesTable:   MOCK_DATA.salesTable,   // POS (futuro)
    ranking:      MOCK_DATA.ranking,      // POS (futuro)
    replenishment:MOCK_DATA.replenishment,// WMS (futuro)
    closings:     MOCK_DATA.closings,     // POS (futuro)
    incidents:    incidents.length > 0 ? incidents : MOCK_DATA.incidents,
  };
}

export type StoresData = Awaited<ReturnType<typeof getStoresData>>;