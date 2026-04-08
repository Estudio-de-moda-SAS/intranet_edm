/**
 * @module graph/departments/procurement.service
 * Service de datos para el departamento de Compras (Procurement) de la
 * intranet EDM.
 *
 * @remarks
 * Agrega en una sola llamada los datos necesarios para renderizar el
 * dashboard de Compras: estadísticas del período, órdenes de compra,
 * cola de aprobaciones, órdenes bloqueadas, recepciones programadas y
 * evaluación de proveedores.
 *
 * En producción, la cola de aprobaciones se obtiene desde Microsoft To Do
 * mediante {@link getAllPendingTasks} — las tareas pendientes se mapean
 * directamente a ítems de aprobación. El resto de los datos están
 * pendientes de integración con el ERP y sistemas especializados:
 *
 * | Dato             | Sistema previsto                        |
 * |------------------|-----------------------------------------|
 * | `stats`          | ERP corporativo / sistema de compras    |
 * | `purchaseOrders` | ERP corporativo                         |
 * | `blockedOrders`  | ERP corporativo                         |
 * | `receivings`     | ERP / WMS (Warehouse Management System) |
 * | `suppliers`      | SRM (Supplier Relationship Management)  |
 * | `approvalQueue`  | Microsoft To Do (ya integrado)          |
 *
 * **Scopes de Graph requeridos:**
 * | Scope        | Dato obtenido                            |
 * |--------------|------------------------------------------|
 * | `Tasks.Read` | Cola de aprobaciones desde Microsoft To Do|
 *
 * @example
 * ```tsx
 * // En un Server Component:
 * export default async function ProcurementPage() {
 *   const data = await getProcurementData();
 *   return <ProcurementDashboard data={data} />;
 * }
 * ```
 */

import { getSharedData, getToken } from "@/lib/graph/shared.service";
import { getAllPendingTasks }       from "@/lib/graph/helpers/todo.helper";

const IS_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

// ── Mock data ─────────────────────────────────────────────────────────────────

/**
 * Datos mock del dashboard de Compras para desarrollo local sin Azure.
 *
 * @remarks
 * Incluye estadísticas del período, órdenes de compra con distintos
 * estados, cola de aprobaciones con distintos niveles de urgencia,
 * órdenes bloqueadas con motivo, recepciones programadas y evaluación
 * de proveedores.
 *
 * En producción, `approvalQueue` se reemplaza con tareas reales de
 * Microsoft To Do. El resto permanece como mock hasta integrar el ERP
 * y los sistemas especializados.
 */
export const MOCK_DATA = {
  /**
   * Estadísticas resumen del período para el widget de KPIs.
   * Los valores están en euros (€) formateados para mostrar en la UI.
   */
  stats: {
    /** Gasto total en compras del mes en curso (ej. `"€88K"`). */
    gastoMes: "€88K",
    /** Número de órdenes pendientes de aprobación. */
    pendientesAprobacion: "6",
    /** Ahorro acumulado en el año hasta la fecha (ej. `"€52.4K"`). */
    ahorroYTD: "€52.4K",
    /** Número de proveedores en estado de vigilancia (`"watch"`). */
    proveedoresVigilancia: "2",
  },

  /**
   * Órdenes de compra recientes con distintos estados y aprobadores.
   *
   * Estados posibles: `"Aprobada"`, `"Pendiente"`, `"Bloqueada"`,
   * `"En tránsito"`.
   */
  purchaseOrders: [
    { id: "oc1", number: "OC-2026-0041", supplier: "Suministros Andina",   category: "Insumos",    amount: "€12.400", status: "Aprobada",    dueDate: "2026-03-15", approver: "María V."    },
    { id: "oc2", number: "OC-2026-0042", supplier: "Tech Hardware Co.",    category: "Equipos TI", amount: "€28.900", status: "Pendiente",   dueDate: "2026-03-12", approver: "Jorge M."    },
    { id: "oc3", number: "OC-2026-0043", supplier: "Papelería Rápida",     category: "Papelería",  amount: "€1.200",  status: "Bloqueada",   dueDate: "2026-03-10", approver: "Sin asignar" },
    { id: "oc4", number: "OC-2026-0044", supplier: "Muebles Corporativos", category: "Mobiliario", amount: "€9.750",  status: "Pendiente",   dueDate: "2026-03-18", approver: "María V."    },
    { id: "oc5", number: "OC-2026-0045", supplier: "Cleaning Services",    category: "Servicios",  amount: "€3.600",  status: "Aprobada",    dueDate: "2026-03-20", approver: "Jorge M."    },
    { id: "oc6", number: "OC-2026-0046", supplier: "Seguridad Integral",   category: "Servicios",  amount: "€5.800",  status: "Bloqueada",   dueDate: "2026-03-11", approver: "Sin asignar" },
    { id: "oc7", number: "OC-2026-0047", supplier: "Distribuidora Norte",  category: "Insumos",    amount: "€7.200",  status: "En tránsito", dueDate: "2026-03-22", approver: "María V."    },
    { id: "oc8", number: "OC-2026-0048", supplier: "Servicios Cloud Ltd.", category: "Software",   amount: "€19.150", status: "Pendiente",   dueDate: "2026-03-14", approver: "Ana R."      },
  ],

  /**
   * Órdenes de compra en cola de aprobación, ordenadas por urgencia.
   *
   * En producción este array se reemplaza con tareas de Microsoft To Do
   * obtenidas mediante {@link getAllPendingTasks}.
   */
  approvalQueue: [
    { id: "ap1", number: "OC-2026-0042", supplier: "Tech Hardware Co.",    amount: "€28.900", urgency: "high",   requestedBy: "Luis H.",   since: "2026-03-08" },
    { id: "ap2", number: "OC-2026-0048", supplier: "Servicios Cloud Ltd.", amount: "€19.150", urgency: "high",   requestedBy: "Sara M.",   since: "2026-03-09" },
    { id: "ap3", number: "OC-2026-0044", supplier: "Muebles Corporativos", amount: "€9.750",  urgency: "medium", requestedBy: "Pedro G.",  since: "2026-03-09" },
    { id: "ap4", number: "OC-2026-0047", supplier: "Distribuidora Norte",  amount: "€7.200",  urgency: "medium", requestedBy: "Ana R.",    since: "2026-03-10" },
    { id: "ap5", number: "OC-2026-0050", supplier: "Papelería Express",    amount: "€890",    urgency: "low",    requestedBy: "Carlos M.", since: "2026-03-10" },
    { id: "ap6", number: "OC-2026-0051", supplier: "Transporte Local",     amount: "€2.400",  urgency: "low",    requestedBy: "Laura T.",  since: "2026-03-10" },
  ],

  /**
   * Órdenes de compra bloqueadas con el motivo del bloqueo.
   * Requieren intervención manual para desbloquear y continuar el flujo.
   */
  blockedOrders: [
    { id: "bl1", number: "OC-2026-0043", supplier: "Papelería Rápida",   amount: "€1.200", reason: "Proveedor sin documentación vigente",              since: "2026-03-09" },
    { id: "bl2", number: "OC-2026-0046", supplier: "Seguridad Integral", amount: "€5.800", reason: "Excede límite de categoría sin segunda firma",      since: "2026-03-08" },
  ],

  /**
   * Recepciones de mercancía programadas o en camino.
   * `items` indica el número de líneas o unidades esperadas.
   */
  receivings: [
    { id: "rc1", number: "OC-2026-0038", supplier: "Suministros Andina",   expectedDate: "2026-03-11", items: 14, status: "En camino"  },
    { id: "rc2", number: "OC-2026-0039", supplier: "Tech Hardware Co.",    expectedDate: "2026-03-12", items: 3,  status: "En camino"  },
    { id: "rc3", number: "OC-2026-0035", supplier: "Muebles Corporativos", expectedDate: "2026-03-13", items: 6,  status: "Programado" },
    { id: "rc4", number: "OC-2026-0040", supplier: "Papelería Rápida",     expectedDate: "2026-03-14", items: 22, status: "Programado" },
  ],

  /**
   * Evaluación de proveedores activos con score y tasa de entrega.
   *
   * | `status`    | Descripción                                    |
   * |-------------|------------------------------------------------|
   * | `preferred` | Proveedor preferido — mejor relación calidad/precio |
   * | `approved`  | Proveedor aprobado y homologado                |
   * | `watch`     | En vigilancia por bajo desempeño               |
   */
  suppliers: [
    { id: "sp1", name: "Suministros Andina",   score: 94, deliveryRate: 98, category: "Insumos",    status: "preferred" },
    { id: "sp2", name: "Tech Hardware Co.",    score: 88, deliveryRate: 91, category: "Equipos TI", status: "approved"  },
    { id: "sp3", name: "Cleaning Services",    score: 79, deliveryRate: 85, category: "Servicios",  status: "watch"     },
    { id: "sp4", name: "Seguridad Integral",   score: 72, deliveryRate: 80, category: "Servicios",  status: "watch"     },
    { id: "sp5", name: "Distribuidora Norte",  score: 91, deliveryRate: 95, category: "Insumos",    status: "approved"  },
  ],
};

// ── Service principal ─────────────────────────────────────────────────────────

/**
 * Agrega y retorna todos los datos necesarios para renderizar el dashboard
 * del departamento de Compras.
 *
 * @remarks
 * En modo bypass retorna {@link MOCK_DATA} completo junto con el perfil
 * de usuario de {@link getSharedData}.
 *
 * En producción obtiene las aprobaciones pendientes desde Microsoft To Do
 * usando {@link getAllPendingTasks} — todas las tareas pendientes (sin
 * filtro de importancia) se mapean a ítems de la cola de aprobaciones.
 * La urgencia se determina por el campo `importance` de Graph:
 * - `"high"` → `"high"`
 * - cualquier otro valor → `"medium"`
 *
 * Los números de orden se generan automáticamente como `"OC-TASK-XXXX"`
 * hasta que se integre el ERP. Si no hay tareas pendientes en To Do,
 * se usa {@link MOCK_DATA.approvalQueue} como fallback.
 *
 * @returns Objeto {@link ProcurementData} con el perfil del usuario,
 *   estadísticas, órdenes de compra, cola de aprobaciones, órdenes
 *   bloqueadas, recepciones programadas y evaluación de proveedores.
 *
 * @example
 * ```tsx
 * export default async function ProcurementPage() {
 *   const data = await getProcurementData();
 *   return <ProcurementDashboard data={data} />;
 * }
 * ```
 */
export async function getProcurementData() {
  const shared = await getSharedData();

  if (IS_BYPASS) {
    return { ...shared, ...MOCK_DATA };
  }

  const token = await getToken();

  const tasks = await getAllPendingTasks(token);

  const approvalQueue = tasks.map((t, i) => ({
    id:          t.id,
    number:      `OC-TASK-${String(i + 1).padStart(4, "0")}`,
    supplier:    t.title,
    amount:      "—",
    urgency:     (t.importance === "high" ? "high" : "medium") as "high" | "medium" | "low",
    requestedBy: "—",
    since:       t.createdDateTime?.split("T")[0] ?? "",
  }));

  return {
    ...shared,
    stats:          MOCK_DATA.stats,
    purchaseOrders: MOCK_DATA.purchaseOrders,
    blockedOrders:  MOCK_DATA.blockedOrders,
    receivings:     MOCK_DATA.receivings,
    suppliers:      MOCK_DATA.suppliers,
    approvalQueue:  approvalQueue.length > 0 ? approvalQueue : MOCK_DATA.approvalQueue,
  };
}

// ── Tipos exportados ──────────────────────────────────────────────────────────

/**
 * Tipo inferido del valor resuelto por {@link getProcurementData}.
 *
 * @remarks
 * Declarado con `Awaited<ReturnType<...>>` para que cualquier cambio en
 * la estructura de retorno de {@link getProcurementData} se propague
 * automáticamente a todos los componentes que consumen este tipo, sin
 * necesidad de actualizarlo manualmente.
 *
 * @example
 * ```tsx
 * interface ProcurementDashboardProps {
 *   data: ProcurementData;
 * }
 * ```
 */
export type ProcurementData = Awaited<ReturnType<typeof getProcurementData>>;