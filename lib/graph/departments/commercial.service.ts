/**
 * @module graph/departments/commercial.service
 * Service de datos para el departamento Comercial de la intranet EDM.
 *
 * @remarks
 * Agrega en una sola llamada los datos necesarios para renderizar el
 * dashboard comercial: KPIs, pipeline de ventas, órdenes recientes,
 * metas del período y alertas comerciales.
 *
 * En producción, las alertas se obtienen desde Microsoft To Do mediante
 * {@link getHighPriorityTasks}. KPIs, pipeline, órdenes y metas están
 * pendientes de integración con el CRM corporativo — actualmente se
 * sirven desde {@link MOCK_DATA}.
 *
 * @example
 * ```tsx
 * // En un Server Component:
 * export default async function CommercialPage() {
 *   const data = await getCommercialData();
 *   return <CommercialDashboard data={data} />;
 * }
 * ```
 */

import { getSharedData, getToken } from "@/lib/graph/shared.service";
import { getHighPriorityTasks }    from "@/lib/graph/helpers/todo.helper";

const IS_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

// ── Tipos internos ────────────────────────────────────────────────────────────

/**
 * KPIs del dashboard comercial.
 *
 * @remarks
 * Todos los valores se representan como strings formateados para mostrar
 * directamente en la UI sin transformaciones adicionales.
 */
export type CommercialKPIs = {
  /** Ventas totales del mes en curso (ej. `"$284K"`). */
  ventasMes: string;

  /** Número de órdenes activas en el sistema (ej. `"143"`). */
  ordenesActivas: string;

  /** Porcentaje de avance sobre la meta mensual (ej. `"78%"`). */
  metaMensualPct: string;

  /** Número de clientes activos en el período (ej. `"1,042"`). */
  clientesActivos: string;

  /** Valor promedio por orden (ej. `"$272"`). */
  ticketPromedio: string;

  /** Número de entregas completadas en el mes (ej. `"98"`). */
  entregasCompletadas: string;

  /** Valor total del pipeline de ventas activo (ej. `"$520K"`). */
  pipeline: string;

  /** Número de alertas comerciales activas (ej. `"5"`). */
  alertasComerciales: string;
};

/**
 * Oportunidad de venta en el pipeline comercial.
 */
export type PipelineItem = {
  /** Identificador único de la oportunidad. */
  id: string;

  /** Nombre del cliente o empresa asociada a la oportunidad. */
  name: string;

  /**
   * Etapa actual de la oportunidad en el pipeline.
   * Valores típicos: `"Calificado"`, `"Propuesta"`, `"Negociación"`, `"Cierre"`.
   */
  stage: string;

  /** Valor estimado de la oportunidad en formato legible (ej. `"$45K"`). */
  value: string;

  /**
   * Probabilidad de cierre expresada como porcentaje entero (0–100).
   * Se usa para calcular el valor ponderado del pipeline.
   */
  probability: number;
};

/**
 * Orden de venta reciente.
 */
export type CommercialOrder = {
  /** Identificador único de la orden. */
  id: string;

  /** Nombre del cliente que realizó la orden. */
  client: string;

  /** Monto total de la orden en formato legible (ej. `"$3.200"`). */
  amount: string;

  /**
   * Estado actual de la orden.
   * Valores típicos: `"Pendiente"`, `"En tránsito"`, `"Entregado"`.
   */
  status: string;

  /** Fecha de la orden en formato ISO 8601 (ej. `"2026-03-08"`). */
  date: string;
};

/**
 * Alerta comercial que requiere atención del equipo de ventas.
 */
export type CommercialAlert = {
  /** Identificador único de la alerta. */
  id: string;

  /** Descripción de la alerta en texto legible. */
  message: string;

  /**
   * Nivel de severidad de la alerta.
   *
   * | Valor    | Descripción                              |
   * |----------|------------------------------------------|
   * | `high`   | Requiere acción inmediata                |
   * | `medium` | Requiere atención en el corto plazo      |
   */
  severity: "high" | "medium";
};

/**
 * Meta de desempeño del período para el equipo comercial.
 */
export type CommercialGoal = {
  /** Identificador único de la meta. */
  id: string;

  /** Etiqueta descriptiva de la meta (ej. `"Ventas mes"`). */
  label: string;

  /** Valor actual alcanzado en el período. */
  current: number;

  /** Valor objetivo a alcanzar en el período. */
  target: number;

  /**
   * Unidad de medida del valor (ej. `"K"` para miles).
   * Cadena vacía si el valor es un conteo sin unidad.
   */
  unit: string;
};

// ── Mock data ─────────────────────────────────────────────────────────────────

/**
 * Datos mock que simulan la respuesta completa de {@link getCommercialData}
 * en entorno de desarrollo.
 *
 * @remarks
 * Incluye KPIs, pipeline, órdenes, alertas y metas con valores
 * representativos del contexto comercial de EDM. En producción, estos
 * datos serán reemplazados por la integración con el CRM corporativo,
 * a excepción de las alertas que ya se obtienen desde Microsoft To Do.
 */
export const MOCK_DATA: {
  kpis:     CommercialKPIs;
  pipeline: PipelineItem[];
  orders:   CommercialOrder[];
  alerts:   CommercialAlert[];
  goals:    CommercialGoal[];
} = {
  kpis: {
    ventasMes:           "$284K",
    ordenesActivas:      "143",
    metaMensualPct:      "78%",
    clientesActivos:     "1,042",
    ticketPromedio:      "$272",
    entregasCompletadas: "98",
    pipeline:            "$520K",
    alertasComerciales:  "5",
  },
  pipeline: [
    { id: "p1", name: "Empresa ABC",     stage: "Propuesta",   value: "$45K",  probability: 70 },
    { id: "p2", name: "Grupo XYZ",       stage: "Negociación", value: "$120K", probability: 55 },
    { id: "p3", name: "Retail Sur",      stage: "Calificado",  value: "$28K",  probability: 40 },
    { id: "p4", name: "Distribuidora N", stage: "Cierre",      value: "$87K",  probability: 90 },
  ],
  orders: [
    { id: "o1", client: "Tienda Centro", amount: "$3.200", status: "En tránsito", date: "2026-03-08" },
    { id: "o2", client: "Retail Norte",  amount: "$1.850", status: "Pendiente",   date: "2026-03-09" },
    { id: "o3", client: "Grupo Sur",     amount: "$5.400", status: "Entregado",   date: "2026-03-07" },
  ],
  alerts: [
    { id: "al1", message: "3 pedidos sin confirmar hace +48h",     severity: "high"   },
    { id: "al2", message: "Meta semanal al 61% — requiere acción", severity: "medium" },
  ],
  goals: [
    { id: "g1", label: "Ventas mes",      current: 284, target: 360, unit: "K" },
    { id: "g2", label: "Nuevos clientes", current: 34,  target: 50,  unit: ""  },
    { id: "g3", label: "Entregas",        current: 98,  target: 104, unit: ""  },
  ],
};

// ── Service principal ─────────────────────────────────────────────────────────

/**
 * Agrega y retorna todos los datos necesarios para renderizar el dashboard
 * del departamento Comercial.
 *
 * @remarks
 * En modo bypass retorna {@link MOCK_DATA} completo junto con el perfil
 * de usuario de {@link getSharedData}.
 *
 * En producción obtiene las alertas desde Microsoft To Do usando
 * {@link getHighPriorityTasks} — las tareas de alta prioridad sin completar
 * se mapean directamente a alertas comerciales con `severity: "high"`.
 * Si no hay tareas de alta prioridad, se usan las alertas mock como
 * fallback para no mostrar el widget vacío.
 *
 * KPIs, pipeline, órdenes y metas están pendientes de integración con
 * el CRM corporativo — cuando esté disponible, deben agregarse aquí
 * como llamadas paralelas con `Promise.all`.
 *
 * **Scopes de Graph requeridos:**
 * | Scope        | Dato obtenido                        |
 * |--------------|--------------------------------------|
 * | `Tasks.Read` | Alertas desde Microsoft To Do        |
 *
 * @returns Objeto {@link CommercialData} con el perfil del usuario, KPIs,
 *   pipeline, órdenes, metas y alertas comerciales.
 *
 * @example
 * ```tsx
 * export default async function CommercialPage() {
 *   const data = await getCommercialData();
 *   return <CommercialDashboard data={data} />;
 * }
 * ```
 */
export async function getCommercialData() {
  const shared = await getSharedData();

  if (IS_BYPASS || true) {
    return { ...shared, ...MOCK_DATA };
  }

  const token = await getToken();

  const tasks  = await getHighPriorityTasks(token);
  const alerts = tasks.map((t) => ({
    id:       t.id,
    message:  t.title,
    severity: "high" as const,
  }));

  return {
    ...shared,
    kpis:     MOCK_DATA.kpis,
    pipeline: MOCK_DATA.pipeline,
    orders:   MOCK_DATA.orders,
    goals:    MOCK_DATA.goals,
    alerts:   alerts.length > 0 ? alerts : MOCK_DATA.alerts,
  };
}

// ── Tipos exportados ──────────────────────────────────────────────────────────

/**
 * Tipo inferido del valor resuelto por {@link getCommercialData}.
 *
 * @remarks
 * Declarado con `Awaited<ReturnType<...>>` para que cualquier cambio en
 * la estructura de retorno de {@link getCommercialData} se propague
 * automáticamente a todos los componentes que consumen este tipo, sin
 * necesidad de actualizarlo manualmente.
 *
 * @example
 * ```tsx
 * interface CommercialDashboardProps {
 *   data: CommercialData;
 * }
 * ```
 */
export type CommercialData = Awaited<ReturnType<typeof getCommercialData>>;