/**
 * @module HelpAlertsPanel
 * Panel de alertas y mantenimientos del Help Center.
 *
 * @remarks
 * Este componente muestra notificaciones relevantes del sistema,
 * como mantenimientos programados, actualizaciones o eventos
 * que pueden impactar la operación del usuario.
 *
 * Es un **Server Component**, ya que:
 *
 * - no maneja estado local
 * - no tiene interactividad compleja
 * - consume datos estáticos (mock)
 *
 * En una implementación futura, estas alertas deberían provenir
 * de un servicio centralizado (API o sistema de monitoreo).
 */

import {
  TriangleAlert,
  Megaphone,
  ShieldCheck,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Tipos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Representa una alerta del sistema.
 *
 * @remarks
 * Cada alerta contiene:
 *
 * - icono representativo
 * - estilos visuales asociados
 * - título descriptivo
 * - información temporal o contexto
 */
type HelpAlert = {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  time: string;
};

/* -------------------------------------------------------------------------- */
/* Datos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Lista de alertas activas o programadas.
 *
 * @remarks
 * Actualmente es una fuente estática (mock).
 *
 * Ejemplos de alertas:
 *
 * - mantenimientos programados
 * - actualizaciones de software
 * - eventos de seguridad
 *
 * En producción, esto debería provenir de:
 *
 * - un sistema de monitoreo (ej: Datadog, Grafana)
 * - un endpoint interno (ej: `/api/system-alerts`)
 */
const alerts: readonly HelpAlert[] = [
  {
    icon: TriangleAlert,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    title: "Mantenimiento SAP programado",
    time: "Hoy 22:00 – 24:00 · Sin acceso",
  },
  {
    icon: Megaphone,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "Actualización Windows Defender",
    time: "Mar 18 · Reinicio requerido",
  },
  {
    icon: ShieldCheck,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    title: "Renovación certificados SSL",
    time: "Mar 22 · Sin impacto visible",
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Panel de alertas del sistema.
 *
 * @returns Lista visual de alertas activas.
 *
 * @remarks
 * Este componente:
 *
 * - presenta alertas en formato de lista
 * - utiliza iconografía para mejorar la comprensión visual
 * - mantiene consistencia con el diseño del sistema (cards)
 *
 * No incluye:
 *
 * - lógica de filtrado
 * - estado dinámico
 * - interacción del usuario
 *
 * Esto lo hace ideal como componente de solo lectura.
 *
 * @example
 * ```tsx
 * <HelpAlertsPanel />
 * ```
 */
export default function HelpAlertsPanel() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">
          Alertas y mantenimientos
        </h3>
      </div>

      {/* Listado */}
      <ul className="divide-y divide-slate-100">
        {alerts.map(({ icon: Icon, iconBg, iconColor, title, time }) => (
          <li
            key={title}
            className="flex items-start gap-3 px-5 py-3.5"
          >
            <span
              className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}
            >
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </span>

            <div>
              <p className="text-[12px] font-semibold text-slate-800">
                {title}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {time}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}