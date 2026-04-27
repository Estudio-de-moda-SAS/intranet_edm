"use client";

import { Activity } from "lucide-react";

/**
 * @module ProductActivityFeed
 * Feed de actividad reciente del módulo de Producto.
 */

/**
 * Representa un evento dentro del feed de actividad del área.
 *
 * @property actor Responsable o emisor de la acción.
 * @property action Acción ejecutada.
 * @property target Entidad o recurso afectado por la acción.
 * @property time Marca temporal relativa.
 * @property type Tipo de evento para representación visual.
 */
type FeedItem = {
  actor: string;
  action: string;
  target: string;
  time: string;
  type: "approval" | "upload" | "change" | "comment";
};

/**
 * Configuración visual del indicador de cada tipo de actividad.
 */
const FEED_DOT: Record<FeedItem["type"], string> = {
  approval: "bg-emerald-400",
  upload: "bg-sky-400",
  change: "bg-amber-400",
  comment: "bg-stone-300",
};

/**
 * Dataset estático del feed de actividad reciente.
 *
 * @remarks
 * Este arreglo representa acciones recientes realizadas
 * por el equipo de Producto o por el sistema.
 */
const FEED_ITEMS: FeedItem[] = [
  {
    actor: "Valentina M.",
    action: "aprobó la muestra R2 de",
    target: "BL-2501 · Blusa lino perforada",
    time: "hace 15 min",
    type: "approval",
  },
  {
    actor: "Carlos R.",
    action: "subió ficha técnica de",
    target: "PA-2517 · Pantalón palazzo crêpe",
    time: "hace 1 h",
    type: "upload",
  },
  {
    actor: "Sistema",
    action: "rechazó muestra de",
    target: "CU-2542 · Cubre-bikini kimono",
    time: "hace 2 h",
    type: "change",
  },
  {
    actor: "Laura P.",
    action: "actualizó medidas de talla en",
    target: "VE-2508 · Vestido lencero midi",
    time: "hace 3 h",
    type: "change",
  },
  {
    actor: "Dirección",
    action: "comentó en colección",
    target: "Resort 2025",
    time: "ayer",
    type: "comment",
  },
  {
    actor: "Carlos R.",
    action: "creó ficha técnica de",
    target: "SH-2545 · Short bordado a mano",
    time: "ayer",
    type: "upload",
  },
  {
    actor: "Valentina M.",
    action: "cerró revisión de",
    target: "FW-24 · Otoño Invierno 2024",
    time: "hace 2 días",
    type: "approval",
  },
];

/**
 * Propiedades del componente {@link ProductActivityFeed}.
 *
 * @property limit Cantidad máxima de eventos a mostrar.
 */
type ActivityProps = { limit?: number };

/**
 * Feed de actividad reciente del módulo de Producto.
 *
 * @param props Propiedades del componente.
 * @param props.limit Número máximo de eventos visibles.
 * @returns Un timeline compacto con acciones recientes del equipo.
 *
 * @remarks
 * Este componente muestra una secuencia temporal resumida
 * de acciones recientes realizadas dentro del flujo de Producto.
 *
 * Resulta útil para ofrecer visibilidad sobre:
 * - aprobaciones
 * - cargas de fichas
 * - cambios de estado
 * - comentarios y revisiones
 *
 * @example
 * ```tsx
 * <ProductActivityFeed limit={5} />
 * ```
 */
export function ProductActivityFeed({ limit = 7 }: ActivityProps) {
  const items = FEED_ITEMS.slice(0, limit);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100">
          <Activity className="h-3.5 w-3.5 text-stone-600" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Actividad reciente</h2>
          <p className="text-[11px] text-slate-400">Últimas acciones del equipo de producto</p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-[7px] top-0 bottom-0 w-px bg-stone-100" />
        <div className="space-y-3 pl-5">
          {items.map((item, i) => (
            <div key={i} className="relative">
              <span
                className={`absolute -left-[18px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white ${FEED_DOT[item.type]}`}
              />
              <p className="text-[12px] text-slate-700 leading-snug">
                <span className="font-semibold">{item.actor}</span>{" "}
                {item.action}{" "}
                <span className="font-medium text-slate-800">{item.target}</span>
              </p>
              <p className="text-[10px] text-stone-400 mt-0.5">{item.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}