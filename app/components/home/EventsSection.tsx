/**
 * @module EventsSection
 * Componentes para mostrar el listado de próximos eventos y su vista de detalle.
 *
 * @remarks
 * Este archivo incluye:
 * - utilidades para formateo y estilos por categoría,
 * - un badge seguro de fecha,
 * - un modal de detalle del evento,
 * - y la sección principal de eventos próximos.
 *
 * Su objetivo es ofrecer una experiencia compacta en listado y más completa
 * en un modal con información ampliada y confirmación de asistencia.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import {
  CalendarDays, MapPin, Clock, ArrowRight,
  User, Paperclip, ExternalLink, X,
  CheckCircle2, XCircle, HelpCircle,
} from "lucide-react";
import type { Event, EventAttendance } from "@/types/home";

/* ─── Helpers ─────────────────────────────────────────────── */

/**
 * Configuración visual por categoría de evento.
 *
 * @remarks
 * Cada categoría define:
 * - gradiente principal,
 * - fondo de pill,
 * - color del texto de pill.
 */
const CATEGORY_MAP: Record<
  string,
  { gradient: string; pill: string; pillText: string }
> = {
  formacion:    { gradient: "from-violet-600 to-violet-400",  pill: "bg-violet-100 dark:bg-violet-500/[0.12]",   pillText: "text-violet-700 dark:text-violet-400"  },
  reunion:      { gradient: "from-purple-600 to-purple-400",  pill: "bg-purple-100 dark:bg-purple-500/[0.12]",   pillText: "text-purple-700 dark:text-purple-400"  },
  social:       { gradient: "from-emerald-500 to-teal-400",   pill: "bg-emerald-100 dark:bg-emerald-500/[0.12]", pillText: "text-emerald-700 dark:text-emerald-400" },
  capacitacion: { gradient: "from-indigo-600 to-blue-400",    pill: "bg-indigo-100 dark:bg-indigo-500/[0.12]",   pillText: "text-indigo-700 dark:text-indigo-400"  },
  otro:         { gradient: "from-slate-500 to-slate-400",    pill: "bg-slate-100 dark:bg-slate-500/[0.12]",     pillText: "text-slate-600 dark:text-slate-400"    },
};

/**
 * Estilo fallback para categorías no reconocidas.
 */
const OTRO = {
  gradient: "from-slate-500 to-slate-400",
  pill: "bg-slate-100 dark:bg-slate-500/[0.12]",
  pillText: "text-slate-600 dark:text-slate-400",
};

/**
 * Resuelve el estilo visual asociado a una categoría.
 *
 * @param category Categoría del evento.
 * @returns Configuración visual de la categoría o fallback.
 */
function categoryStyle(category?: string) {
  return CATEGORY_MAP[(category ?? "").toLowerCase()] ?? OTRO;
}

/**
 * Formatea una fecha a un texto largo localizado.
 *
 * @param dateStr Fecha del evento en formato string.
 * @returns Fecha formateada en español o `null` si no es válida.
 */
function formatFullDate(dateStr?: string) {
  if (!dateStr) return null;

  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;

  return d.toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* ─── DateBadge ───────────────────────────────────────────── */

/**
 * Props del componente {@link SafeDateBadge}.
 */
interface SafeDateBadgeProps {
  /**
   * Fecha del evento.
   */
  dateStr: string;
}

/**
 * Renderiza un badge compacto con mes y día.
 *
 * @param props Propiedades del componente.
 * @param props.dateStr Fecha del evento.
 * @returns Badge de fecha o un contenedor vacío si la fecha no es válida.
 *
 * @remarks
 * Este componente protege la UI cuando llega una fecha inválida.
 */
function SafeDateBadge({ dateStr }: SafeDateBadgeProps) {
  const d = new Date(dateStr);

  if (isNaN(d.getTime())) return <div className="w-10 shrink-0" />;

  return (
    <div className="flex w-10 shrink-0 flex-col items-center rounded-lg py-1.5 text-center
                    border border-violet-100 bg-violet-50
                    dark:border-violet-500/20 dark:bg-violet-500/[0.08]">
      <span className="text-[10px] uppercase tracking-widest text-violet-400 dark:text-violet-500">
        {d.toLocaleDateString("es-CO", { month: "short" })}
      </span>
      <span className="text-lg font-bold leading-none text-violet-900 dark:text-violet-300">
        {d.getDate()}
      </span>
    </div>
  );
}

/* ─── EventDetailModal ────────────────────────────────────── */

/**
 * Props del componente {@link EventDetailModal}.
 */
interface EventDetailModalProps {
  /**
   * Evento seleccionado.
   */
  event: Event;

  /**
   * Callback de cierre del modal.
   */
  onClose: () => void;
}

/**
 * Renderiza el modal de detalle de un evento.
 *
 * @param props Propiedades del componente.
 * @param props.event Evento activo.
 * @param props.onClose Función para cerrar el modal.
 * @returns Modal renderizado mediante portal.
 *
 * @remarks
 * Incluye:
 * - banner decorativo,
 * - datos principales del evento,
 * - organizador,
 * - descripción,
 * - adjuntos,
 * - selector local de asistencia.
 *
 * La asistencia se maneja localmente en el componente y no persiste por sí sola.
 */
function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  /**
   * Estilos visuales derivados de la categoría del evento.
   */
  const style = categoryStyle(event.category);

  /**
   * Fecha completa del evento en formato legible.
   */
  const fullDate = formatFullDate(event.date);

  /**
   * Estado local de asistencia del usuario frente al evento.
   */
  const [attendance, setAttendance] = useState<EventAttendance>(
    event.attendance ?? null
  );

  /**
   * Opciones disponibles para confirmar asistencia.
   */
  const ATTENDANCE_OPTIONS: {
    value: Exclude<EventAttendance, null>;
    label: string;
    icon: React.ReactNode;
    active: string;
    inactive: string;
  }[] = [
    {
      value: "confirmed",
      label: "Asistiré",
      icon: <CheckCircle2 className="h-4 w-4" />,
      active: "bg-emerald-500 text-white border-emerald-500 shadow-sm",
      inactive: "border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 dark:border-[#30363d] dark:text-[#545d68] dark:hover:border-emerald-500/40 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/[0.08]",
    },
    {
      value: "tentative",
      label: "Tal vez",
      icon: <HelpCircle className="h-4 w-4" />,
      active: "bg-amber-400 text-white border-amber-400 shadow-sm",
      inactive: "border-slate-200 text-slate-500 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50 dark:border-[#30363d] dark:text-[#545d68] dark:hover:border-amber-500/40 dark:hover:text-amber-400 dark:hover:bg-amber-500/[0.08]",
    },
    {
      value: "declined",
      label: "No asistiré",
      icon: <XCircle className="h-4 w-4" />,
      active: "bg-rose-500 text-white border-rose-500 shadow-sm",
      inactive: "border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 dark:border-[#30363d] dark:text-[#545d68] dark:hover:border-rose-500/40 dark:hover:text-rose-400 dark:hover:bg-rose-500/[0.08]",
    },
  ];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl
                      bg-white dark:bg-[#161b22]">

        {/* Banner */}
        <div className={`relative h-48 w-full bg-gradient-to-br ${style.gradient} overflow-hidden`}>
          {event.bannerUrl && (
            <img
              src={event.bannerUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-40"
            />
          )}

          <svg className="absolute inset-0 h-full w-full opacity-[0.12]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>

          {event.category && (
            <span className="absolute left-4 top-4 rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold capitalize text-white backdrop-blur-sm ring-1 ring-white/20">
              {event.category}
            </span>
          )}

          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition-colors hover:bg-black/40"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-5 pb-4 pt-10">
            <h2 id="event-modal-title" className="text-lg font-bold leading-snug text-white">
              {event.title}
            </h2>
            {fullDate && (
              <p className="mt-0.5 text-[12px] capitalize text-white/75">
                {fullDate}
              </p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          {/* Hora y lugar */}
          <div className="grid grid-cols-2 gap-3">
            {event.time && (
              <div className="flex items-center gap-2.5 rounded-xl px-3 py-3
                              bg-slate-50 dark:bg-[#1c2128]">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${style.gradient}`}>
                  <Clock className="h-4 w-4 text-white" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-[#545d68]">
                    Hora
                  </p>
                  <p className="truncate text-sm font-semibold text-slate-700 dark:text-[#cdd9e5]">
                    {event.time}
                  </p>
                </div>
              </div>
            )}

            {event.location && (
              <div className="flex items-center gap-2.5 rounded-xl px-3 py-3
                              bg-slate-50 dark:bg-[#1c2128]">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${style.gradient}`}>
                  <MapPin className="h-4 w-4 text-white" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-[#545d68]">
                    Lugar
                  </p>
                  <p className="truncate text-sm font-semibold text-slate-700 dark:text-[#cdd9e5]">
                    {event.location}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Organizador */}
          {event.organizer && (
            <div className="flex items-center gap-3 rounded-xl px-4 py-3
                            border border-slate-100 bg-slate-50/60
                            dark:border-[#30363d] dark:bg-[#1c2128]">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${style.gradient}`}>
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-[#545d68]">
                  Organiza
                </p>
                <p className="text-sm font-semibold text-slate-700 dark:text-[#cdd9e5]">
                  {event.organizer}
                </p>
              </div>
            </div>
          )}

          {/* Descripción */}
          {event.description && (
            <p className="text-sm leading-relaxed text-slate-600 dark:text-[#768390]">
              {event.description}
            </p>
          )}

          {/* Adjuntos */}
          {event.attachments && event.attachments.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-[#545d68]">
                Recursos adjuntos
              </p>
              <div className="space-y-1.5">
                {event.attachments.map((att, i) => (
                  <a
                    key={i}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all
                               border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800
                               dark:border-[#30363d] dark:text-[#768390] dark:hover:border-[#444c56] dark:hover:bg-[#1c2128] dark:hover:text-[#adbac7]"
                  >
                    <span className="flex items-center gap-2">
                      <Paperclip className="h-3.5 w-3.5 shrink-0 text-slate-400 transition-colors group-hover:text-slate-600
                                           dark:text-[#545d68] dark:group-hover:text-[#768390]" />
                      {att.label}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-colors group-hover:text-slate-500
                                            dark:text-[#444c56] dark:group-hover:text-[#545d68]" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Confirmación de asistencia */}
          <div className="space-y-2 rounded-xl p-4
                          border border-slate-100 bg-slate-50/60
                          dark:border-[#30363d] dark:bg-[#1c2128]">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-[#545d68]">
              ¿Vas a asistir?
            </p>
            <div className="grid grid-cols-3 gap-2">
              {ATTENDANCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setAttendance(prev => prev === opt.value ? null : opt.value)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                    attendance === opt.value ? opt.active : opt.inactive
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>

            {attendance && (
              <p className="text-center text-[11px] text-slate-400 dark:text-[#545d68]">
                {attendance === "confirmed" && "✓ Tu asistencia está confirmada"}
                {attendance === "tentative" && "~ Marcado como tentativo"}
                {attendance === "declined" && "✕ Marcado como no asistirás"}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4
                        border-t border-slate-100 dark:border-[#21262d]">
          {event.href ? (
            <Link
              href={event.href}
              className={`rounded-lg bg-gradient-to-r ${style.gradient} px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90`}
            >
              Ver detalle completo
            </Link>
          ) : (
            <span />
          )}

          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors
                       bg-slate-100 text-slate-600 hover:bg-slate-200
                       dark:bg-[#21262d] dark:text-[#768390] dark:hover:bg-[#30363d]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─── EventsSection ───────────────────────────────────────── */

/**
 * Props del componente {@link EventsSection}.
 */
interface EventsSectionProps {
  /**
   * Lista de eventos a mostrar.
   */
  events: Event[];
}

/**
 * Renderiza la sección de próximos eventos.
 *
 * @param props Propiedades del componente.
 * @param props.events Lista de eventos.
 * @returns Tarjeta con listado de eventos y modal de detalle opcional.
 *
 * @remarks
 * Flujo general:
 * 1. Muestra un estado vacío si no existen eventos.
 * 2. Si hay eventos, renderiza una lista resumida.
 * 3. Al seleccionar uno, abre {@link EventDetailModal}.
 * 4. Cada fila muestra fecha, título, metadata y estado de asistencia.
 */
export function EventsSection({ events }: EventsSectionProps) {
  /**
   * Evento actualmente seleccionado para mostrar en el modal.
   */
  const [selected, setSelected] = useState<Event | null>(null);

  /**
   * Indica si la colección está vacía.
   */
  const isEmpty = !events?.length;

  return (
    <>
      <div className="rounded-xl border shadow-sm overflow-hidden
                      border-slate-200 bg-white
                      dark:border-[#30363d] dark:bg-[#161b22]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4
                        border-b border-slate-100 dark:border-[#21262d]">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg
                             bg-violet-50 dark:bg-violet-500/[0.12]">
              <CalendarDays className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
            </span>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-[#e6edf3]">
              Próximos Eventos
            </h2>
          </div>

          <Link
            href="/eventos"
            className="flex items-center gap-1 text-[11px] font-medium transition-colors
                       text-slate-400 hover:text-violet-600
                       dark:text-[#545d68] dark:hover:text-violet-400"
          >
            Ver todos <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Empty state */}
        {isEmpty ? (
          <div className="flex flex-col items-center gap-1.5 py-10 text-center">
            <CalendarDays className="h-7 w-7 text-slate-200 dark:text-[#30363d]" />
            <p className="text-xs text-slate-400 dark:text-[#545d68]">
              No hay eventos próximos
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50 dark:divide-[#21262d]">
            {events.map((ev) => {
              const style = categoryStyle(ev.category);

              return (
                <li
                  key={ev.id}
                  onClick={() => setSelected(ev)}
                  className="group flex cursor-pointer items-start gap-4 px-5 py-4 transition-colors
                             hover:bg-violet-50/30 dark:hover:bg-violet-500/[0.05]"
                >
                  <SafeDateBadge dateStr={ev.date} />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-snug transition-colors
                                    text-slate-800 group-hover:text-violet-700
                                    dark:text-[#cdd9e5] dark:group-hover:text-violet-400">
                        {ev.title}
                      </p>

                      {ev.category && (
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${style.pill} ${style.pillText}`}>
                          {ev.category}
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {ev.time && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-[#545d68]">
                          <Clock className="h-3 w-3" /> {ev.time}
                        </span>
                      )}

                      {ev.location && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-[#545d68]">
                          <MapPin className="h-3 w-3" /> {ev.location}
                        </span>
                      )}

                      {ev.organizer && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-[#545d68]">
                          <User className="h-3 w-3" /> {ev.organizer}
                        </span>
                      )}

                      {ev.attendance === "confirmed" && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> Confirmado
                        </span>
                      )}

                      {ev.attendance === "tentative" && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-amber-500 dark:text-amber-400">
                          <HelpCircle className="h-3 w-3" /> Tentativo
                        </span>
                      )}

                      {ev.attendance === "declined" && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-rose-400 dark:text-rose-400">
                          <XCircle className="h-3 w-3" /> No asistirás
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {selected && (
        <EventDetailModal event={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}