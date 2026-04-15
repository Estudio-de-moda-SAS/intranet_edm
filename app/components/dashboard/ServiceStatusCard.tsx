/**
 * @module ServerStatusCard
 * Componente cliente para visualizar el estado de servicios dentro de un
 * dashboard o panel de monitoreo.
 *
 * @remarks
 * Este archivo implementa una tarjeta reutilizable que muestra una lista
 * de servicios con su estado operativo actual, descripción opcional y un
 * resumen superior de servicios activos.
 *
 * Su responsabilidad incluye:
 *
 * - Mostrar un encabezado con título e indicador resumido.
 * - Renderizar una lista de servicios con nombre y descripción opcional.
 * - Representar visualmente el estado de cada servicio mediante un punto
 *   animado y una etiqueta.
 * - Calcular cuántos servicios se encuentran operativos.
 * - Aplicar una configuración visual por estado mediante `STATUS_CONFIG`.
 *
 * Este componente está orientado a módulos de observabilidad, monitoreo
 * técnico y supervisión de disponibilidad de servicios.
 */

"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";

/**
 * Estados posibles de un servicio dentro del panel.
 *
 * @remarks
 * Valores soportados:
 * - `"online"`: servicio disponible.
 * - `"operational"`: servicio funcionando con normalidad.
 * - `"degraded"`: servicio con degradación parcial.
 * - `"offline"`: servicio fuera de línea.
 * - `"down"`: servicio caído.
 */
type ServiceStatus = "online" | "operational" | "degraded" | "offline" | "down";

/**
 * Representa un servicio individual dentro de la tarjeta.
 */
type Service = {
  /**
   * Nombre identificador del servicio.
   */
  name: string;

  /**
   * Descripción opcional del servicio.
   *
   * @remarks
   * Puede utilizarse para ampliar el contexto funcional o técnico
   * del servicio mostrado.
   */
  description?: string;

  /**
   * Estado operativo actual del servicio.
   */
  status: ServiceStatus;
};

/**
 * Props del componente {@link ServiceStatusCard}.
 */
type Props = {
  /**
   * Título principal de la tarjeta.
   */
  title: string;

  /**
   * Colección de servicios a renderizar.
   */
  services: Service[];
};

/**
 * Configuración visual asociada a cada estado de servicio.
 *
 * @remarks
 * Cada entrada define:
 * - Clase del punto visual.
 * - Si el punto debe animarse con efecto pulse.
 * - Estilo del badge.
 * - Color de texto.
 * - Etiqueta legible para el usuario.
 */
const STATUS_CONFIG: Record<
  ServiceStatus,
  { dot: string; pulse: boolean; badge: string; text: string; label: string }
> = {
  online: {
    dot: "bg-emerald-400",
    pulse: true,
    badge: "bg-emerald-50 border-emerald-100",
    text: "text-emerald-700",
    label: "Online",
  },
  operational: {
    dot: "bg-emerald-400",
    pulse: true,
    badge: "bg-emerald-50 border-emerald-100",
    text: "text-emerald-700",
    label: "Operativo",
  },
  degraded: {
    dot: "bg-amber-400",
    pulse: true,
    badge: "bg-amber-50 border-amber-100",
    text: "text-amber-700",
    label: "Degradado",
  },
  offline: {
    dot: "bg-rose-500",
    pulse: false,
    badge: "bg-rose-50 border-rose-100",
    text: "text-rose-700",
    label: "Caído",
  },
  down: {
    dot: "bg-rose-500",
    pulse: false,
    badge: "bg-rose-50 border-rose-100",
    text: "text-rose-700",
    label: "Caído",
  },
};

/**
 * Configuración visual de respaldo para estados no reconocidos.
 *
 * @remarks
 * Aunque el tipo `ServiceStatus` restringe los valores válidos,
 * este objeto actúa como protección adicional ante datos externos,
 * inconsistentes o futuros cambios en la fuente de datos.
 */
const FALLBACK = {
  dot: "bg-slate-300",
  pulse: false,
  badge: "bg-slate-50 border-slate-100",
  text: "text-slate-500",
  label: "Desconocido",
};

/**
 * Componente cliente que renderiza una tarjeta de estado de servicios.
 *
 * @param props Propiedades del componente.
 * @param props.title Título principal del panel.
 * @param props.services Lista de servicios a representar.
 * @returns Tarjeta con resumen y listado de estados de servicios.
 *
 * @remarks
 * Flujo de ejecución:
 *
 * 1. Recibe el título y la colección de servicios.
 * 2. Calcula cuántos servicios están activos u operativos.
 * 3. Renderiza una tarjeta animada con `framer-motion`.
 * 4. Muestra un encabezado con:
 *    - Icono representativo.
 *    - Título del bloque.
 *    - Resumen de servicios activos frente al total.
 * 5. Recorre la lista de servicios y, para cada uno:
 *    - Obtiene la configuración visual según su estado.
 *    - Renderiza un punto visual, con animación si aplica.
 *    - Muestra nombre y descripción opcional.
 *    - Presenta un badge con la etiqueta del estado.
 *
 * Este componente ofrece una vista compacta y clara del estado general
 * de disponibilidad de varios servicios.
 */
export default function ServiceStatusCard({ title, services }: Props) {
  /**
   * Cantidad de servicios considerados activos u operativos.
   *
   * @remarks
   * Se contabilizan los estados `"online"` y `"operational"` como activos.
   */
  const operational = services.filter((s) =>
    ["online", "operational"].includes(s.status)
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
            <Activity className="h-3.5 w-3.5 text-emerald-600" />
          </span>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        </div>
        <span className="text-[11px] font-semibold text-emerald-600">
          {operational}/{services.length} activos
        </span>
      </div>

      {/* Services */}
      <ul className="divide-y divide-slate-50">
        {services.map((svc, i) => {
          /**
           * Configuración visual correspondiente al estado del servicio actual.
           *
           * @remarks
           * Si por alguna razón el estado no existe en `STATUS_CONFIG`,
           * se utiliza la configuración de respaldo {@link FALLBACK}.
           */
          const cfg = STATUS_CONFIG[svc.status] ?? FALLBACK;

          return (
            <li
              key={i}
              className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50/50"
            >
              {/* Animated dot */}
              <div className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                {cfg.pulse && (
                  <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${cfg.dot} opacity-25`} />
                )}
                <span className={`relative h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-slate-700">{svc.name}</p>
                {svc.description && (
                  <p className="truncate text-[11px] text-slate-400">{svc.description}</p>
                )}
              </div>

              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cfg.badge} ${cfg.text}`}>
                {cfg.label}
              </span>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}