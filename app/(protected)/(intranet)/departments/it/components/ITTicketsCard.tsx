/**
 * @module ITTicketsCard
 * Tarjeta resumen para la gestión de tickets del área de TI.
 *
 * @remarks
 * Este componente presenta una vista compacta del estado actual de la mesa
 * de ayuda, mostrando indicadores clave y un listado reciente de tickets.
 *
 * Incluye:
 * - Resumen de tickets del día
 * - Cantidad de tickets escalados
 * - Tickets atendidos o gestionados por chatbot
 * - Alerta visual de escalaciones pendientes
 * - Listado de tickets recientes con prioridad, responsable y estado
 *
 * El componente recibe la estructura completa de datos del módulo de TI y
 * extrae internamente la información necesaria para renderizar la tarjeta.
 */

// app/it/components/ITTicketsCard.tsx
// ✅ SERVER COMPONENT
// Recibe data (ITData completo) — extrae tickets y ticketsList internamente
// Solución al TypeError: data.recent is undefined

import { AlertCircle, Clock, CheckCircle2, ArrowRight, Bot } from "lucide-react";
import type { ITData } from "@/lib/graph/departments/it.service";

// ── Estilos por prioridad (valores del mock: "high" | "medium" | "low") ──────

/**
 * Mapa de estilos visuales por prioridad de ticket.
 *
 * @remarks
 * Se utiliza para aplicar clases CSS al badge de prioridad mostrado
 * en cada ticket reciente.
 */
const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-red-50 text-red-600 border-red-100",
  medium: "bg-amber-50 text-amber-600 border-amber-100",
  low: "bg-slate-100 text-slate-500 border-slate-200",
};

/**
 * Etiquetas legibles por prioridad.
 *
 * @remarks
 * Convierte los valores internos del sistema en textos más amigables
 * para la interfaz de usuario.
 */
const PRIORITY_LABEL: Record<string, string> = {
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

// ── Icono por status ─────────────────────────────────────────────────────────

/**
 * Props del componente {@link StatusIcon}.
 *
 * @property status Estado actual del ticket.
 */
type StatusIconProps = {
  status: string;
};

/**
 * Ícono visual asociado al estado de un ticket.
 *
 * @param props Propiedades del componente.
 * @returns Ícono correspondiente al estado del ticket.
 *
 * @remarks
 * Este componente centraliza la lógica visual para representar el estado
 * operativo de cada ticket dentro del listado reciente.
 *
 * Reglas aplicadas:
 * - Resuelto: ícono de confirmación
 * - Escalado o Abierto: ícono de alerta
 * - Otros estados: ícono de espera o tiempo
 */
function StatusIcon({ status }: StatusIconProps) {
  if (status === "Resuelto") {
    return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
  }

  if (status === "Escalado" || status === "Abierto") {
    return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
  }

  return <Clock className="w-3.5 h-3.5 text-amber-500" />;
}

// ── Props ────────────────────────────────────────────────────────────────────

/**
 * Props del componente {@link ITTicketsCard}.
 *
 * @property data Estructura completa de datos del módulo de TI.
 */
interface Props {
  data: ITData;
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Tarjeta resumen de tickets del área de TI.
 *
 * @param props Propiedades del componente.
 * @returns Tarjeta con métricas rápidas y listado reciente de tickets.
 *
 * @remarks
 * Este componente:
 * - Extrae internamente `tickets` y `ticketsList` desde la data general
 * - Aplica valores por defecto para evitar errores por datos indefinidos
 * - Calcula el número real de tickets escalados desde la lista
 * - Limita la visualización a los tickets más recientes
 *
 * También actúa de forma defensiva frente a respuestas incompletas del servicio,
 * evitando errores como accesos a propiedades inexistentes o listas no definidas.
 *
 * @example
 * ```tsx
 * <ITTicketsCard data={data} />
 * ```
 */
export default function ITTicketsCard({ data }: Props) {
  // Defensivo: ambos campos vienen del servicio pero pueden llegar undefined
  const tickets = data.tickets ?? { today: 0, escalated: 0, chatbot: 0 };
  const ticketsList = data.ticketsList ?? [];

  const escalated = ticketsList.filter((t) => t.status === "Escalado").length;
  const recent = ticketsList.slice(0, 4);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Gestión de tickets</h3>
          <p className="text-[11px] text-slate-400">Mesa de ayuda · Hoy</p>
        </div>
        <a
          href="/it/tickets"
          className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Ver todos <ArrowRight className="w-3 h-3" />
        </a>
      </div>

      {/* Summary pills — today / escalated / chatbot */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center bg-indigo-50 border border-indigo-100 rounded-xl py-2.5 px-1">
          <p className="text-lg font-extrabold text-indigo-700 leading-none">{tickets.today}</p>
          <p className="text-[10px] text-indigo-500 mt-1 font-medium">Hoy</p>
        </div>

        <div className="text-center bg-red-50 border border-red-100 rounded-xl py-2.5 px-1">
          <p className="text-lg font-extrabold text-red-600 leading-none">{tickets.escalated}</p>
          <p className="text-[10px] text-red-500 mt-1 font-medium">Escalados</p>
        </div>

        <div className="text-center bg-emerald-50 border border-emerald-100 rounded-xl py-2.5 px-1">
          <p className="text-lg font-extrabold text-emerald-600 leading-none">{tickets.chatbot}</p>
          <p className="text-[10px] text-emerald-500 mt-1 font-medium flex items-center justify-center gap-1">
            <Bot className="w-2.5 h-2.5" /> Bot
          </p>
        </div>
      </div>

      {/* Escalation warning */}
      {escalated > 0 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
          <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
          <p className="text-[11px] text-red-700 font-medium">
            {escalated} ticket{escalated !== 1 ? "s" : ""} escalado{escalated !== 1 ? "s" : ""} sin resolver
          </p>
        </div>
      )}

      {/* Recent tickets */}
      <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
        Recientes
      </h4>

      {recent.length === 0 ? (
        <p className="text-[12px] text-slate-400 text-center py-4">Sin tickets recientes</p>
      ) : (
        <ul className="space-y-2">
          {recent.map((t) => (
            <li
              key={t.id}
              className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-100 transition-all duration-150 cursor-pointer group"
            >
              <div className="mt-0.5 flex-shrink-0">
                <StatusIcon status={t.status} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-slate-800 leading-snug line-clamp-1 group-hover:text-indigo-700">
                  {t.title}
                </p>

                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="text-[10px] font-mono text-slate-400">{t.id}</span>
                  <span className="text-slate-300">·</span>

                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${PRIORITY_STYLES[t.priority] ?? ""}`}
                  >
                    {PRIORITY_LABEL[t.priority] ?? t.priority}
                  </span>

                  <span className="text-slate-300">·</span>
                  <span className="text-[10px] text-slate-400">{t.assignee}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}