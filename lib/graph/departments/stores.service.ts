/**
 * @module graph/departments/stores.service
 * Service de datos para el canal de Tiendas Físicas de la intranet EDM.
 *
 * @remarks
 * Agrega en una sola llamada los datos necesarios para renderizar el
 * dashboard de tiendas: estadísticas del día, estado operativo por
 * tienda, incidentes activos, tabla de ventas, ranking, reposición
 * urgente y cierres de caja pendientes.
 *
 * En producción, los incidentes se obtienen desde Microsoft To Do
 * mediante {@link getHighPriorityTasks} — las tareas de alta prioridad
 * se mapean directamente a incidentes operativos. El resto de los datos
 * está pendiente de integración con los sistemas especializados:
 *
 * | Dato            | Sistema previsto                        |
 * |-----------------|-----------------------------------------|
 * | `stats`         | POS corporativo / sistema retail        |
 * | `stores`        | POS corporativo                         |
 * | `salesTable`    | POS corporativo                         |
 * | `ranking`       | POS corporativo                         |
 * | `replenishment` | WMS (Warehouse Management System)       |
 * | `closings`      | POS corporativo                         |
 * | `incidents`     | Microsoft To Do (ya integrado)          |
 *
 * **Scopes de Graph requeridos:**
 * | Scope        | Dato obtenido                             |
 * |--------------|-------------------------------------------|
 * | `Tasks.Read` | Incidentes desde Microsoft To Do          |
 *
 * @example
 * ```tsx
 * // En un Server Component:
 * export default async function StoresPage() {
 *   const data = await getStoresData();
 *   return <StoresDashboard data={data} />;
 * }
 * ```
 */

import { getSharedData, getToken } from "@/lib/graph/shared.service";
import { getHighPriorityTasks }    from "@/lib/graph/helpers/todo.helper";
import type { GraphTask }          from "@/lib/graph/helpers/todo.helper";

const IS_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

// ── Mock data ─────────────────────────────────────────────────────────────────

/**
 * Datos mock del dashboard de Tiendas Físicas para desarrollo local
 * sin Azure ni POS conectado.
 *
 * @remarks
 * Incluye 8 tiendas representativas de las principales ciudades de
 * Colombia con distintos estados operativos, incidentes activos, tabla
 * de ventas con variación vs meta, ranking, alertas de reposición y
 * cierres de caja con desviación.
 *
 * En producción, `incidents` se reemplaza con tareas reales de
 * Microsoft To Do. El resto permanece como mock hasta integrar el POS
 * y WMS corporativos.
 */
export const MOCK_DATA = {
  /**
   * Estadísticas resumen del día para el widget de KPIs.
   * Los valores están en euros (€) formateados para mostrar en la UI.
   */
  stats: {
    /** Facturación total acumulada del día en todas las tiendas (ej. `"€63.2K"`). */
    facturacionHoy: "€63.2K",
    /** Número de tiendas con algún incidente operativo activo. */
    tiendasConIncidencia: "2",
    /** Tasa de conversión promedio de todas las tiendas (ej. `"4.6%"`). */
    conversionMedia: "4.6%",
    /** Valor promedio por ticket de venta en todas las tiendas (ej. `"€64.20"`). */
    ticketMedio: "€64.20",
  },

  /**
   * Estado operativo actual de cada tienda para el mapa/grid de tiendas.
   *
   * | `status`      | Descripción                                    |
   * |---------------|------------------------------------------------|
   * | `operational` | Tienda operando con normalidad                 |
   * | `incident`    | Tienda con incidente activo que requiere acción|
   */
  stores: [
    { id: "st1", name: "Bogotá Centro",       sales: "€12.4K", target: "€11K",  conversion: "5.1%", status: "operational", staff: 8 },
    { id: "st2", name: "Medellín El Poblado", sales: "€9.8K",  target: "€10K",  conversion: "4.2%", status: "incident",     staff: 6 },
    { id: "st3", name: "Cali Chipichape",     sales: "€8.1K",  target: "€8.5K", conversion: "4.8%", status: "operational", staff: 5 },
    { id: "st4", name: "Barranquilla CC",     sales: "€7.6K",  target: "€7K",   conversion: "5.3%", status: "operational", staff: 6 },
    { id: "st5", name: "Bogotá Usaquén",      sales: "€6.9K",  target: "€8K",   conversion: "3.9%", status: "operational", staff: 5 },
    { id: "st6", name: "Cartagena Centro",    sales: "€5.4K",  target: "€6K",   conversion: "4.1%", status: "incident",     staff: 4 },
    { id: "st7", name: "Pereira Unicentro",   sales: "€7.2K",  target: "€7K",   conversion: "5.0%", status: "operational", staff: 5 },
    { id: "st8", name: "Bucaramanga CC",      sales: "€5.8K",  target: "€6.5K", conversion: "4.4%", status: "operational", staff: 4 },
  ],

  /**
   * Incidentes operativos activos en tiendas.
   *
   * En producción este array se reemplaza con tareas de alta prioridad
   * de Microsoft To Do obtenidas mediante {@link getHighPriorityTasks}.
   * `since` indica el momento de detección en formato ISO 8601.
   */
  incidents: [
    { id: "in1", store: "Medellín El Poblado", type: "TPV sin conexión",        severity: "high", since: "2026-03-10T09:15:00", assignee: "Soporte TI" },
    { id: "in2", store: "Cartagena Centro",    type: "Alarma antihurto activa", severity: "high", since: "2026-03-10T10:30:00", assignee: "Seguridad"  },
  ],

  /**
   * Tabla detallada de ventas por tienda con métricas de desempeño.
   *
   * `vsTarget` es la variación porcentual sobre la meta del día,
   * formateada con signo (ej. `"+12.7%"`, `"−2.0%"`).
   * `trend` indica la tendencia respecto al día anterior.
   */
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

  /**
   * Ranking de tiendas por desempeño vs meta del día.
   * Solo incluye las top 5 tiendas para el widget de ranking.
   */
  ranking: [
    { position: 1, store: "Bogotá Centro",     vsTarget: "+12.7%", trend: "up"   },
    { position: 2, store: "Barranquilla CC",   vsTarget: "+8.6%",  trend: "up"   },
    { position: 3, store: "Pereira Unicentro", vsTarget: "+2.9%",  trend: "up"   },
    { position: 4, store: "Cali Chipichape",   vsTarget: "−4.7%",  trend: "down" },
    { position: 5, store: "Bogotá Usaquén",    vsTarget: "−13.8%", trend: "down" },
  ],

  /**
   * Alertas de reposición urgente de productos en tiendas específicas.
   *
   * | `urgency`  | Descripción                              |
   * |------------|------------------------------------------|
   * | `critical` | Stock en 0 o por debajo del mínimo crítico|
   * | `high`     | Stock muy bajo, requiere reposición hoy  |
   */
  replenishment: [
    { id: "rp1", product: "Zapatillas Run X Talla 42", store: "Bogotá Usaquén",     stock: 1, minStock: 5, urgency: "critical" },
    { id: "rp2", product: "Camiseta Dry Fit M",        store: "Medellín El Poblado", stock: 0, minStock: 8, urgency: "critical" },
    { id: "rp3", product: "Short Training S",          store: "Cartagena Centro",    stock: 2, minStock: 6, urgency: "high"     },
    { id: "rp4", product: "Mochila Urban Negra",       store: "Bucaramanga CC",      stock: 3, minStock: 5, urgency: "high"     },
  ],

  /**
   * Cierres de caja del día con desviación vs esperado.
   *
   * | `status` | Descripción                                    |
   * |----------|------------------------------------------------|
   * | `alert`  | Desviación significativa que requiere revisión |
   * | `review` | Desviación menor que debe ser verificada       |
   */
  closings: [
    { id: "cl1", store: "Bogotá Usaquén",   expectedClose: "2026-03-10T21:00:00", deviation: "−€1.100", status: "alert"  },
    { id: "cl2", store: "Cartagena Centro", expectedClose: "2026-03-10T20:30:00", deviation: "−€600",   status: "review" },
  ],
};

// ── Service principal ─────────────────────────────────────────────────────────

/**
 * Agrega y retorna todos los datos necesarios para renderizar el dashboard
 * del canal de Tiendas Físicas.
 *
 * @remarks
 * En modo bypass retorna {@link MOCK_DATA} completo junto con el perfil
 * de usuario de {@link getSharedData}.
 *
 * En producción obtiene los incidentes operativos desde Microsoft To Do
 * usando {@link getHighPriorityTasks} — las tareas de alta prioridad sin
 * completar se mapean a incidentes con `severity: "high"`. Los campos
 * `store` y `assignee` se rellenan con `"—"` hasta que se integre el
 * sistema de gestión de incidencias de tiendas.
 *
 * Si no hay tareas de alta prioridad en To Do, se usa
 * {@link MOCK_DATA.incidents} como fallback para no mostrar el widget
 * de incidentes vacío.
 *
 * @returns Objeto {@link StoresData} con el perfil del usuario,
 *   estadísticas del día, estado por tienda, incidentes, tabla de ventas,
 *   ranking, reposición urgente y cierres de caja.
 *
 * @example
 * ```tsx
 * export default async function StoresPage() {
 *   const data = await getStoresData();
 *   return <StoresDashboard data={data} />;
 * }
 * ```
 */
export async function getStoresData() {
  const shared = await getSharedData();

  if (IS_BYPASS || true) {
    return { ...shared, ...MOCK_DATA };
  }

  const token = await getToken();

  const tasks: GraphTask[] = await getHighPriorityTasks(token);

  const incidents = tasks.map((t) => ({
    id:       t.id,
    store:    "—",
    type:     t.title,
    severity: "high" as const,
    since:    t.createdDateTime ?? new Date().toISOString(),
    assignee: "—",
  }));

  return {
    ...shared,
    stats:         MOCK_DATA.stats,
    stores:        MOCK_DATA.stores,
    salesTable:    MOCK_DATA.salesTable,
    ranking:       MOCK_DATA.ranking,
    replenishment: MOCK_DATA.replenishment,
    closings:      MOCK_DATA.closings,
    incidents:     incidents.length > 0 ? incidents : MOCK_DATA.incidents,
  };
}

// ── Tipos exportados ──────────────────────────────────────────────────────────

/**
 * Tipo inferido del valor resuelto por {@link getStoresData}.
 *
 * @remarks
 * Declarado con `Awaited<ReturnType<...>>` para que cualquier cambio en
 * la estructura de retorno de {@link getStoresData} se propague
 * automáticamente a todos los componentes que consumen este tipo, sin
 * necesidad de actualizarlo manualmente.
 *
 * @example
 * ```tsx
 * interface StoresDashboardProps {
 *   data: StoresData;
 * }
 * ```
 */
export type StoresData = Awaited<ReturnType<typeof getStoresData>>;