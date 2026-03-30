// app/(protected)/(intranet)/departments/legal/components/LegalCalendarCard.tsx
// SERVER COMPONENT
// Fuente de datos: Outlook Calendar vía MS Graph → getLegalData().calendarEvents

import { CalendarDays } from "lucide-react";
import type { LegalData, LegalCalendarEvent } from "@/lib/graph/departments/legal.service";

type Props = { data: LegalData };

const EVENT_TYPE_MAP: Record<
  LegalCalendarEvent["type"],
  { label: string; dot: string; bg: string; text: string; border: string }
> = {
  hearing:         { label: "Audiencia",         dot: "bg-red-500",     bg: "bg-red-50",      text: "text-red-700",     border: "border-red-100"    },
  contract_expiry: { label: "Vencimiento",        dot: "bg-amber-400",   bg: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-100"  },
  deadline:        { label: "Plazo legal",         dot: "bg-orange-500",  bg: "bg-orange-50",   text: "text-orange-700",  border: "border-orange-100" },
  filing:          { label: "Presentación",        dot: "bg-sky-500",     bg: "bg-sky-50",      text: "text-sky-700",     border: "border-sky-100"    },
  renewal:         { label: "Renovación",          dot: "bg-violet-500",  bg: "bg-violet-50",   text: "text-violet-700",  border: "border-violet-100" },
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00");
  return {
    day:   date.toLocaleDateString("es-MX", { day: "numeric" }),
    month: date.toLocaleDateString("es-MX", { month: "short" }),
  };
}

export default function LegalCalendarCard({ data }: Props) {
  const upcoming = [...data.calendarEvents]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
          <CalendarDays size={16} className="text-slate-600" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-800">Agenda jurídica</p>
          <p className="text-[11px] text-slate-400">Audiencias, vencimientos y plazos</p>
        </div>
      </div>

      {/* Events */}
      <ul className="divide-y divide-slate-50">
        {upcoming.map((event) => {
          const type = EVENT_TYPE_MAP[event.type];
          const { day, month } = formatDate(event.date);
          return (
            <li key={event.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors">
              {/* Date badge */}
              <div className={`flex w-11 shrink-0 flex-col items-center justify-center rounded-xl border py-1.5 ${type.bg} ${type.border}`}>
                <span className={`text-[10px] font-semibold uppercase ${type.text}`}>{month}</span>
                <span className={`text-base font-bold leading-none ${type.text}`}>{day}</span>
              </div>
              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{event.title}</p>
                <span className={`mt-0.5 inline-flex items-center gap-1 text-[10px] font-medium ${type.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${type.dot}`} />
                  {type.label}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}