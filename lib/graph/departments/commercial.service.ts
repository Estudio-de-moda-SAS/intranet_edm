import { getSharedData, getToken } from "@/lib/graph/shared.service";
import { getHighPriorityTasks } from "@/lib/graph/helpers/todo.helper"

const IS_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

// ── Mock data ────────────────────────────────────────────────────
const MOCK_DATA = {
  kpis: {
    ventasMes:          "$284K",
    ordenesActivas:     "143",
    metaMensualPct:     "78%",
    clientesActivos:    "1,042",
    ticketPromedio:     "$272",
    entregasCompletadas:"98",
    pipeline:           "$520K",
    alertasComerciales: "5",
  },
  pipeline: [
    { id: "p1", name: "Empresa ABC",    stage: "Propuesta",   value: "$45K",  probability: 70 },
    { id: "p2", name: "Grupo XYZ",      stage: "Negociación", value: "$120K", probability: 55 },
    { id: "p3", name: "Retail Sur",     stage: "Calificado",  value: "$28K",  probability: 40 },
    { id: "p4", name: "Distribuidora N",stage: "Cierre",      value: "$87K",  probability: 90 },
  ],
  orders: [
    { id: "o1", client: "Tienda Centro", amount: "$3.200", status: "En tránsito", date: "2026-03-08" },
    { id: "o2", client: "Retail Norte",  amount: "$1.850", status: "Pendiente",   date: "2026-03-09" },
    { id: "o3", client: "Grupo Sur",     amount: "$5.400", status: "Entregado",   date: "2026-03-07" },
  ],
  alerts: [
    { id: "al1", message: "3 pedidos sin confirmar hace +48h",  severity: "high"   },
    { id: "al2", message: "Meta semanal al 61% — requiere acción", severity: "medium" },
  ],
  goals: [
    { id: "g1", label: "Ventas mes",     current: 284, target: 360, unit: "K" },
    { id: "g2", label: "Nuevos clientes",current: 34,  target: 50,  unit: ""  },
    { id: "g3", label: "Entregas",       current: 98,  target: 104, unit: ""  },
  ],
};

export async function getCommercialData() {
  const shared = await getSharedData();

  // ── Bypass: datos mock ───────────────────────────────────────
  if (IS_BYPASS) {
    return { ...shared, ...MOCK_DATA };
  }

  // ── Producción: datos reales de Graph ────────────────────────
  const token = await getToken();

  // Tareas comerciales desde To Do / Planner  
const tasks = await getHighPriorityTasks(token)
const alerts = tasks.map(t => ({
  id:       t.id,
  message:  t.title,
  severity: "high" as const,
}))

  return {
    ...shared,
    // KPIs, pipeline, orders y goals vienen de tu sistema CRM
    // cuando tengas la integración, los agregas aquí
    kpis:    MOCK_DATA.kpis,
    pipeline:MOCK_DATA.pipeline,
    orders:  MOCK_DATA.orders,
    goals:   MOCK_DATA.goals,
    alerts:  alerts.length > 0 ? alerts : MOCK_DATA.alerts,
  };
}

export type CommercialData = Awaited<ReturnType<typeof getCommercialData>>;