// app/finance/components/FinanceCalendarCard.tsx
// SERVER COMPONENT (datos estáticos; puede ser async con fetch)
//
// Guard: finance+ (finance:view_modules)
// Posición: aside, debajo de FinanceAlertsCard
//
// Calendario de eventos financieros clave:
//   - Cierres de mes / trimestre / año
//   - Presentaciones a Junta
//   - Vencimientos fiscales
//   - Auditorías programadas

import { Calendar, ChevronRight } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type EventPriority = "high" | "medium" | "low";

interface FinanceEvent {
  id:       string;
  date:     string;   // "dd mmm"
  day:      number;   // para calcular "days away"
  month:    number;   // 1-based
  title:    string;
  tag:      string;
  priority: EventPriority;
}

// ── Config ────────────────────────────────────────────────────────────────────

const PRIORITY_DOT: Record<EventPriority, string> = {
  high:   "bg-rose-500",
  medium: "bg-amber-400",
  low:    "bg-emerald-400",
};

const PRIORITY_BADGE: Record<EventPriority, string> = {
  high:   "bg-rose-50   text-rose-600   border-rose-100",
  medium: "bg-amber-50  text-amber-600  border-amber-100",
  low:    "bg-emerald-50 text-emerald-600 border-emerald-100",
};

// ── Mock data (reemplazar con fetch real) ─────────────────────────────────────

const FINANCE_EVENTS: FinanceEvent[] = [
  { id: "e1", date: "28 mar", day: 28, month: 3, title: "Cierre Q1 2025",                   tag: "Cierre",    priority: "high"   },
  { id: "e2", date: "31 mar", day: 31, month: 3, title: "Reporte DIAN — IVA bimestral",     tag: "Fiscal",    priority: "high"   },
  { id: "e3", date: "7 abr",  day: 7,  month: 4, title: "Presentación Junta Directiva",     tag: "Junta",     priority: "medium" },
  { id: "e4", date: "15 abr", day: 15, month: 4, title: "Conciliación bancaria abril",      tag: "Contable",  priority: "low"    },
  { id: "e5", date: "22 abr", day: 22, month: 4, title: "Auditoría interna — inicio",       tag: "Auditoría", priority: "high"   },
  { id: "e6", date: "30 abr", day: 30, month: 4, title: "Cierre contable abril",            tag: "Cierre",    priority: "medium" },
];

// ── Helper: días restantes ────────────────────────────────────────────────────

function daysAway(day: number, month: number): number {
  const now    = new Date();
  const target = new Date(now.getFullYear(), month - 1, day);
  if (target < now) target.setFullYear(now.getFullYear() + 1);
  return Math.ceil((target.getTime() - now.getTime()) / 86_400_000);
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  className?: string;
}

export function FinanceCalendarCard({ className = "" }: Props) {
  const events = FINANCE_EVENTS.map((e) => ({ ...e, daysAway: daysAway(e.day, e.month) }))
    .sort((a, b) => a.daysAway - b.daysAway);

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden ${className}`}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
            <Calendar className="h-3.5 w-3.5 text-violet-600" />
          </span>
          <div>
            <h3 className="text-[12.5px] font-semibold text-slate-800">Calendario Financiero</h3>
            <p className="text-[10.5px] text-slate-400">Próximos eventos y vencimientos</p>
          </div>
        </div>
        <a
          href="/finance/calendar"
          className="flex items-center gap-0.5 text-[11px] font-medium text-violet-600 hover:text-violet-700 transition-colors"
          aria-label="Ver calendario completo"
        >
          Ver todo <ChevronRight className="h-3 w-3" />
        </a>
      </div>

      {/* Event list */}
      <ul className="divide-y divide-slate-50" role="list" aria-label="Próximos eventos financieros">
        {events.map((event) => {
          const isUrgent = event.daysAway <= 3;
          return (
            <li key={event.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors group">

              {/* Date chip */}
              <div className={`flex w-11 shrink-0 flex-col items-center rounded-lg py-1 ${isUrgent ? "bg-rose-50" : "bg-slate-50"}`}>
                <span className={`text-[13px] font-bold leading-tight ${isUrgent ? "text-rose-600" : "text-slate-700"}`}>
                  {event.date.split(" ")[0]}
                </span>
                <span className={`text-[9px] font-medium uppercase tracking-wide ${isUrgent ? "text-rose-400" : "text-slate-400"}`}>
                  {event.date.split(" ")[1]}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${PRIORITY_DOT[event.priority]}`} aria-hidden />
                  <p className="text-[12px] font-medium text-slate-700 truncate">{event.title}</p>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className={`inline-flex items-center rounded border px-1.5 py-px text-[9.5px] font-semibold ${PRIORITY_BADGE[event.priority]}`}>
                    {event.tag}
                  </span>
                  <span className={`text-[10px] ${isUrgent ? "font-semibold text-rose-500" : "text-slate-400"}`}>
                    {event.daysAway === 0 ? "Hoy" : event.daysAway === 1 ? "Mañana" : `en ${event.daysAway} días`}
                  </span>
                </div>
              </div>

              <ChevronRight className="h-3 w-3 text-slate-300 group-hover:text-violet-400 transition-colors shrink-0" />
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60">
        <a href="/finance/calendar/add" className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-violet-600 transition-colors">
          <span className="flex h-4 w-4 items-center justify-center rounded bg-slate-200 text-slate-500 text-[10px] font-bold">+</span>
          Agregar evento al calendario
        </a>
      </div>
    </div>
  );
}
