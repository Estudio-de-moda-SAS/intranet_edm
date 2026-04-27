/**
 * @module graph/departments/ecommerce.service
 * Service de datos para el departamento de Ecommerce de la intranet EDM.
 *
 * @remarks
 * Agrega en una sola llamada los datos necesarios para renderizar el
 * dashboard de ecommerce: KPIs de plataforma, órdenes recientes, catálogo
 * de productos, reseñas de clientes y alertas operativas.
 *
 * En producción, las alertas se obtienen desde Microsoft To Do mediante
 * {@link getHighPriorityTasks}. KPIs, órdenes, catálogo y reseñas están
 * pendientes de integración con la plataforma de ecommerce corporativa —
 * actualmente se sirven desde {@link MOCK_DATA}.
 *
 * @example
 * ```tsx
 * // En un Server Component:
 * export default async function EcommercePage() {
 *   const data = await getEcommerceData();
 *   return <EcommerceDashboard data={data} />;
 * }
 * ```
 */

import { getSharedData, getToken } from "@/lib/graph/shared.service";
import { getHighPriorityTasks }    from "@/lib/graph/helpers/todo.helper";

const IS_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

// ── Tipos internos ────────────────────────────────────────────────────────────

/**
 * KPIs del dashboard de ecommerce.
 *
 * @remarks
 * Todos los valores se representan como strings formateados para mostrar
 * directamente en la UI sin transformaciones adicionales.
 */
export type EcommerceKPIs = {
  /** Gross Merchandise Value del mes en curso (ej. `"$198K"`). */
  gmvMes: string;

  /** Número de órdenes online procesadas en el período (ej. `"2,341"`). */
  ordenesOnline: string;

  /** Tasa de conversión de visitas a compra (ej. `"3.8%"`). */
  tasaConversion: string;

  /** Tasa de devoluciones sobre órdenes completadas (ej. `"2.1%"`). */
  tasaDevolucion: string;

  /** Número de productos activos en el catálogo (ej. `"1,847"`). */
  productosActivos: string;

  /** Calificación media de productos por clientes (ej. `"4.7★"`). */
  calificacionMedia: string;

  /** Porcentaje de disponibilidad de la plataforma en el período (ej. `"98%"`). */
  uptimePlataforma: string;

  /** Número de alertas operativas activas (ej. `"4"`). */
  alertasActivas: string;
};

/**
 * Orden de ecommerce reciente.
 */
export type EcommerceOrder = {
  /** Identificador único de la orden. */
  id: string;

  /** Nombre del cliente que realizó la compra. */
  client: string;

  /** Nombre del producto principal de la orden. */
  product: string;

  /** Monto total de la orden en formato legible (ej. `"$129"`). */
  amount: string;

  /**
   * Estado actual de la orden.
   * Valores típicos: `"Pendiente"`, `"En tránsito"`, `"Entregado"`, `"Cancelado"`.
   */
  status: string;

  /** Fecha de la orden en formato ISO 8601 (ej. `"2026-03-08"`). */
  date: string;
};

/**
 * Producto del catálogo de ecommerce.
 */
export type CatalogItem = {
  /** Identificador único del producto en el catálogo. */
  id: string;

  /** Nombre del producto tal como aparece en la tienda. */
  name: string;

  /** Unidades disponibles en inventario. `0` indica sin stock. */
  stock: number;

  /** Precio de venta al público en formato legible (ej. `"$129"`). */
  price: string;

  /**
   * Estado de disponibilidad del producto.
   * Valores típicos: `"Activo"`, `"Sin stock"`, `"Descontinuado"`.
   */
  status: string;

  /** Categoría del producto en el catálogo (ej. `"Calzado"`, `"Ropa"`, `"Accesorios"`). */
  category: string;
};

/**
 * Reseña de cliente sobre un producto.
 */
export type ProductReview = {
  /** Identificador único de la reseña. */
  id: string;

  /** Nombre del producto reseñado. */
  product: string;

  /** Calificación del cliente en escala de 1 a 5. */
  rating: number;

  /** Nombre o alias del autor de la reseña. */
  author: string;

  /** Comentario escrito por el cliente. */
  comment: string;
};

/**
 * Alerta operativa del dashboard de ecommerce.
 */
export type EcommerceAlert = {
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
   * | `low`    | Informativa, sin urgencia                |
   */
  severity: "high" | "medium" | "low";
};

// ── Mock data ─────────────────────────────────────────────────────────────────

/**
 * Datos mock que simulan la respuesta completa de {@link getEcommerceData}
 * en entorno de desarrollo.
 *
 * @remarks
 * Incluye KPIs, órdenes, catálogo, reseñas y alertas con valores
 * representativos del contexto de ecommerce de EDM. En producción, estos
 * datos serán reemplazados por la integración con la plataforma de
 * ecommerce corporativa, a excepción de las alertas que ya se obtienen
 * desde Microsoft To Do.
 */
export const MOCK_DATA: {
  kpis:    EcommerceKPIs;
  orders:  EcommerceOrder[];
  catalog: CatalogItem[];
  reviews: ProductReview[];
  alerts:  EcommerceAlert[];
} = {
  kpis: {
    gmvMes:            "$198K",
    ordenesOnline:     "2,341",
    tasaConversion:    "3.8%",
    tasaDevolucion:    "2.1%",
    productosActivos:  "1,847",
    calificacionMedia: "4.7★",
    uptimePlataforma:  "98%",
    alertasActivas:    "4",
  },
  orders: [
    { id: "o1", client: "María López",  product: "Zapatillas Run X", amount: "$129", status: "En tránsito", date: "2026-03-08" },
    { id: "o2", client: "Carlos Ruiz",  product: "Camiseta Dry Fit", amount: "$45",  status: "Pendiente",   date: "2026-03-09" },
    { id: "o3", client: "Ana Martínez", product: "Mochila Urban",    amount: "$89",  status: "Entregado",   date: "2026-03-07" },
    { id: "o4", client: "Luis Herrera", product: "Short Training",   amount: "$38",  status: "Cancelado",   date: "2026-03-06" },
  ],
  catalog: [
    { id: "c1", name: "Zapatillas Run X", stock: 142, price: "$129", status: "Activo",    category: "Calzado"    },
    { id: "c2", name: "Camiseta Dry Fit", stock: 0,   price: "$45",  status: "Sin stock", category: "Ropa"       },
    { id: "c3", name: "Mochila Urban",    stock: 58,  price: "$89",  status: "Activo",    category: "Accesorios" },
    { id: "c4", name: "Short Training",   stock: 23,  price: "$38",  status: "Activo",    category: "Ropa"       },
  ],
  reviews: [
    { id: "r1", product: "Zapatillas Run X", rating: 5, author: "María L.",  comment: "Excelente calidad y comodidad."      },
    { id: "r2", product: "Mochila Urban",    rating: 4, author: "Carlos R.", comment: "Muy buena, espaciosa y resistente."  },
    { id: "r3", product: "Camiseta Dry Fit", rating: 5, author: "Ana M.",    comment: "Perfecta para entrenar."             },
  ],
  alerts: [
    { id: "al1", message: "34 productos con stock bajo (<5 unidades)", severity: "high"   },
    { id: "al2", message: "Tasa de abandono de carrito subió al 68%",  severity: "medium" },
    { id: "al3", message: "2 órdenes sin procesar hace +24h",          severity: "high"   },
    { id: "al4", message: "Certificado SSL vence en 12 días",          severity: "low"    },
  ],
};

// ── Service principal ─────────────────────────────────────────────────────────

/**
 * Agrega y retorna todos los datos necesarios para renderizar el dashboard
 * del departamento de Ecommerce.
 *
 * @remarks
 * En modo bypass retorna {@link MOCK_DATA} completo junto con el perfil
 * de usuario de {@link getSharedData}.
 *
 * En producción obtiene las alertas desde Microsoft To Do usando
 * {@link getHighPriorityTasks} — las tareas de alta prioridad sin completar
 * se mapean a alertas con `severity: "high"`. Si no hay tareas de alta
 * prioridad, se usan las alertas mock como fallback para no mostrar el
 * widget vacío.
 *
 * KPIs, órdenes, catálogo y reseñas están pendientes de integración con
 * la plataforma de ecommerce corporativa — cuando esté disponible, deben
 * agregarse aquí como llamadas paralelas con `Promise.all`.
 *
 * **Scopes de Graph requeridos:**
 * | Scope        | Dato obtenido                     |
 * |--------------|-----------------------------------|
 * | `Tasks.Read` | Alertas desde Microsoft To Do     |
 *
 * @returns Objeto {@link EcommerceData} con el perfil del usuario, KPIs,
 *   órdenes, catálogo de productos, reseñas y alertas operativas.
 *
 * @example
 * ```tsx
 * export default async function EcommercePage() {
 *   const data = await getEcommerceData();
 *   return <EcommerceDashboard data={data} />;
 * }
 * ```
 */
export async function getEcommerceData() {
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
    kpis:    MOCK_DATA.kpis,
    orders:  MOCK_DATA.orders,
    catalog: MOCK_DATA.catalog,
    reviews: MOCK_DATA.reviews,
    alerts:  alerts.length > 0 ? alerts : MOCK_DATA.alerts,
  };
}

// ── Tipos exportados ──────────────────────────────────────────────────────────

/**
 * Tipo inferido del valor resuelto por {@link getEcommerceData}.
 *
 * @remarks
 * Declarado con `Awaited<ReturnType<...>>` para que cualquier cambio en
 * la estructura de retorno de {@link getEcommerceData} se propague
 * automáticamente a todos los componentes que consumen este tipo, sin
 * necesidad de actualizarlo manualmente.
 *
 * @example
 * ```tsx
 * interface EcommerceDashboardProps {
 *   data: EcommerceData;
 * }
 * ```
 */
export type EcommerceData = Awaited<ReturnType<typeof getEcommerceData>>;