/**
 * @module StoreSidebarCards
 * Tarjetas laterales del canal de tiendas dentro del módulo de Retail.
 *
 * @remarks
 * Este archivo agrupa componentes secundarios orientados al monitoreo
 * rápido del desempeño y las necesidades operativas de tiendas físicas.
 *
 * Actualmente incluye:
 * - {@link TiendasRankingCard}: ranking de tiendas por ventas del día
 * - {@link TiendasReplenishmentCard}: resumen de referencias con necesidad de reposición
 *
 * Estos componentes están pensados para mostrarse como tarjetas laterales
 * o complementarias dentro de dashboards operativos del canal retail,
 * ofreciendo visibilidad inmediata sobre:
 * - rendimiento comercial por tienda
 * - desviación frente a objetivos
 * - quiebres o niveles críticos de inventario
 * - cobertura de reposición en la red
 *
 * La información presentada es estática y funciona como mock de interfaz.
 * En una implementación productiva, estos datos podrían provenir de:
 * - sistemas POS
 * - ERP o inventario
 * - tableros comerciales
 * - servicios de reposición y abastecimiento
 */

"use client";

import { Trophy, Package, AlertCircle, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";

/**
 * Representa una tienda destacada dentro del ranking diario de ventas.
 *
 * @property rank Posición en el ranking.
 * @property name Nombre del punto de venta.
 * @property city Ciudad de la tienda.
 * @property sales Valor total vendido en el día.
 * @property vs Variación porcentual frente al objetivo diario.
 * @property badge Distintivo visual opcional para posiciones destacadas.
 */
type TopPerformer = {
  rank: number;
  name: string;
  city: string;
  sales: number;
  vs: number;
  badge: string | null;
};

/**
 * Representa una tienda con desempeño por debajo del objetivo.
 *
 * @property rank Posición dentro del grupo bajo objetivo.
 * @property name Nombre del punto de venta.
 * @property city Ciudad de la tienda.
 * @property pct Porcentaje de cumplimiento del objetivo diario.
 * @property gap Brecha monetaria frente a la meta.
 */
type BottomPerformer = {
  rank: number;
  name: string;
  city: string;
  pct: number;
  gap: number;
};

/**
 * Representa una referencia que requiere reposición en tienda.
 *
 * @property store Nombre de la tienda afectada.
 * @property city Ciudad de la tienda.
 * @property sku Identificador único del producto.
 * @property name Nombre comercial o descriptivo del producto.
 * @property stock Unidades actualmente disponibles.
 * @property min Stock mínimo esperado.
 * @property urgent Indica si la reposición es crítica.
 */
type ReplenishmentItem = {
  store: string;
  city: string;
  sku: string;
  name: string;
  stock: number;
  min: number;
  urgent: boolean;
};

/**
 * Ranking estático de tiendas con mejor desempeño del día.
 *
 * @remarks
 * Este arreglo representa el top de tiendas según ventas diarias,
 * incluyendo comparación frente al objetivo y un distintivo de ranking.
 *
 * Cada elemento contiene:
 * - posición en el ranking
 * - nombre de la tienda
 * - ciudad
 * - valor vendido
 * - variación porcentual frente al objetivo
 * - badge visual opcional para destacar primeros lugares
 */
const TOP_PERFORMERS: TopPerformer[] = [
  { rank: 1, name: "Diesel Andino",        city: "Bogotá",       sales: 8_420_000, vs: +7.9,  badge: "🥇" },
  { rank: 2, name: "Pilatos Mayorca",      city: "Medellín",     sales: 6_150_000, vs: +4.2,  badge: "🥈" },
  { rank: 3, name: "Diesel El Tesoro",     city: "Medellín",     sales: 6_910_000, vs: +6.3,  badge: "🥉" },
  { rank: 4, name: "Kipling Unicentro",    city: "Bogotá",       sales: 4_780_000, vs: +13.8, badge: null  },
  { rank: 5, name: "Diesel Chipichape",    city: "Cali",         sales: 4_210_000, vs: -15.8, badge: null  },
];

/**
 * Ranking estático de tiendas por debajo del objetivo diario.
 *
 * @remarks
 * Este arreglo reúne puntos de venta cuyo desempeño se encuentra
 * por debajo de la meta esperada del día.
 *
 * Cada elemento incluye:
 * - posición dentro del grupo bajo objetivo
 * - nombre de la tienda
 * - ciudad
 * - porcentaje de cumplimiento del objetivo
 * - brecha monetaria frente a la meta
 *
 * Este dataset se utiliza para resaltar tiendas que requieren
 * seguimiento comercial o correctivos operativos.
 */
const BOTTOM_PERFORMERS: BottomPerformer[] = [
  { rank: 1, name: "Superdry Prime Outlet", city: "Medellín",     pct: 71, gap: -1_800_000 },
  { rank: 2, name: "Pilatos Fontanar",      city: "Bogotá",       pct: 79, gap: -460_000   },
  { rank: 3, name: "Kipling Buenavista",    city: "Barranquilla", pct: 81, gap: -220_000   },
];

/**
 * Formatea un valor numérico como moneda en pesos colombianos.
 *
 * @param n Valor numérico a formatear.
 * @returns Cadena formateada en COP sin decimales.
 *
 * @remarks
 * Esta función se utiliza para mantener consistencia en la presentación
 * de montos monetarios dentro de las tarjetas de desempeño y reposición.
 *
 * @example
 * ```ts
 * fmt(8420000);
 * ```
 */
function fmt(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(n);
}

/**
 * Tarjeta de ranking diario de tiendas por ventas.
 *
 * @returns Un componente visual con el top de tiendas y el grupo bajo objetivo.
 *
 * @remarks
 * Este componente presenta un resumen comercial del desempeño del día
 * para la red de tiendas físicas.
 *
 * La interfaz se divide en dos bloques:
 *
 * 1. **Más vendidas**
 *    - muestra las tiendas con mayor venta acumulada
 *    - compara cada resultado frente al objetivo diario
 *    - resalta visualmente el sentido de la variación
 *
 * 2. **Bajo objetivo**
 *    - identifica tiendas con menor cumplimiento
 *    - muestra la brecha monetaria frente a la meta
 *    - utiliza una barra visual para expresar el porcentaje de logro
 *
 * Esta tarjeta es útil para:
 * - seguimiento comercial rápido
 * - monitoreo de cumplimiento diario
 * - identificación de tiendas destacadas
 * - detección de puntos de venta con bajo rendimiento
 *
 * @example
 * ```tsx
 * <TiendasRankingCard />
 * ```
 */
export function TiendasRankingCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50">
          <Trophy className="h-3.5 w-3.5 text-amber-500" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-800">Ranking hoy</p>
          <p className="text-[11px] text-slate-400">Por ventas del día</p>
        </div>
      </div>

      <div className="px-5 pt-4 pb-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Más vendidas</p>
        <ul className="flex flex-col gap-2">
          {TOP_PERFORMERS.map(s => (
            <li key={s.name} className="flex items-center gap-2.5">
              <span className="w-5 text-center text-[13px]">
                {s.badge ?? <span className="text-[11px] font-bold text-slate-400">#{s.rank}</span>}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-semibold text-slate-800 truncate">{s.name}</p>
                  <p className="text-[12px] font-bold text-slate-700">{fmt(s.sales)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-slate-400">{s.city}</p>
                  <span className={`flex items-center gap-0.5 text-[10px] font-bold ${s.vs >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                    {s.vs >= 0 ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
                    {Math.abs(s.vs)}% vs obj.
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-5 pt-3 pb-4 border-t border-slate-100 mt-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-2.5">Bajo objetivo</p>
        <ul className="flex flex-col gap-2">
          {BOTTOM_PERFORMERS.map(s => (
            <li key={s.name} className="flex items-center gap-2.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[12px] font-semibold text-slate-700">
                    {s.name} · <span className="text-slate-400 font-normal">{s.city}</span>
                  </p>
                  <span className="text-[11px] font-bold text-rose-500">{fmt(s.gap)}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-rose-400" style={{ width: `${s.pct}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{s.pct}% del objetivo diario</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Stock Replenishment ───────────────────────────────────────────

/**
 * Dataset estático de referencias que requieren reposición.
 *
 * @remarks
 * Este arreglo contiene productos con niveles de inventario
 * por debajo del mínimo esperado en distintas tiendas.
 *
 * Cada elemento representa una necesidad de reposición e incluye:
 * - tienda y ciudad
 * - SKU y nombre del producto
 * - stock actual
 * - mínimo esperado
 * - indicador de urgencia
 *
 * El campo `urgent` permite distinguir los casos más críticos,
 * como agotados o referencias con stock insuficiente severo.
 */
const REPLENISHMENT: ReplenishmentItem[] = [
  { store: "Diesel El Tesoro",      city: "Medellín",     sku: "DSL-DSTR-BLK-30",  name: "D-Strukt slim 30/32 negro",   stock: 0, min: 6,  urgent: true  },
  { store: "Superdry Prime Outlet", city: "Medellín",     sku: "SPD-VTGLOG-NVY-M", name: "Vintage Logo hoodie navy M", stock: 1, min: 8,  urgent: true  },
  { store: "Diesel Chipichape",     city: "Cali",         sku: "DSL-1DR-BRN-OS",   name: "1DR Shoulder Bag brown OS",  stock: 0, min: 4,  urgent: true  },
  { store: "Kipling Buenavista",    city: "Barranquilla", sku: "KPL-SEOULG-BLK",   name: "Seoul Large Backpack negro", stock: 3, min: 10, urgent: false },
  { store: "Pilatos Fontanar",      city: "Bogotá",       sku: "NB-574-GRY-42",    name: "New Balance 574 gris T.42",  stock: 2, min: 6,  urgent: false },
];

/**
 * Tarjeta de reposición urgente para tiendas físicas.
 *
 * @returns Un componente visual con referencias críticas de inventario.
 *
 * @remarks
 * Este componente resume las necesidades más relevantes de reposición
 * en la red de tiendas físicas.
 *
 * Su objetivo es brindar visibilidad rápida sobre:
 * - referencias agotadas
 * - productos por debajo del mínimo operativo
 * - cantidad total de referencias afectadas
 * - número de tiendas involucradas
 *
 * El encabezado muestra métricas derivadas del dataset:
 * - cantidad de referencias críticas (`urgentCount`)
 * - total de elementos en seguimiento
 *
 * El pie de la tarjeta resume la cobertura del problema
 * y ofrece acceso directo al flujo de reposición.
 *
 * Este componente resulta útil para:
 * - operación de inventario
 * - monitoreo de quiebres de stock
 * - priorización de abastecimiento
 * - coordinación entre retail y logística
 *
 * @example
 * ```tsx
 * <TiendasReplenishmentCard />
 * ```
 */
export function TiendasReplenishmentCard() {
  /**
   * Número de referencias marcadas como urgentes.
   *
   * @remarks
   * Se calcula a partir del dataset para destacar
   * la cantidad de casos críticos en el encabezado.
   */
  const urgentCount = REPLENISHMENT.filter(r => r.urgent).length;

  /**
   * Número de tiendas únicas afectadas por necesidades de reposición.
   *
   * @remarks
   * Se obtiene a partir del conjunto de tiendas presentes
   * en el dataset de reposición.
   */
  const storeCount  = new Set(REPLENISHMENT.map(r => r.store)).size;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50">
            <Package className="h-3.5 w-3.5 text-rose-500" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Reposición urgente</p>
            <p className="text-[11px] text-slate-400">{urgentCount} referencias críticas</p>
          </div>
        </div>
        <span className="rounded-full bg-rose-50 border border-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-600">
          {REPLENISHMENT.length}
        </span>
      </div>

      <ul className="divide-y divide-slate-50">
        {REPLENISHMENT.map((item) => (
          <li key={`${item.store}-${item.sku}`} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors">
            <span className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${item.urgent ? "bg-rose-100" : "bg-amber-50"}`}>
              <AlertCircle className={`h-3 w-3 ${item.urgent ? "text-rose-500" : "text-amber-400"}`} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[12px] font-semibold text-slate-800 leading-snug">{item.name}</p>
                  <p className="text-[10px] text-slate-400">{item.store} · {item.city}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-[12px] font-bold ${item.stock === 0 ? "text-rose-600" : "text-amber-600"}`}>
                    {item.stock === 0 ? "Agotado" : `${item.stock} ud.`}
                  </p>
                  <p className="text-[10px] text-slate-400">mín. {item.min}</p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
        <p className="text-[11px] text-slate-400">{REPLENISHMENT.length} referencias en {storeCount} tiendas</p>
        <a href="/tiendas/reposicion" className="flex items-center gap-0.5 text-[12px] font-medium text-orange-600 hover:text-orange-700 transition-colors">
          Gestionar reposición <ChevronRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}