"use client";
/**
 * @module CumplimientoCalendario
 * Calendario de obligaciones legales y regulatorias.
 *
 * @remarks
 * Muestra un mini-calendario con marcadores de vencimientos próximos.
 * Datos mock hasta que Graph Calendar esté disponible.
 */

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface CalendarEvent {
  day:    number;
  month:  number;
  year:   number;
  title:  string;
  level:  "critical" | "warning" | "info";
}

const EVENTS_2026: CalendarEvent[] = [
  { day: 27, month: 4,  year: 2026, title: "Reporte UIAF",             level: "critical" },
  { day: 15, month: 5,  year: 2026, title: "Actualiz. formulario SFC",  level: "warning"  },
  { day: 30, month: 6,  year: 2026, title: "Cierre capacitaciones",     level: "warning"  },
  { day: 31, month: 3,  year: 2026, title: "ROS Q1 2026",               level: "info"     },
  { day: 10, month: 4,  year: 2026, title: "Revisión matriz riesgos",   level: "info"     },
  { day: 20, month: 4,  year: 2026, title: "Comité SARLAFT",            level: "info"     },
];

const LEVEL_DOT: Record<string, string> = {
  critical: "bg-red-500",
  warning:  "bg-amber-500",
  info:     "bg-violet-500",
};

const MONTH_NAMES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];
const DAY_NAMES = ["Lu","Ma","Mi","Ju","Vi","Sá","Do"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  // 0=Sunday → shift to Monday-based
  const day = new Date(year, month - 1, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export function CumplimientoCalendario() {
  const today   = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  }

  const daysInMonth  = getDaysInMonth(year, month);
  const firstDaySlot = getFirstDayOfMonth(year, month);

  const eventsThisMonth = EVENTS_2026.filter(
    (e) => e.month === month && e.year === year
  );

  const eventsByDay: Record<number, CalendarEvent[]> = {};
  eventsThisMonth.forEach((e) => {
    if (!eventsByDay[e.day]) eventsByDay[e.day] = [];
    eventsByDay[e.day]!.push(e);
  });

  const selectedEvents = selectedDay ? (eventsByDay[selectedDay] ?? []) : [];

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 border border-violet-200">
          <Calendar size={13} className="text-violet-600" />
        </div>
        <p className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
          Calendario de Obligaciones
        </p>
        <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700 border border-violet-200">
          {eventsThisMonth.length} este mes
        </span>
      </div>

      <div className="px-4 py-3">
        {/* Nav de mes */}
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">
            {MONTH_NAMES[month - 1]} {year}
          </p>
          <button
            onClick={nextMonth}
            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Grid de días */}
        <div className="grid grid-cols-7 gap-0.5">
          {/* Cabeceras */}
          {DAY_NAMES.map((d) => (
            <div key={d} className="py-1 text-center text-[10px] font-semibold text-slate-400">
              {d}
            </div>
          ))}
          {/* Slots vacíos */}
          {Array.from({ length: firstDaySlot }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {/* Días */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const hasEvents  = !!eventsByDay[day];
            const isToday    = day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();
            const isSelected = day === selectedDay;
            const events     = eventsByDay[day] ?? [];
            const topLevel   = events[0]?.level;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`
                  relative flex flex-col items-center justify-center rounded-lg py-1 text-[11px] font-medium transition-all
                  ${isToday    ? "bg-violet-600 text-white font-bold"   : ""}
                  ${isSelected && !isToday ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" : ""}
                  ${!isToday && !isSelected ? "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700" : ""}
                `}
              >
                {day}
                {hasEvents && !isToday && (
                  <span className={`mt-0.5 h-1 w-1 rounded-full ${LEVEL_DOT[topLevel ?? "info"]}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Leyenda */}
        <div className="mt-2 flex items-center gap-3">
          {[
            { color: "bg-red-500",    label: "Urgente"  },
            { color: "bg-amber-500",  label: "Próximo"  },
            { color: "bg-violet-500", label: "Programado" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1">
              <span className={`h-1.5 w-1.5 rounded-full ${l.color}`} />
              <span className="text-[10px] text-slate-400">{l.label}</span>
            </div>
          ))}
        </div>

        {/* Eventos del día seleccionado */}
        {selectedDay !== null && (
          <div className="mt-3 rounded-lg bg-slate-50 dark:bg-slate-700/40 p-2.5 flex flex-col gap-1.5">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {selectedDay} {MONTH_NAMES[month - 1]}
            </p>
            {selectedEvents.length === 0 ? (
              <p className="text-[11px] text-slate-400">Sin obligaciones este día</p>
            ) : (
              selectedEvents.map((ev, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${LEVEL_DOT[ev.level]}`} />
                  <p className="text-[11px] text-slate-700 dark:text-slate-200">{ev.title}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}