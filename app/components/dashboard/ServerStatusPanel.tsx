/**
 * @module ServerStatusPanel
 * Componente cliente para visualizar el estado operativo de servidores
 * dentro de un panel o dashboard.
 *
 * @remarks
 * Este archivo implementa una tarjeta reutilizable que presenta una lista
 * de servidores con su nivel de uso y estado actual.
 *
 * Su responsabilidad incluye:
 *
 * - Mostrar un encabezado con título e icono.
 * - Renderizar una fila por cada servidor recibido.
 * - Mostrar una barra de progreso animada según el porcentaje de uso.
 * - Representar visualmente el estado de cada servidor mediante badges
 *   y colores asociados.
 *
 * Este componente está orientado a paneles de monitoreo técnico,
 * infraestructura o supervisión operativa.
 */

"use client";

import { motion } from "framer-motion";
import { Server } from "lucide-react";

/**
 * Estados posibles de un servidor dentro del panel.
 *
 * @remarks
 * Valores soportados:
 * - `"ok"`: funcionamiento normal.
 * - `"warning"`: condición de advertencia.
 * - `"error"`: estado crítico o de fallo.
 */
type ServerStatus = "ok" | "warning" | "error";

/**
 * Representa un elemento individual de servidor.
 */
type ServerItem = {
  /**
   * Nombre identificador del servidor.
   */
  name: string;

  /**
   * Porcentaje de uso actual del servidor.
   *
   * @remarks
   * Se utiliza para renderizar la barra de progreso horizontal.
   */
  usage: number;

  /**
   * Estado general del servidor.
   */
  status: ServerStatus;
};

/**
 * Props del componente {@link ServerStatusPanel}.
 */
type Props = {
  /**
   * Título principal de la tarjeta.
   */
  title: string;

  /**
   * Colección de servidores a mostrar en el panel.
   */
  servers: ServerItem[];
};

/**
 * Mapa de colores para la barra de progreso según el estado del servidor.
 *
 * @remarks
 * Cada estado define un gradiente visual utilizado en la barra de uso.
 */
const BAR_COLOR: Record<ServerStatus, string> = {
  ok:      "from-violet-500 to-violet-400",
  warning: "from-amber-500 to-amber-400",
  error:   "from-rose-500 to-rose-400",
};

/**
 * Configuración visual del badge de estado por tipo de servidor.
 *
 * @remarks
 * Cada estado define:
 * - Color de fondo y borde.
 * - Color de texto.
 * - Etiqueta visible para el usuario.
 */
const BADGE: Record<ServerStatus, { bg: string; text: string; label: string }> = {
  ok:      { bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", label: "Normal"   },
  warning: { bg: "bg-amber-50 border-amber-100",     text: "text-amber-700",   label: "Atención" },
  error:   { bg: "bg-rose-50 border-rose-100",       text: "text-rose-700",    label: "Crítico"  },
};

/**
 * Componente cliente que renderiza un panel de estado de servidores.
 *
 * @param props Propiedades del componente.
 * @param props.title Título principal del panel.
 * @param props.servers Lista de servidores a representar.
 * @returns Tarjeta con el estado y uso de los servidores.
 *
 * @remarks
 * Flujo de ejecución:
 *
 * 1. Renderiza una tarjeta animada con `framer-motion`.
 * 2. Muestra un encabezado con icono y título.
 * 3. Recorre la colección `servers` para construir una fila por elemento.
 * 4. Para cada servidor:
 *    - Obtiene la configuración visual del badge según su estado.
 *    - Muestra el nombre del servidor.
 *    - Muestra una etiqueta de estado y el porcentaje de uso.
 *    - Renderiza una barra de progreso animada con color dependiente del estado.
 *
 * Este componente concentra información resumida de capacidad y salud
 * operativa por servidor en una sola vista compacta.
 */
export default function ServerStatusPanel({ title, servers }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
          <Server className="h-3.5 w-3.5 text-indigo-600" />
        </span>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>

      {/* Server rows */}
      <ul className="divide-y divide-slate-50">
        {servers.map((server, i) => {
          /**
           * Configuración visual del badge según el estado del servidor actual.
           */
          const badge = BADGE[server.status];

          return (
            <li key={i} className="group px-5 py-4 transition-colors hover:bg-slate-50/50">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[13px] font-medium text-slate-700 transition-colors group-hover:text-violet-700">
                  {server.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                  <span className="text-[12px] font-bold tabular-nums text-slate-600">
                    {server.usage}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${BAR_COLOR[server.status]} transition-all duration-300 group-hover:brightness-110`}
                  initial={{ width: 0 }}
                  animate={{ width: `${server.usage}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}