/**
 * @module CommercialOrdersCard
 * Tarjeta de pedidos recientes del canal Comercial dentro del módulo de Retail.
 *
 * @remarks
 * Este componente renderiza una vista resumida de pedidos recientes
 * asociados al frente comercial, integrando órdenes de distintos canales
 * o contextos de negocio en un mismo panel operativo.
 *
 * Su propósito es ofrecer una lectura rápida sobre:
 * - clientes o cuentas asociadas a pedidos recientes
 * - volumen de unidades por orden
 * - valor total de la orden
 * - estado operativo del pedido
 * - fecha relativa
 * - canal de origen
 *
 * La información mostrada es estática y funciona como mock de interfaz.
 * En una implementación productiva, estos datos podrían provenir de:
 * - ERP comercial
 * - sistema de órdenes B2B
 * - OMS (Order Management System)
 * - integraciones con e-commerce o marketplaces
 */

import { ShoppingBag, ArrowRight, CheckCircle, Clock, Truck, XCircle } from "lucide-react";
import Link from "next/link";

/**
 * Estados operativos admitidos para una orden comercial.
 *
 * @remarks
 * Este tipo define las fases resumidas del ciclo operativo
 * de un pedido dentro de la tarjeta.
 */
type OrderStatus = "confirmed" | "processing" | "shipped" | "cancelled";

/**
 * Representa una orden reciente dentro del panel comercial.
 *
 * @remarks
 * Este tipo modela la información mínima necesaria para mostrar
 * un pedido en la lista de órdenes recientes.
 *
 * Incluye:
 * - identificador del pedido
 * - cliente o referencia del pedido
 * - cantidad de unidades
 * - valor total
 * - estado actual
 * - fecha relativa
 * - canal de origen
 *
 * @property id Identificador visible de la orden.
 * @property client Nombre del cliente o referencia resumida del pedido.
 * @property items Cantidad de unidades incluidas en la orden.
 * @property total Valor total de la orden.
 * @property status Estado operativo actual del pedido.
 * @property date Marca temporal relativa del pedido.
 * @property channel Canal o segmento comercial asociado.
 */
type Order = {
  id: string;
  client: string;
  items: number;
  total: number;
  status: OrderStatus;
  date: string;
  channel: string;
};

/**
 * Configuración visual asociada al estado de una orden.
 *
 * @remarks
 * Este objeto centraliza la semántica visual de los distintos
 * estados de pedido.
 *
 * Para cada estado se define:
 * - ícono representativo
 * - color de texto
 * - color de fondo del badge
 * - etiqueta visible
 *
 * Esto permite mantener consistencia visual en el render
 * del estado de cada orden.
 */
const STATUS_CONFIG: Record<OrderStatus, { icon: React.ElementType; text: string; bg: string; label: string }> = {
  confirmed:  { icon: CheckCircle, text: "text-emerald-600", bg: "bg-emerald-50", label: "Confirmado" },
  processing: { icon: Clock,       text: "text-amber-600",   bg: "bg-amber-50",   label: "En proceso" },
  shipped:    { icon: Truck,       text: "text-sky-600",     bg: "bg-sky-50",     label: "Despachado" },
  cancelled:  { icon: XCircle,     text: "text-rose-500",    bg: "bg-rose-50",    label: "Cancelado"  },
};

/**
 * Dataset estático de pedidos recientes.
 *
 * @remarks
 * Este arreglo contiene ejemplos representativos de órdenes recientes
 * visibles dentro del panel comercial.
 *
 * Incluye mezcla de contextos como:
 * - cuentas mayoristas
 * - key accounts
 * - pedidos web
 *
 * Esto permite validar la visualización de distintos estados,
 * canales y magnitudes de pedido.
 */
const ORDERS: Order[] = [
  { id: "OC-2024-0841", client: "Grupo Éxito",      items: 240, total: 18400, status: "shipped",    date: "Hoy",         channel: "Mayorista"  },
  { id: "OC-2024-0840", client: "Falabella",        items: 85,  total: 9200,  status: "confirmed",  date: "Hoy",         channel: "Key Account" },
  { id: "OC-2024-0839", client: "Pedido web #4421", items: 3,   total: 284,   status: "processing", date: "Hoy",         channel: "E-commerce"  },
  { id: "OC-2024-0838", client: "Arturo Calle",     items: 120, total: 11600, status: "shipped",    date: "Ayer",        channel: "Mayorista"   },
  { id: "OC-2024-0837", client: "Studio F",         items: 60,  total: 7400,  status: "confirmed",  date: "Ayer",        channel: "Mayorista"   },
  { id: "OC-2024-0836", client: "Pedido web #4418", items: 2,   total: 128,   status: "cancelled",  date: "Hace 2 días", channel: "E-commerce"  },
];

/**
 * Tarjeta de pedidos recientes del canal comercial.
 *
 * @returns Un componente visual con una lista de órdenes recientes y su estado operativo.
 *
 * @remarks
 * Este componente presenta una vista compacta de pedidos recientes
 * relevantes para el equipo comercial.
 *
 * Calcula además la cantidad de pedidos en proceso (`pendingCount`)
 * para destacarla en el encabezado del panel.
 *
 * La tarjeta se organiza en dos bloques:
 *
 * 1. **Header**
 *    - muestra el título de la sección
 *    - resalta el número de pedidos en proceso
 *    - ofrece acceso a la vista completa
 *
 * 2. **Listado de órdenes**
 *    - muestra cliente, canal, identificador y unidades
 *    - resalta el valor monetario de la orden
 *    - representa el estado mediante badge con ícono
 *
 * Esta tarjeta resulta útil para:
 * - monitoreo rápido de pedidos recientes
 * - visibilidad operativa del flujo comercial
 * - seguimiento de órdenes activas
 * - revisión de mezcla entre pedidos B2B y digital
 *
 * @example
 * ```tsx
 * <CommercialOrdersCard />
 * ```
 */
export default function CommercialOrdersCard() {
  /**
   * Cantidad total de pedidos actualmente en proceso.
   *
   * @remarks
   * Se calcula a partir del dataset para mostrar una alerta rápida
   * en el encabezado del componente.
   */
  const pendingCount = ORDERS.filter((o) => o.status === "processing").length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50">
            <ShoppingBag className="h-3.5 w-3.5 text-sky-600" />
          </span>
          <h2 className="text-sm font-semibold text-slate-800">Pedidos Recientes</h2>
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-50 border border-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
              {pendingCount} en proceso
            </span>
          )}
        </div>
        <Link href="/comercial/pedidos" className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-emerald-600 transition-colors">
          Ver todos <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <ul className="divide-y divide-slate-50">
        {ORDERS.map((order) => {
          const cfg = STATUS_CONFIG[order.status];
          const Icon = cfg.icon;

          return (
            <li key={order.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors cursor-pointer">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold text-slate-800 truncate">{order.client}</p>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-px text-[10px] font-medium text-slate-500">
                    {order.channel}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] font-mono text-slate-400">{order.id}</span>
                  <span className="text-slate-200">·</span>
                  <span className="text-[11px] text-slate-400">{order.items} uds. · {order.date}</span>
                </div>
              </div>

              <span className="text-[13px] font-bold text-slate-800 tabular-nums shrink-0">
                ${order.total.toLocaleString()}
              </span>

              <span className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold shrink-0 ${cfg.bg} ${cfg.text}`}>
                <Icon className="h-3 w-3" />
                {cfg.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}