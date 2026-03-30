import { Cake, Star } from "lucide-react";

type Event = {
  name: string;
  type: "birthday" | "anniversary";
  detail: string;
  date: string;
  initials: string;
  hue: number;
};

const EVENTS: Event[] = [
  { name: "Carolina Mejía",  type: "birthday",    detail: "Cumpleaños",              date: "Hoy",        initials: "CM", hue: 320 },
  { name: "Diego Ramírez",   type: "anniversary", detail: "5 años en la empresa",    date: "Hoy",        initials: "DR", hue: 200 },
  { name: "Paola Jiménez",   type: "birthday",    detail: "Cumpleaños",              date: "Mañana",     initials: "PJ", hue: 260 },
  { name: "Sebastián Mora",  type: "anniversary", detail: "10 años en la empresa",   date: "En 2 días",  initials: "SM", hue: 160 },
  { name: "Isabel Castro",   type: "birthday",    detail: "Cumpleaños",              date: "En 3 días",  initials: "IC", hue: 30  },
];

export default function HRAnniversariesCard() {
  const todayCount = EVENTS.filter((e) => e.date === "Hoy").length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50">
            <Cake className="h-3.5 w-3.5 text-rose-500" />
          </span>
          <h2 className="text-sm font-semibold text-slate-800">Celebraciones</h2>
        </div>
        {todayCount > 0 && (
          <span className="rounded-full bg-rose-50 border border-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-500">
            {todayCount} hoy
          </span>
        )}
      </div>

      <ul className="divide-y divide-slate-50">
        {EVENTS.map((ev, i) => (
          <li key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white shadow-sm"
              style={{ background: `linear-gradient(135deg, hsl(${ev.hue},65%,58%), hsl(${ev.hue + 20},60%,48%))` }}
            >
              {ev.initials}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-slate-800 truncate">{ev.name}</p>
              <div className="flex items-center gap-1.5">
                {ev.type === "birthday"
                  ? <Cake className="h-3 w-3 text-rose-400" />
                  : <Star className="h-3 w-3 text-amber-400" />
                }
                <p className="text-[11px] text-slate-400">{ev.detail}</p>
              </div>
            </div>

            <span className={`shrink-0 text-[11px] font-semibold ${
              ev.date === "Hoy" ? "text-violet-600" : "text-slate-400"
            }`}>
              {ev.date}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}