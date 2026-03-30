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

const CATEGORY_MAP: Record<
  string,
  { gradient: string; pill: string; pillText: string }
> = {
  formacion:    { gradient: "from-violet-600 to-violet-400", pill: "bg-violet-100", pillText: "text-violet-700"  },
  reunion:      { gradient: "from-purple-600 to-purple-400", pill: "bg-purple-100",  pillText: "text-purple-700"  },
  social:       { gradient: "from-emerald-500 to-teal-400",  pill: "bg-emerald-100", pillText: "text-emerald-700" },
  capacitacion: { gradient: "from-indigo-600 to-blue-400",   pill: "bg-indigo-100",  pillText: "text-indigo-700"  },
  otro:         { gradient: "from-slate-500 to-slate-400",   pill: "bg-slate-100",   pillText: "text-slate-600"   },
};

const OTRO = { gradient: "from-slate-500 to-slate-400", pill: "bg-slate-100", pillText: "text-slate-600" };

function categoryStyle(category?: string) {
  return CATEGORY_MAP[(category ?? "").toLowerCase()] ?? OTRO;
}

function formatFullDate(dateStr?: string) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("es-CO", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

/* ─── DateBadge ───────────────────────────────────────────── */

function SafeDateBadge({ dateStr }: { dateStr: string }) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return <div className="w-10 shrink-0" />;
  return (
    <div className="flex w-10 shrink-0 flex-col items-center rounded-lg border border-violet-100 bg-violet-50 py-1.5 text-center">
      <span className="text-[10px] uppercase tracking-widest text-violet-400">
        {d.toLocaleDateString("es-CO", { month: "short" })}
      </span>
      <span className="text-lg font-bold leading-none text-violet-900">
        {d.getDate()}
      </span>
    </div>
  );
}

/* ─── EventDetailModal ────────────────────────────────────── */

function EventDetailModal({ event, onClose }: { event: Event; onClose: () => void }) {
  const style    = categoryStyle(event.category);
  const fullDate = formatFullDate(event.date);

  const [attendance, setAttendance] = useState<EventAttendance>(
    event.attendance ?? null
  );

  const ATTENDANCE_OPTIONS: {
    value: Exclude<EventAttendance, null>;
    label: string;
    icon: React.ReactNode;
    active: string;
    inactive: string;
  }[] = [
    {
      value:    "confirmed",
      label:    "Asistiré",
      icon:     <CheckCircle2 className="h-4 w-4" />,
      active:   "bg-emerald-500 text-white border-emerald-500 shadow-sm",
      inactive: "border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50",
    },
    {
      value:    "tentative",
      label:    "Tal vez",
      icon:     <HelpCircle className="h-4 w-4" />,
      active:   "bg-amber-400 text-white border-amber-400 shadow-sm",
      inactive: "border-slate-200 text-slate-500 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50",
    },
    {
      value:    "declined",
      label:    "No asistiré",
      icon:     <XCircle className="h-4 w-4" />,
      active:   "bg-rose-500 text-white border-rose-500 shadow-sm",
      inactive: "border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50",
    },
  ];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* ── Banner ── */}
        <div className={`relative h-48 w-full bg-gradient-to-br ${style.gradient} overflow-hidden`}>

          {event.bannerUrl && (
            <img
              src={event.bannerUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-40"
            />
          )}

          {/* Patrón decorativo */}
          <svg className="absolute inset-0 h-full w-full opacity-[0.12]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>

          {/* Categoría */}
          {event.category && (
            <span className="absolute left-4 top-4 rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold capitalize text-white backdrop-blur-sm ring-1 ring-white/20">
              {event.category}
            </span>
          )}

          {/* Cerrar */}
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition-colors hover:bg-black/40"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Título */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-5 pb-4 pt-10">
            <h2 id="event-modal-title" className="text-lg font-bold leading-snug text-white">
              {event.title}
            </h2>
            {fullDate && (
              <p className="mt-0.5 text-[12px] capitalize text-white/75">{fullDate}</p>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="space-y-4 px-6 py-5">

          {/* Hora y lugar */}
          <div className="grid grid-cols-2 gap-3">
            {event.time && (
              <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-3">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${style.gradient}`}>
                  <Clock className="h-4 w-4 text-white" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Hora</p>
                  <p className="truncate text-sm font-semibold text-slate-700">{event.time}</p>
                </div>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-3">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${style.gradient}`}>
                  <MapPin className="h-4 w-4 text-white" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Lugar</p>
                  <p className="truncate text-sm font-semibold text-slate-700">{event.location}</p>
                </div>
              </div>
            )}
          </div>

          {/* Organizador */}
          {event.organizer && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${style.gradient}`}>
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Organiza</p>
                <p className="text-sm font-semibold text-slate-700">{event.organizer}</p>
              </div>
            </div>
          )}

          {/* Descripción */}
          {event.description && (
            <p className="text-sm leading-relaxed text-slate-600">{event.description}</p>
          )}

          {/* Adjuntos */}
          {event.attachments && event.attachments.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Recursos adjuntos
              </p>
              <div className="space-y-1.5">
                {event.attachments.map((att, i) => (
                  <a
                    key={i}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
                  >
                    <span className="flex items-center gap-2">
                      <Paperclip className="h-3.5 w-3.5 shrink-0 text-slate-400 transition-colors group-hover:text-slate-600" />
                      {att.label}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-colors group-hover:text-slate-500" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ── Confirmación de asistencia ── */}
          <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
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
              <p className="text-center text-[11px] text-slate-400">
                {attendance === "confirmed" && "✓ Tu asistencia está confirmada"}
                {attendance === "tentative" && "~ Marcado como tentativo"}
                {attendance === "declined"  && "✕ Marcado como no asistirás"}
              </p>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          {event.href ? (
            <Link
              href={event.href}
              className={`rounded-lg bg-gradient-to-r ${style.gradient} px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90`}
            >
              Ver detalle completo
            </Link>
          ) : <span />}
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200"
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

export function EventsSection({ events }: { events: Event[] }) {
  const [selected, setSelected] = useState<Event | null>(null);
  const isEmpty = !events?.length;

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
              <CalendarDays className="h-3.5 w-3.5 text-violet-600" />
            </span>
            <h2 className="text-sm font-semibold text-slate-800">Próximos Eventos</h2>
          </div>
          <Link
            href="/eventos"
            className="flex items-center gap-1 text-[11px] font-medium text-slate-400 transition-colors hover:text-violet-600"
          >
            Ver todos <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Empty state */}
        {isEmpty ? (
          <div className="flex flex-col items-center gap-1.5 py-10 text-center">
            <CalendarDays className="h-7 w-7 text-slate-200" />
            <p className="text-xs text-slate-400">No hay eventos próximos</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {events.map((ev) => {
              const style = categoryStyle(ev.category);
              return (
                <li
                  key={ev.id}
                  onClick={() => setSelected(ev)}
                  className="group flex cursor-pointer items-start gap-4 px-5 py-4 transition-colors hover:bg-violet-50/30"
                >
                  <SafeDateBadge dateStr={ev.date} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-snug text-slate-800 transition-colors group-hover:text-violet-700">
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
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock className="h-3 w-3" /> {ev.time}
                        </span>
                      )}
                      {ev.location && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <MapPin className="h-3 w-3" /> {ev.location}
                        </span>
                      )}
                      {ev.organizer && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <User className="h-3 w-3" /> {ev.organizer}
                        </span>
                      )}
                      {ev.attendance === "confirmed" && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" /> Confirmado
                        </span>
                      )}
                      {ev.attendance === "tentative" && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-amber-500">
                          <HelpCircle className="h-3 w-3" /> Tentativo
                        </span>
                      )}
                      {ev.attendance === "declined" && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-rose-400">
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