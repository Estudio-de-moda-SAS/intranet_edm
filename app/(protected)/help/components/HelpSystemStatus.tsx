/**
 * @module HelpSystemStatus
 * Tarjeta de estado general de sistemas dentro del módulo de ayuda.
 *
 * @remarks
 * Este componente muestra un resumen del estado operativo de los sistemas
 * más relevantes de la organización, tales como correo corporativo,
 * Microsoft 365, VPN, SharePoint, ERP e intranet.
 *
 * Es un **Server Component**, por lo que:
 *
 * - no maneja estado local
 * - no utiliza hooks de cliente
 * - renderiza una vista estática o preconstruida
 *
 * Su responsabilidad principal es ofrecer una referencia rápida del
 * estado de disponibilidad de los servicios internos.
 */

// app/(protected)/(intranet)/help/components/HelpSystemStatus.tsx

/* -------------------------------------------------------------------------- */
/* Tipos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Estados posibles para un sistema monitoreado.
 *
 * @remarks
 * Se utilizan para representar disponibilidad, degradación de servicio
 * o mantenimiento.
 */
type Status = "ok" | "warn" | "down";

/**
 * Estructura de un sistema mostrado en la tarjeta.
 *
 * @property name Nombre visible del sistema.
 * @property status Estado actual del sistema.
 */
type SystemItem = {
  name: string;
  status: Status;
};

/**
 * Configuración visual de un estado de sistema.
 *
 * @property dot Clase CSS del punto indicador.
 * @property label Texto mostrado en la insignia.
 * @property badge Clases CSS del badge visual.
 */
type StatusConfig = {
  dot: string;
  label: string;
  badge: string;
};

/* -------------------------------------------------------------------------- */
/* Datos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Lista de sistemas monitoreados en la tarjeta.
 *
 * @remarks
 * Este arreglo representa la fuente de datos actual del componente.
 * En una futura integración, podría reemplazarse por datos obtenidos
 * desde una API de observabilidad o estado de servicios.
 */
const systems: readonly SystemItem[] = [
  { name: "Correo corporativo", status: "ok" },
  { name: "Microsoft 365", status: "ok" },
  { name: "VPN Corporativa", status: "warn" },
  { name: "SharePoint / OneDrive", status: "ok" },
  { name: "Servidor ERP (SAP)", status: "down" },
  { name: "Intranet", status: "ok" },
] as const;

/* -------------------------------------------------------------------------- */
/* Configuración visual                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Configuración visual por estado de sistema.
 *
 * @remarks
 * Define el color del indicador, la etiqueta visible y el estilo del badge
 * según la condición del servicio.
 */
const STATUS_CONFIG: Record<Status, StatusConfig> = {
  ok: {
    dot: "bg-emerald-400",
    label: "Operativo",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  warn: {
    dot: "bg-amber-400",
    label: "Lento",
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  down: {
    dot: "bg-rose-500",
    label: "Mantenimiento",
    badge: "bg-rose-50 text-rose-700 border border-rose-200",
  },
};

/* -------------------------------------------------------------------------- */
/* Estado agregado                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Indica si todos los sistemas se encuentran completamente operativos.
 *
 * @remarks
 * Este valor se utiliza para determinar el estado general mostrado
 * en el encabezado de la tarjeta.
 */
const allOk = systems.every((system) => system.status === "ok");

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Tarjeta de estado de sistemas.
 *
 * @returns Resumen visual del estado operativo de plataformas internas.
 *
 * @remarks
 * Este componente renderiza:
 *
 * - un encabezado con estado agregado general
 * - una lista de sistemas monitoreados
 * - una insignia individual por sistema según su condición
 *
 * Si todos los sistemas están en estado `ok`, el resumen general indica
 * “Todo operativo”. En caso contrario, muestra “Incidencias activas”.
 *
 * @example
 * ```tsx
 * <HelpSystemStatus />
 * ```
 */
export default function HelpSystemStatus() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            Estado de sistemas
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Actualizado hace 5 min
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full ${
            allOk
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              allOk ? "bg-emerald-500" : "bg-amber-400"
            }`}
          />
          {allOk ? "Todo operativo" : "Incidencias activas"}
        </span>
      </div>

      <ul className="divide-y divide-slate-100">
        {systems.map(({ name, status }) => {
          const config = STATUS_CONFIG[status];

          return (
            <li
              key={name}
              className="flex items-center justify-between px-5 py-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dot}`}
                />
                <span className="text-[12px] text-slate-700">{name}</span>
              </div>

              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.badge}`}
              >
                {config.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}