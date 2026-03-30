import { getSharedData, getToken } from "@/lib/graph/shared.service";
import { getHighPriorityTasks } from "@/lib/graph/helpers/todo.helper"

const IS_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

// ── Mock data ────────────────────────────────────────────────────
const MOCK_DATA = {
  stats: {
    enTransito:        "341",
    conRetraso:        "18",
    entregadosHoy:     "87",
    tiempoMedioEntrega:"2.0d",
  },
  performance: {
    tasaPuntualidad: 97.2,
    costeMedioEnvio: "€8.40",
    ocupacionFlota:  81,
  },
  shipments: [
    { id: "sh1", tracking: "EDM-001234", destination: "Bogotá Centro",    carrier: "Servientrega", status: "En tránsito", eta: "2026-03-11", weight: "2.4kg" },
    { id: "sh2", tracking: "EDM-001235", destination: "Medellín Norte",   carrier: "Deprisa",      status: "Retrasado",  eta: "2026-03-10", weight: "5.1kg" },
    { id: "sh3", tracking: "EDM-001236", destination: "Cali Sur",         carrier: "TCC",          status: "Entregado",  eta: "2026-03-09", weight: "1.2kg" },
    { id: "sh4", tracking: "EDM-001237", destination: "Barranquilla",     carrier: "Servientrega", status: "En tránsito", eta: "2026-03-12", weight: "3.8kg" },
    { id: "sh5", tracking: "EDM-001238", destination: "Bucaramanga",      carrier: "Interrapidísimo", status: "Retrasado", eta: "2026-03-10", weight: "0.9kg" },
  ],
  incidents: [
    { id: "in1", tracking: "EDM-001235", type: "Retraso",         severity: "critical", description: "Vehículo varado en vía Medellín–Bogotá",    since: "2026-03-10T06:30:00" },
    { id: "in2", tracking: "EDM-001238", type: "Retraso",         severity: "critical", description: "Cierre vial por manifestación en Bucaramanga", since: "2026-03-10T09:00:00" },
    { id: "in3", tracking: "EDM-001241", type: "Paquete dañado",  severity: "critical", description: "Reporte de daño en bodega Cali",              since: "2026-03-10T11:15:00" },
    { id: "in4", tracking: "EDM-001250", type: "Dirección errada",severity: "minor",    description: "Dirección incompleta, requiere contacto",     since: "2026-03-10T08:00:00" },
  ],
  warehouses: [
    { id: "w1", name: "CEDI Bogotá",       capacity: 85, stock: 1240, criticalItems: 3,  location: "Bogotá"       },
    { id: "w2", name: "CEDI Medellín",     capacity: 62, stock: 870,  criticalItems: 1,  location: "Medellín"     },
    { id: "w3", name: "CEDI Cali",         capacity: 91, stock: 430,  criticalItems: 5,  location: "Cali"         },
    { id: "w4", name: "CEDI Barranquilla", capacity: 47, stock: 290,  criticalItems: 0,  location: "Barranquilla" },
  ],
  routes: [
    { id: "r1", name: "Ruta Bogotá–Medellín", vehicles: 12, active: 10, delayed: 2, avgTime: "5.5h" },
    { id: "r2", name: "Ruta Bogotá–Cali",     vehicles: 8,  active: 8,  delayed: 0, avgTime: "7.2h" },
    { id: "r3", name: "Ruta Costa Caribe",    vehicles: 6,  active: 5,  delayed: 1, avgTime: "9.0h" },
  ],
};

export async function getLogisticsData() {
  const shared = await getSharedData();

  // ── Bypass: datos mock ───────────────────────────────────────
  if (IS_BYPASS) {
    return { ...shared, ...MOCK_DATA };
  }

  // ── Producción: datos reales de Graph ────────────────────────
  const token = await getToken();

  // Tareas de alta prioridad → incidencias logísticas
const tasks = await getHighPriorityTasks(token)

const incidents = tasks.map(t => ({
  id:          t.id,
  tracking:    "—",
  type:        "Alerta",
  severity:    "critical" as const,
  description: t.title,
  since:       t.dueDateTime?.dateTime ?? new Date().toISOString(),
}))

  return {
    ...shared,
    stats:       MOCK_DATA.stats,       // Sistema TMS (futuro)
    performance: MOCK_DATA.performance, // Sistema TMS (futuro)
    shipments:   MOCK_DATA.shipments,   // Sistema TMS (futuro)
    warehouses:  MOCK_DATA.warehouses,  // WMS (futuro)
    routes:      MOCK_DATA.routes,      // Sistema TMS (futuro)
    incidents:   incidents.length > 0 ? incidents : MOCK_DATA.incidents,
  };
}

export type LogisticsData = Awaited<ReturnType<typeof getLogisticsData>>;