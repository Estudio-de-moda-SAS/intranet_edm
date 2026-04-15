/**
 * @module ITStatusCard
 * Tarjeta compacta para visualizar el estado operativo de una tienda o servicio.
 *
 * @remarks
 * Este componente presenta una vista resumida del estado de una entidad
 * (store/servicio), incluyendo:
 *
 * - Nombre de la tienda o sistema
 * - Estado operativo (con badge visual)
 * - Métricas rápidas como uptime y latencia
 * - Indicador gráfico de salud (health) mediante gauge
 *
 * Está diseñado para ser utilizado en listados o dashboards donde se requiere
 * una lectura rápida del estado general de múltiples servicios.
 */

import ITGaugeCard from "./ITGaugeCard";

/**
 * Modelo de datos de una tienda o servicio monitoreado.
 *
 * @property id Identificador único de la tienda.
 * @property name Nombre visible de la tienda o servicio.
 * @property status Estado operativo (puede venir en distintos formatos/idiomas).
 * @property uptime Tiempo de disponibilidad acumulado.
 * @property latency Latencia actual del servicio.
 * @property health Indicador numérico de salud (0–100).
 */
type Store = {
  id: string;
  name: string;
  status: string;
  uptime: string;
  latency: string;
  health: number;
};

/**
 * Configuración visual asociada a los estados de la tienda.
 *
 * @remarks
 * Este objeto permite mapear múltiples variantes de estado (en español e inglés)
 * a un mismo estilo visual consistente.
 *
 * Incluye:
 * - badge: estilos de fondo y borde
 * - text: color del texto
 * - dot: indicador circular de estado
 */
const STATUS_CONFIG: Record<
  string,
  { badge: string; text: string; dot: string }
> = {
  // Spanish
  operativo:     { badge: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", dot: "bg-emerald-400" },
  reducido:      { badge: "bg-amber-50 border-amber-100",     text: "text-amber-700",   dot: "bg-amber-400"   },
  mantenimiento: { badge: "bg-sky-50 border-sky-100",         text: "text-sky-700",     dot: "bg-sky-400"     },
  caido:         { badge: "bg-rose-50 border-rose-100",       text: "text-rose-700",    dot: "bg-rose-400"    },

  // English aliases
  operational:   { badge: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", dot: "bg-emerald-400" },
  degraded:      { badge: "bg-amber-50 border-amber-100",     text: "text-amber-700",   dot: "bg-amber-400"   },
  maintenance:   { badge: "bg-sky-50 border-sky-100",         text: "text-sky-700",     dot: "bg-sky-400"     },
  down:          { badge: "bg-rose-50 border-rose-100",       text: "text-rose-700",    dot: "bg-rose-400"    },

  // Generic aliases
  ok:            { badge: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", dot: "bg-emerald-400" },
  warning:       { badge: "bg-amber-50 border-amber-100",     text: "text-amber-700",   dot: "bg-amber-400"   },
  error:         { badge: "bg-rose-50 border-rose-100",       text: "text-rose-700",    dot: "bg-rose-400"    },
  online:        { badge: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", dot: "bg-emerald-400" },
  offline:       { badge: "bg-rose-50 border-rose-100",       text: "text-rose-700",    dot: "bg-rose-400"    },
};

/**
 * Configuración visual por defecto para estados no reconocidos.
 *
 * @remarks
 * Se utiliza como fallback cuando el estado recibido no existe en
 * {@link STATUS_CONFIG}.
 */
const FALLBACK = {
  badge: "bg-slate-50 border-slate-100",
  text: "text-slate-500",
  dot: "bg-slate-300",
};

/**
 * Props del componente {@link ITStatusCard}.
 *
 * @property store Información de la tienda o servicio a renderizar.
 */
type ITStatusCardProps = {
  store: Store;
};

/**
 * Tarjeta de estado para una tienda o servicio.
 *
 * @param props Propiedades del componente.
 * @returns Elemento visual compacto con estado y métricas del servicio.
 *
 * @remarks
 * Este componente:
 * - Normaliza el estado recibido usando `toLowerCase`
 * - Aplica estilos dinámicos basados en un mapa de configuración
 * - Utiliza un fallback visual si el estado no es reconocido
 * - Integra un indicador gráfico de salud mediante {@link ITGaugeCard}
 *
 * Es ideal para dashboards con múltiples servicios donde se requiere
 * identificar rápidamente el estado operativo de cada uno.
 *
 * @example
 * ```tsx
 * <ITStatusCard store={store} />
 * ```
 */
export default function ITStatusCard({ store }: ITStatusCardProps) {
  const cfg = STATUS_CONFIG[store.status?.toLowerCase()] ?? FALLBACK;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-violet-200 hover:shadow-sm transition-all duration-200">

      {/* Left: name + meta */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} />
          <h3 className="text-[13px] font-semibold text-slate-800 truncate">
            {store.name}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-semibold capitalize ${cfg.badge} ${cfg.text}`}>
            {store.status}
          </span>

          <span className="text-[10px] text-slate-400">
            {store.uptime} · {store.latency}
          </span>
        </div>
      </div>

      {/* Right: mini gauge */}
      <ITGaugeCard title="" value={store.health} size="small" />

    </div>
  );
}