import { getSharedData, getToken } from "@/lib/graph/shared.service";
import { getAllPendingTasks } from "@/lib/graph/helpers/todo.helper"

const IS_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

// ── Mock data ────────────────────────────────────────────────────
const MOCK_DATA = {
  stats: {
    gastoMes:               "€88K",
    pendientesAprobacion:   "6",
    ahorroYTD:              "€52.4K",
    proveedoresVigilancia:  "2",
  },
  purchaseOrders: [
    { id: "oc1", number: "OC-2026-0041", supplier: "Suministros Andina",   category: "Insumos",     amount: "€12.400", status: "Aprobada",   dueDate: "2026-03-15", approver: "María V." },
    { id: "oc2", number: "OC-2026-0042", supplier: "Tech Hardware Co.",    category: "Equipos TI",  amount: "€28.900", status: "Pendiente",  dueDate: "2026-03-12", approver: "Jorge M." },
    { id: "oc3", number: "OC-2026-0043", supplier: "Papelería Rápida",     category: "Papelería",   amount: "€1.200",  status: "Bloqueada",  dueDate: "2026-03-10", approver: "Sin asignar" },
    { id: "oc4", number: "OC-2026-0044", supplier: "Muebles Corporativos", category: "Mobiliario",  amount: "€9.750",  status: "Pendiente",  dueDate: "2026-03-18", approver: "María V." },
    { id: "oc5", number: "OC-2026-0045", supplier: "Cleaning Services",    category: "Servicios",   amount: "€3.600",  status: "Aprobada",   dueDate: "2026-03-20", approver: "Jorge M." },
    { id: "oc6", number: "OC-2026-0046", supplier: "Seguridad Integral",   category: "Servicios",   amount: "€5.800",  status: "Bloqueada",  dueDate: "2026-03-11", approver: "Sin asignar" },
    { id: "oc7", number: "OC-2026-0047", supplier: "Distribuidora Norte",  category: "Insumos",     amount: "€7.200",  status: "En tránsito",dueDate: "2026-03-22", approver: "María V." },
    { id: "oc8", number: "OC-2026-0048", supplier: "Servicios Cloud Ltd.", category: "Software",    amount: "€19.150", status: "Pendiente",  dueDate: "2026-03-14", approver: "Ana R."   },
  ],
  approvalQueue: [
    { id: "ap1", number: "OC-2026-0042", supplier: "Tech Hardware Co.",    amount: "€28.900", urgency: "high",   requestedBy: "Luis H.", since: "2026-03-08" },
    { id: "ap2", number: "OC-2026-0048", supplier: "Servicios Cloud Ltd.", amount: "€19.150", urgency: "high",   requestedBy: "Sara M.", since: "2026-03-09" },
    { id: "ap3", number: "OC-2026-0044", supplier: "Muebles Corporativos", amount: "€9.750",  urgency: "medium", requestedBy: "Pedro G.", since: "2026-03-09" },
    { id: "ap4", number: "OC-2026-0047", supplier: "Distribuidora Norte",  amount: "€7.200",  urgency: "medium", requestedBy: "Ana R.",  since: "2026-03-10" },
    { id: "ap5", number: "OC-2026-0050", supplier: "Papelería Express",    amount: "€890",    urgency: "low",    requestedBy: "Carlos M.", since: "2026-03-10" },
    { id: "ap6", number: "OC-2026-0051", supplier: "Transporte Local",     amount: "€2.400",  urgency: "low",    requestedBy: "Laura T.", since: "2026-03-10" },
  ],
  blockedOrders: [
    { id: "bl1", number: "OC-2026-0043", supplier: "Papelería Rápida",   amount: "€1.200",  reason: "Proveedor sin documentación vigente", since: "2026-03-09" },
    { id: "bl2", number: "OC-2026-0046", supplier: "Seguridad Integral", amount: "€5.800",  reason: "Excede límite de categoría sin segunda firma", since: "2026-03-08" },
  ],
  receivings: [
    { id: "rc1", number: "OC-2026-0038", supplier: "Suministros Andina",   expectedDate: "2026-03-11", items: 14, status: "En camino"  },
    { id: "rc2", number: "OC-2026-0039", supplier: "Tech Hardware Co.",    expectedDate: "2026-03-12", items: 3,  status: "En camino"  },
    { id: "rc3", number: "OC-2026-0035", supplier: "Muebles Corporativos", expectedDate: "2026-03-13", items: 6,  status: "Programado" },
    { id: "rc4", number: "OC-2026-0040", supplier: "Papelería Rápida",     expectedDate: "2026-03-14", items: 22, status: "Programado" },
  ],
  suppliers: [
    { id: "sp1", name: "Suministros Andina",   score: 94, deliveryRate: 98, category: "Insumos",    status: "preferred" },
    { id: "sp2", name: "Tech Hardware Co.",    score: 88, deliveryRate: 91, category: "Equipos TI", status: "approved"  },
    { id: "sp3", name: "Cleaning Services",    score: 79, deliveryRate: 85, category: "Servicios",  status: "watch"     },
    { id: "sp4", name: "Seguridad Integral",   score: 72, deliveryRate: 80, category: "Servicios",  status: "watch"     },
    { id: "sp5", name: "Distribuidora Norte",  score: 91, deliveryRate: 95, category: "Insumos",    status: "approved"  },
  ],
};

export async function getProcurementData() {
  const shared = await getSharedData();

  // ── Bypass: datos mock ───────────────────────────────────────
  if (IS_BYPASS) {
    return { ...shared, ...MOCK_DATA };
  }

  // ── Producción: datos reales de Graph ────────────────────────
  const token = await getToken();

  // Aprobaciones pendientes desde tareas de To Do
const tasks = await getAllPendingTasks(token)

const approvalQueue = tasks.map((t, i) => ({
  id:          t.id,
  number:      `OC-TASK-${String(i + 1).padStart(4, "0")}`,
  supplier:    t.title,
  amount:      "—",
  urgency:     t.importance === "high" ? "high" : "medium" as "high" | "medium" | "low",
  requestedBy: "—",
  since:       t.createdDateTime?.split("T")[0] ?? "",
}))
  return {
    ...shared,
    stats:          MOCK_DATA.stats,          // ERP / sistema de compras (futuro)
    purchaseOrders: MOCK_DATA.purchaseOrders, // ERP (futuro)
    blockedOrders:  MOCK_DATA.blockedOrders,  // ERP (futuro)
    receivings:     MOCK_DATA.receivings,     // ERP / WMS (futuro)
    suppliers:      MOCK_DATA.suppliers,      // SRM (futuro)
    approvalQueue:  approvalQueue.length > 0 ? approvalQueue : MOCK_DATA.approvalQueue,
  };
}

export type ProcurementData = Awaited<ReturnType<typeof getProcurementData>>;