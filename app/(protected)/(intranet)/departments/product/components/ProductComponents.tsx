// app/product/components/ProductComponents.tsx
// Componentes secundarios de la homepage de Producto — Estudio de Moda SAS.
// Todos exportados como named exports.
"use client";

import { useState, useEffect, useCallback }  from "react";
import { X, ChevronLeft, ChevronRight,
         Megaphone, AlertTriangle,
         CheckCircle2, Bell }                from "lucide-react";
import { CalendarDays }                      from "lucide-react";
import { Activity }                          from "lucide-react";
import { Download }                          from "lucide-react";
import { ExternalLink }                      from "lucide-react";
import { Wrench }                            from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// ProductAnnouncementBanner
// Mismo patrón que FinanceAnnouncementBanner:
//   - Múltiples anuncios con navegación por dots
//   - Dismiss individual persistido en sessionStorage
//   - Tipos: info | warning | success | urgent
//   - Auto-rotate opcional
// ─────────────────────────────────────────────────────────────────────────────

export type AnnouncementType = "info" | "warning" | "success" | "urgent";

export interface Announcement {
  id:           string;
  type:         AnnouncementType;
  title:        string;
  message:      string;
  date?:        string;
  actionLabel?: string;
  actionHref?:  string;
}

type BannerProps = {
  announcements?: Announcement[];
  autoRotateMs?:  number;
  className?:     string;
};

const TYPE_CONFIG = {
  info: {
    bg: "bg-amber-50", border: "border-amber-200",
    iconBg: "bg-amber-100", iconColor: "text-amber-600",
    textTitle: "text-amber-900", textMsg: "text-amber-700",
    dot: "bg-amber-400", Icon: Megaphone,
  },
  warning: {
    bg: "bg-orange-50", border: "border-orange-200",
    iconBg: "bg-orange-100", iconColor: "text-orange-600",
    textTitle: "text-orange-900", textMsg: "text-orange-700",
    dot: "bg-orange-400", Icon: AlertTriangle,
  },
  success: {
    bg: "bg-emerald-50", border: "border-emerald-200",
    iconBg: "bg-emerald-100", iconColor: "text-emerald-600",
    textTitle: "text-emerald-900", textMsg: "text-emerald-700",
    dot: "bg-emerald-400", Icon: CheckCircle2,
  },
  urgent: {
    bg: "bg-rose-50", border: "border-rose-200",
    iconBg: "bg-rose-100", iconColor: "text-rose-600",
    textTitle: "text-rose-900", textMsg: "text-rose-700",
    dot: "bg-rose-500", Icon: Bell,
  },
} as const;

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "prod-ann-001", type: "urgent",
    title: "Cierre de fichas técnicas SS-25 — fecha límite",
    message: "El cierre de fichas para la colección SS-25 vence el martes 18 de junio. Quedan 4 fichas incompletas que bloquean el fitting del 20 de junio.",
    date: "14 jun 2025", actionLabel: "Ver pendientes", actionHref: "/product/techsheets?filter=incomplete",
  },
  {
    id: "prod-ann-002", type: "warning",
    title: "Muestra rechazada — CU-2542 requiere ajuste",
    message: "La muestra R1 del cubre-bikini kimono fue rechazada por desviación en el corte. El proveedor 'Sedas del Valle' debe reenviar antes del 24 de junio.",
    date: "13 jun 2025", actionLabel: "Ver muestra", actionHref: "/product/samples/s4",
  },
  {
    id: "prod-ann-003", type: "success",
    title: "Colección FW-24 cerrada exitosamente",
    message: "Las 112 referencias de Otoño Invierno 2024 fueron aprobadas y distribuidas a todas las tiendas. El cierre oficial quedó registrado el 10 de junio.",
    date: "10 jun 2025",
  },
];

const STORAGE_KEY = "product_dismissed_announcements";

function getDismissed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
}

function saveDismissed(ids: Set<string>) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...ids])); }
  catch { /* noop */ }
}

export function ProductAnnouncementBanner({
  announcements = DEFAULT_ANNOUNCEMENTS,
  autoRotateMs  = 6000,
  className     = "",
}: BannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [current,   setCurrent]   = useState(0);
  const [mounted,   setMounted]   = useState(false);

  useEffect(() => { setDismissed(getDismissed()); setMounted(true); }, []);

  const active = announcements.filter((a) => !dismissed.has(a.id));

  useEffect(() => {
    if (active.length > 0 && current >= active.length) setCurrent(active.length - 1);
  }, [active.length, current]);

  useEffect(() => {
    if (!autoRotateMs || active.length <= 1) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % active.length), autoRotateMs);
    return () => clearInterval(id);
  }, [autoRotateMs, active.length]);

  const dismiss = useCallback((id: string) => {
    setDismissed((prev) => {
      const next = new Set(prev).add(id);
      saveDismissed(next);
      return next;
    });
  }, []);

  if (!mounted || active.length === 0) return null;

const item = active[Math.min(current, active.length - 1)];
if (!item) return null;

const cfg  = TYPE_CONFIG[item.type];
const { Icon } = cfg;

  return (
    <div className={className} role="region" aria-label="Comunicados de Producto">
      <div className={`relative flex items-start gap-3 rounded-xl border px-4 py-3 pb-5 transition-all duration-300 ${cfg.bg} ${cfg.border}`}>
        <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${cfg.iconBg}`} aria-hidden>
          <Icon className={`h-3.5 w-3.5 ${cfg.iconColor}`} />
        </span>

        <div className="flex-1 min-w-0 pt-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className={`text-[12px] font-semibold ${cfg.textTitle}`}>{item.title}</span>
            {item.date && (
              <span className={`text-[10px] font-medium opacity-60 ${cfg.textMsg}`}>{item.date}</span>
            )}
          </div>
          <p className={`mt-0.5 text-[11.5px] leading-snug ${cfg.textMsg}`}>{item.message}</p>
          {item.actionLabel && item.actionHref && (
            <a href={item.actionHref} className={`mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold underline underline-offset-2 ${cfg.textTitle} hover:opacity-80 transition-opacity`}>
              {item.actionLabel} →
            </a>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1 ml-2">
          {active.length > 1 && (
            <>
              <button onClick={() => setCurrent((c) => (c - 1 + active.length) % active.length)} aria-label="Anterior" className={`flex h-5 w-5 items-center justify-center rounded hover:bg-black/5 transition-colors ${cfg.textMsg}`}>
                <ChevronLeft className="h-3 w-3" />
              </button>
              <button onClick={() => setCurrent((c) => (c + 1) % active.length)} aria-label="Siguiente" className={`flex h-5 w-5 items-center justify-center rounded hover:bg-black/5 transition-colors ${cfg.textMsg}`}>
                <ChevronRight className="h-3 w-3" />
              </button>
            </>
          )}
          <button onClick={() => dismiss(item.id)} aria-label="Cerrar comunicado" className={`flex h-5 w-5 items-center justify-center rounded hover:bg-black/5 transition-colors ${cfg.textMsg}`}>
            <X className="h-3 w-3" />
          </button>
        </div>

        {active.length > 1 && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1" aria-hidden>
            {active.map((a, i) => (
              <button key={a.id} onClick={() => setCurrent(i)} className={`h-1 rounded-full transition-all duration-300 ${i === current ? `w-4 ${cfg.dot}` : "w-1 bg-black/15"}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProductCalendarCard
// ─────────────────────────────────────────────────────────────────────────────

type CalEvent = {
  date:  string;
  title: string;
  type:  "deadline" | "launch" | "review" | "fitting" | "delivery";
};

const CAL_EVENTS: CalEvent[] = [
  { date: "18 jun", title: "Cierre de fichas SS-25 — última fecha",  type: "deadline" },
  { date: "20 jun", title: "Fitting colección principal SS-25",       type: "fitting"  },
  { date: "24 jun", title: "Entrega de muestras Resort-25 R2",        type: "delivery" },
  { date: "28 jun", title: "Revisión final con dirección comercial",  type: "review"   },
  { date: "15 jul", title: "Lanzamiento SS-25 — tiendas nacionales",  type: "launch"   },
];

const CAL_TYPE_COLORS: Record<CalEvent["type"], string> = {
  deadline: "bg-rose-100    text-rose-700",
  launch:   "bg-emerald-100 text-emerald-700",
  review:   "bg-sky-100     text-sky-700",
  fitting:  "bg-violet-100  text-violet-700",
  delivery: "bg-amber-100   text-amber-700",
};

const CAL_TYPE_LABEL: Record<CalEvent["type"], string> = {
  deadline: "Cierre",
  launch:   "Lanzamiento",
  review:   "Revisión",
  fitting:  "Fitting",
  delivery: "Entrega",
};

export function ProductCalendarCard() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50">
          <CalendarDays className="h-3.5 w-3.5 text-amber-600" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Calendario de temporada</h2>
          <p className="text-[11px] text-slate-400">Hitos SS-25 y Resort-25</p>
        </div>
      </div>
      <div className="space-y-2">
        {CAL_EVENTS.map((ev, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-stone-100 bg-stone-50/50 px-3 py-2 hover:border-amber-200 transition-colors"
          >
            <span className="w-12 shrink-0 text-[11px] font-semibold text-stone-500 text-center leading-tight">
              {ev.date}
            </span>
            <p className="flex-1 text-[12px] font-medium text-slate-700 truncate">{ev.title}</p>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${CAL_TYPE_COLORS[ev.type]}`}>
              {CAL_TYPE_LABEL[ev.type]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProductActivityFeed
// ─────────────────────────────────────────────────────────────────────────────

type FeedItem = {
  actor:  string;
  action: string;
  target: string;
  time:   string;
  type:   "approval" | "upload" | "change" | "comment";
};

const FEED_DOT: Record<FeedItem["type"], string> = {
  approval: "bg-emerald-400",
  upload:   "bg-sky-400",
  change:   "bg-amber-400",
  comment:  "bg-stone-300",
};

const FEED_ITEMS: FeedItem[] = [
  { actor: "Valentina M.", action: "aprobó la muestra R2 de",       target: "BL-2501 · Blusa lino perforada",   time: "hace 15 min", type: "approval" },
  { actor: "Carlos R.",    action: "subió ficha técnica de",         target: "PA-2517 · Pantalón palazzo crêpe", time: "hace 1 h",    type: "upload"   },
  { actor: "Sistema",      action: "rechazó muestra de",             target: "CU-2542 · Cubre-bikini kimono",    time: "hace 2 h",    type: "change"   },
  { actor: "Laura P.",     action: "actualizó medidas de talla en",  target: "VE-2508 · Vestido lencero midi",   time: "hace 3 h",    type: "change"   },
  { actor: "Dirección",    action: "comentó en colección",           target: "Resort 2025",                      time: "ayer",        type: "comment"  },
  { actor: "Carlos R.",    action: "creó ficha técnica de",          target: "SH-2545 · Short bordado a mano",   time: "ayer",        type: "upload"   },
  { actor: "Valentina M.", action: "cerró revisión de",              target: "FW-24 · Otoño Invierno 2024",      time: "hace 2 días", type: "approval" },
];

type ActivityProps = { limit?: number };

export function ProductActivityFeed({ limit = 7 }: ActivityProps) {
  const items = FEED_ITEMS.slice(0, limit);
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100">
          <Activity className="h-3.5 w-3.5 text-stone-600" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Actividad reciente</h2>
          <p className="text-[11px] text-slate-400">Últimas acciones del equipo de producto</p>
        </div>
      </div>
      <div className="relative">
        <div className="absolute left-[7px] top-0 bottom-0 w-px bg-stone-100" />
        <div className="space-y-3 pl-5">
          {items.map((item, i) => (
            <div key={i} className="relative">
              <span className={`absolute -left-[18px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white ${FEED_DOT[item.type]}`} />
              <p className="text-[12px] text-slate-700 leading-snug">
                <span className="font-semibold">{item.actor}</span>{" "}
                {item.action}{" "}
                <span className="font-medium text-slate-800">{item.target}</span>
              </p>
              <p className="text-[10px] text-stone-400 mt-0.5">{item.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProductExportToolbar
// ─────────────────────────────────────────────────────────────────────────────

type ExportProps = { periodLabel: string };

export function ProductExportToolbar({ periodLabel }: ExportProps) {
  const handleExport = (format: "excel" | "pdf") => {
    console.log(`Exportando ${format} — ${periodLabel}`);
  };
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleExport("excel")}
        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-[11px] font-medium text-stone-600 hover:border-amber-300 hover:text-amber-700 transition-colors shadow-sm"
      >
        <Download className="h-3 w-3" />
        Excel
      </button>
      <button
        onClick={() => handleExport("pdf")}
        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-[11px] font-medium text-stone-600 hover:border-amber-300 hover:text-amber-700 transition-colors shadow-sm"
      >
        <Download className="h-3 w-3" />
        PDF
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProductBlockersCard
// ─────────────────────────────────────────────────────────────────────────────

type Alert = {
  id:       string;
  title:    string;
  area:     string;
  severity: "high" | "medium" | "low";
  href:     string;
};

const ALERTS: Alert[] = [
  { id: "a1", title: "Ficha técnica FA-2503 incompleta — lanzamiento en 34 días",  area: "Faldas",      severity: "high",   href: "/product/techsheets/FA-2503"   },
  { id: "a2", title: "Muestra CU-2542 rechazada en R1 — requiere ajuste de corte", area: "Resort-25",   severity: "high",   href: "/product/samples/s4"           },
  { id: "a3", title: "Proveedor 'Sedas del Valle' sin confirmación de entrega",    area: "Proveedores", severity: "medium", href: "/product/suppliers"            },
  { id: "a4", title: "2 referencias sin categoría asignada en Resort-25",          area: "Colecciones", severity: "low",    href: "/product/collections/resort25" },
];

const ALERT_SEV = {
  high:   { label: "Alta",  cls: "bg-rose-50  text-rose-700  border-rose-200",  dot: "bg-rose-400"  },
  medium: { label: "Media", cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400" },
  low:    { label: "Baja",  cls: "bg-stone-50 text-stone-500 border-stone-200", dot: "bg-stone-300" },
};

export function ProductBlockersCard() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50">
          <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Alertas del área</h2>
          <p className="text-[11px] text-slate-400">{ALERTS.length} pendientes de atención</p>
        </div>
      </div>
      <div className="space-y-2.5">
        {ALERTS.map((a) => {
          const sev = ALERT_SEV[a.severity];
          return (
            <a
              key={a.id}
              href={a.href}
              className="group flex items-start gap-2.5 rounded-lg border border-stone-100 bg-stone-50/60 px-3 py-2.5 hover:border-rose-200 hover:bg-rose-50/20 transition-colors"
            >
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${sev.dot}`} />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-slate-700 leading-snug">{a.title}</p>
                <p className="text-[10px] text-stone-400 mt-0.5">{a.area}</p>
              </div>
              <div className="shrink-0 flex items-center gap-1.5">
                <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${sev.cls}`}>
                  {sev.label}
                </span>
                <ExternalLink className="h-3 w-3 text-stone-300 group-hover:text-rose-400 transition-colors" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProductToolsCard
// ─────────────────────────────────────────────────────────────────────────────

type Tool = {
  name:     string;
  desc:     string;
  href:     string;
  external: boolean;
};

const TOOLS: Tool[] = [
  { name: "Centric PLM",       desc: "Gestión del ciclo de producto", href: "https://centric.acme.com",      external: true },
  { name: "Adobe Illustrator", desc: "Diseño de fichas y bocetos",    href: "https://adobe.com/illustrator", external: true },
  { name: "ERP Odoo",          desc: "Referencias y BOM",             href: "https://odoo.acme.com",         external: true },
  { name: "Teams",             desc: "Comunicación de colecciones",   href: "https://teams.microsoft.com",   external: true },
  { name: "SharePoint",        desc: "Repositorio de fichas",         href: "https://acme.sharepoint.com",   external: true },
  { name: "Trello",            desc: "Seguimiento de muestras",       href: "https://trello.com/acme",       external: true },
];

export function ProductToolsCard() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100">
          <Wrench className="h-3.5 w-3.5 text-stone-500" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Herramientas del equipo</h2>
          <p className="text-[11px] text-slate-400">Acceso rápido al stack de producto</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {TOOLS.map((t) => (
          <a
            key={t.name}
            href={t.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col rounded-xl border border-stone-100 bg-stone-50/60 px-3 py-2.5 hover:border-amber-300 hover:bg-amber-50/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-slate-700 truncate">{t.name}</span>
              <ExternalLink className="h-3 w-3 shrink-0 text-stone-300 group-hover:text-amber-500 transition-colors" />
            </div>
            <span className="mt-0.5 text-[10px] text-stone-400 truncate">{t.desc}</span>
          </a>
        ))}
      </div>
    </div>
  );
}