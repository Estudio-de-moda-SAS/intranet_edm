import { Briefcase, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

type Stage = "prospecto" | "contactado" | "propuesta" | "negociacion" | "cerrado";

type Deal = {
  client: string;
  value: number;
  stage: Stage;
  seller: string;
  initials: string;
  hue: number;
  daysIn: number;
  probability: number;
};

const STAGE_CONFIG: Record<Stage, { label: string; dot: string; text: string; bg: string }> = {
  prospecto:    { label: "Prospecto",    dot: "bg-slate-300",   text: "text-slate-500",   bg: "bg-slate-50"   },
  contactado:   { label: "Contactado",   dot: "bg-sky-400",     text: "text-sky-600",     bg: "bg-sky-50"     },
  propuesta:    { label: "Propuesta",    dot: "bg-violet-400",  text: "text-violet-600",  bg: "bg-violet-50"  },
  negociacion:  { label: "Negociación",  dot: "bg-amber-400",   text: "text-amber-600",   bg: "bg-amber-50"   },
  cerrado:      { label: "Cerrado",      dot: "bg-emerald-400", text: "text-emerald-600", bg: "bg-emerald-50" },
};

const DEALS: Deal[] = [
  { client: "Grupo Éxito",        value: 48000, stage: "negociacion", seller: "Valentina O.", initials: "VO", hue: 160, daysIn: 12, probability: 75 },
  { client: "Falabella Colombia", value: 32000, stage: "propuesta",   seller: "Andrés C.",    initials: "AC", hue: 200, daysIn: 7,  probability: 55 },
  { client: "Studio F",           value: 22000, stage: "cerrado",     seller: "Laura B.",     initials: "LB", hue: 280, daysIn: 3,  probability: 100},
  { client: "Arturo Calle",       value: 18500, stage: "contactado",  seller: "Felipe M.",    initials: "FM", hue: 30,  daysIn: 5,  probability: 30 },
  { client: "Tennis S.A.",        value: 27000, stage: "negociacion", seller: "Sara Q.",      initials: "SQ", hue: 340, daysIn: 18, probability: 65 },
  { client: "Punto Blanco",       value: 14200, stage: "propuesta",   seller: "Valentina O.", initials: "VO", hue: 160, daysIn: 4,  probability: 45 },
];

// Stage summary
const STAGE_SUMMARY: { stage: Stage; count: number; total: number }[] = [
  { stage: "prospecto",   count: 8,  total: 96000  },
  { stage: "contactado",  count: 14, total: 182000 },
  { stage: "propuesta",   count: 9,  total: 138000 },
  { stage: "negociacion", count: 6,  total: 115000 },
  { stage: "cerrado",     count: 22, total: 348000 },
];

export default function CommercialPipelineCard() {
  const weightedValue = DEALS.reduce((s, d) => s + d.value * (d.probability / 100), 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
            <Briefcase className="h-3.5 w-3.5 text-violet-600" />
          </span>
          <h2 className="text-sm font-semibold text-slate-800">Pipeline Comercial</h2>
          <span className="rounded-full bg-violet-50 border border-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-600">
            ${(weightedValue / 1000).toFixed(0)}k ponderado
          </span>
        </div>
        <Link href="/comercial/pipeline" className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-emerald-600 transition-colors">
          Ver todo <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Stage summary strip */}
      <div className="grid grid-cols-5 divide-x divide-slate-100 border-b border-slate-100">
        {STAGE_SUMMARY.map((s) => {
          const cfg = STAGE_CONFIG[s.stage];
          return (
            <div key={s.stage} className="flex flex-col items-center gap-0.5 py-3 px-2 hover:bg-slate-50 transition-colors cursor-pointer">
              <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
              <p className="text-[10px] font-semibold text-slate-600 text-center leading-tight">{cfg.label}</p>
              <p className="text-[13px] font-bold text-slate-800 tabular-nums">{s.count}</p>
              <p className="text-[9px] text-slate-400">${(s.total / 1000).toFixed(0)}k</p>
            </div>
          );
        })}
      </div>

      {/* Deals list */}
      <ul className="divide-y divide-slate-50">
        {DEALS.map((deal, i) => {
          const cfg = STAGE_CONFIG[deal.stage];
          return (
            <li key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors cursor-pointer">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white shadow-sm"
                style={{ background: `linear-gradient(135deg, hsl(${deal.hue},65%,55%), hsl(${deal.hue + 20},60%,45%))` }}
              >
                {deal.initials}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-800 truncate">{deal.client}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-slate-400">{deal.seller}</span>
                  <span className="text-slate-200">·</span>
                  <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                    <Clock className="h-2.5 w-2.5" />{deal.daysIn}d
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[13px] font-bold text-slate-800 tabular-nums">${(deal.value / 1000).toFixed(0)}k</span>
                <span className={`rounded-full border px-2 py-px text-[10px] font-semibold ${cfg.bg} ${cfg.text}`}>
                  {cfg.label}
                </span>
              </div>

              <div className="w-10 shrink-0">
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cfg.dot.replace("bg-", "bg-")}`}
                    style={{ width: `${deal.probability}%` }}
                  />
                </div>
                <p className="mt-0.5 text-[9px] text-slate-400 text-right">{deal.probability}%</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}