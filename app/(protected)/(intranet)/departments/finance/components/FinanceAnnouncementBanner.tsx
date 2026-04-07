"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Megaphone, AlertTriangle, CheckCircle2, Bell } from "lucide-react";

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

interface BannerProps {
  announcements?: Announcement[];
  autoRotateMs?:  number;
  className?:     string;
}

const TYPE_CONFIG = {
  info: {
    bg:        "bg-violet-50 dark:bg-violet-500/[0.07]",
    border:    "border-violet-200 dark:border-violet-500/20",
    iconBg:    "bg-violet-100 dark:bg-violet-500/[0.15]",
    iconColor: "text-violet-600 dark:text-violet-400",
    textTitle: "text-violet-900 dark:text-violet-300",
    textMsg:   "text-violet-700 dark:text-violet-400/80",
    dot:       "bg-violet-400",
    Icon:      Megaphone,
  },
  warning: {
    bg:        "bg-amber-50 dark:bg-amber-500/[0.07]",
    border:    "border-amber-200 dark:border-amber-500/20",
    iconBg:    "bg-amber-100 dark:bg-amber-500/[0.15]",
    iconColor: "text-amber-600 dark:text-amber-400",
    textTitle: "text-amber-900 dark:text-amber-300",
    textMsg:   "text-amber-700 dark:text-amber-400/80",
    dot:       "bg-amber-400",
    Icon:      AlertTriangle,
  },
  success: {
    bg:        "bg-emerald-50 dark:bg-emerald-500/[0.07]",
    border:    "border-emerald-200 dark:border-emerald-500/20",
    iconBg:    "bg-emerald-100 dark:bg-emerald-500/[0.15]",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    textTitle: "text-emerald-900 dark:text-emerald-300",
    textMsg:   "text-emerald-700 dark:text-emerald-400/80",
    dot:       "bg-emerald-400",
    Icon:      CheckCircle2,
  },
  urgent: {
    bg:        "bg-rose-50 dark:bg-rose-500/[0.07]",
    border:    "border-rose-200 dark:border-rose-500/20",
    iconBg:    "bg-rose-100 dark:bg-rose-500/[0.15]",
    iconColor: "text-rose-600 dark:text-rose-400",
    textTitle: "text-rose-900 dark:text-rose-300",
    textMsg:   "text-rose-700 dark:text-rose-400/80",
    dot:       "bg-rose-500",
    Icon:      Bell,
  },
} as const;

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  { id: "fin-ann-001", type: "urgent",  title: "Cierre trimestral — fecha límite",       message: "El cierre del Q1 2025 vence el viernes 28 de marzo. Todos los centros de costo deben tener sus registros conciliados antes de las 17:00 h.", date: "14 mar 2025", actionLabel: "Ver checklist", actionHref: "/finance/reports?filter=q1-close" },
  { id: "fin-ann-002", type: "warning", title: "Actualización política de gastos de viaje", message: "A partir del 1 de abril rigen nuevos topes por categoría. Consulta el anexo actualizado antes de solicitar anticipos o reembolsos.",        date: "12 mar 2025", actionLabel: "Ver política",  actionHref: "/finance/policies/travel"             },
  { id: "fin-ann-003", type: "success", title: "Presupuesto 2025 aprobado por Junta",     message: "El presupuesto anual fue ratificado en sesión del 10 de marzo. Los gerentes ya pueden visualizar las asignaciones por área en el panel.",      date: "10 mar 2025" },
];

const STORAGE_KEY = "finance_dismissed_announcements";
function getDismissed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try { const raw = sessionStorage.getItem(STORAGE_KEY); return new Set(raw ? JSON.parse(raw) : []); }
  catch { return new Set(); }
}
function saveDismissed(ids: Set<string>) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...ids])); } catch { /* noop */ }
}

export function FinanceAnnouncementBanner({
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

  const safeIndex = Math.min(current, active.length - 1);
  const item = active[safeIndex];
  if (!item) return null;
  const cfg = TYPE_CONFIG[item.type];
  const { Icon } = cfg;

  return (
    <div className={className} role="region" aria-label="Comunicados de Finanzas">
      <div className={`relative flex items-start gap-3 rounded-xl border px-4 py-3 pb-5 transition-all duration-300
                       ${cfg.bg} ${cfg.border}`}>
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
            <a href={item.actionHref}
               className={`mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold underline underline-offset-2 transition-opacity hover:opacity-80 ${cfg.textTitle}`}>
              {item.actionLabel} →
            </a>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1 ml-2">
          {active.length > 1 && (
            <>
              <button onClick={() => setCurrent((c) => (c - 1 + active.length) % active.length)} aria-label="Anterior"
                      className={`flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${cfg.textMsg}`}>
                <ChevronLeft className="h-3 w-3" />
              </button>
              <button onClick={() => setCurrent((c) => (c + 1) % active.length)} aria-label="Siguiente"
                      className={`flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${cfg.textMsg}`}>
                <ChevronRight className="h-3 w-3" />
              </button>
            </>
          )}
          <button onClick={() => dismiss(item.id)} aria-label="Cerrar comunicado"
                  className={`flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${cfg.textMsg}`}>
            <X className="h-3 w-3" />
          </button>
        </div>

        {active.length > 1 && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1" aria-hidden>
            {active.map((a, i) => (
              <button key={a.id} onClick={() => setCurrent(i)}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        i === current
                          ? `w-4 ${cfg.dot}`
                          : "w-1 bg-black/15 dark:bg-white/15"
                      }`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

