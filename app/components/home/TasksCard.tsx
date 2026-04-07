"use client";

import { useState } from "react";
import {
  ClipboardList,
  PartyPopper,
  ChevronDown,
  CheckCircle2,
  Clock,
  Tag,
  Building2,
  ExternalLink,
  History,
  ArrowUpRight,
} from "lucide-react";
import { fmtFecha } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types/home";

// ── Tipos ─────────────────────────────────────────────────────────────────────
export interface TaskDetail extends Task {
  description?: string;
  assignee?: { name: string; initials: string; color?: string };
  requester?: { name: string; initials: string; color?: string };
  area?: string;
  tags?: string[];
  sourceSystem?: string;
  sourceId?: string;
  plannerUrl?: string;
  plannerTaskId?: string;
}

// ── Estilos de prioridad ──────────────────────────────────────────────────────
const PRIORITY_CONFIG: Record<string, {
  dot: string; bar: string;
  badge: string; badgeText: string;
  rowHover: string; label: string;
  detailAccent: string;
}> = {
  alta: {
    dot:         "bg-rose-400",
    bar:         "bg-rose-500",
    badge:       "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/[0.12] dark:border-rose-500/25 dark:text-rose-400",
    badgeText:   "text-rose-700 dark:text-rose-400",
    rowHover:    "hover:bg-rose-50/40 dark:hover:bg-rose-500/[0.06]",
    label:       "Alta",
    detailAccent:"border-l-2 border-rose-400 pl-3",
  },
  media: {
    dot:         "bg-amber-400",
    bar:         "bg-amber-400",
    badge:       "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/[0.12] dark:border-amber-500/25 dark:text-amber-400",
    badgeText:   "text-amber-700 dark:text-amber-400",
    rowHover:    "hover:bg-amber-50/30 dark:hover:bg-amber-500/[0.06]",
    label:       "Media",
    detailAccent:"border-l-2 border-amber-400 pl-3",
  },
  baja: {
    dot:         "bg-emerald-400",
    bar:         "bg-emerald-400",
    badge:       "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/[0.12] dark:border-emerald-500/25 dark:text-emerald-400",
    badgeText:   "text-emerald-700 dark:text-emerald-400",
    rowHover:    "hover:bg-emerald-50/30 dark:hover:bg-emerald-500/[0.06]",
    label:       "Baja",
    detailAccent:"border-l-2 border-emerald-400 pl-3",
  },
};

const STATUS_CONFIG: Record<TaskStatus, { dot: string; bg: string; text: string; label: string }> = {
  pendiente:   { dot: "bg-slate-400",   bg: "bg-slate-50 border-slate-200 dark:bg-slate-500/[0.10] dark:border-slate-500/20",     text: "text-slate-600 dark:text-slate-400",   label: "Pendiente"   },
  en_progreso: { dot: "bg-amber-400",   bg: "bg-amber-50 border-amber-200 dark:bg-amber-500/[0.10] dark:border-amber-500/20",     text: "text-amber-700 dark:text-amber-400",   label: "En progreso" },
  completada:  { dot: "bg-emerald-400", bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/[0.10] dark:border-emerald-500/20", text: "text-emerald-700 dark:text-emerald-400", label: "Completada"  },
  bloqueada:   { dot: "bg-rose-500",    bg: "bg-rose-50 border-rose-200 dark:bg-rose-500/[0.10] dark:border-rose-500/20",       text: "text-rose-700 dark:text-rose-400",    label: "Bloqueada"   },
};

const DEFAULT_PRIORITY = PRIORITY_CONFIG["media"]!;
const DEFAULT_STATUS   = STATUS_CONFIG["pendiente"]!;

// ── Sub-componentes ───────────────────────────────────────────────────────────
function Avatar({ initials, color = "bg-violet-500" }: { initials: string; color?: string }) {
  return (
    <span className={cn(
      "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
      "text-[10px] font-semibold text-white ring-1 ring-white dark:ring-[#161b22]",
      color
    )}>
      {initials}
    </span>
  );
}

function PlannerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3"  y="3"  width="8" height="8" rx="1.5" fill="currentColor" opacity="0.9" />
      <rect x="13" y="3"  width="8" height="8" rx="1.5" fill="currentColor" opacity="0.6" />
      <rect x="3"  y="13" width="8" height="8" rx="1.5" fill="currentColor" opacity="0.6" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

// ── Panel de detalle inline ───────────────────────────────────────────────────
function TaskDetailPanel({ task }: { task: TaskDetail }) {
  const p = PRIORITY_CONFIG[task.priority ?? "media"] ?? DEFAULT_PRIORITY;
  const s = STATUS_CONFIG[task.status     ?? "pendiente"] ?? DEFAULT_STATUS;
  const isFromPlanner = !!task.plannerUrl;

  return (
    <div className="overflow-hidden animate-in slide-in-from-top-1 duration-200">
      <div className="mx-4 mb-3 rounded-xl border border-slate-100 bg-slate-50/70 overflow-hidden
                      dark:border-[#30363d] dark:bg-[#1c2128]">

        {/* Franja de acento superior */}
        <div className={cn("h-[3px] w-full", p.bar)} />

        <div className="p-4 flex flex-col gap-4">

          {/* Badges: prioridad + estado + origen */}
          <div className="flex flex-wrap gap-2">
            <span className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
              p.badge
            )}>
              <span className={cn("h-1.5 w-1.5 rounded-full", p.dot)} />
              Prioridad {p.label}
            </span>
            <span className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
              s.bg, s.text
            )}>
              <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
              {s.label}
            </span>
            {isFromPlanner ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border
                               border-[#e0dff5] bg-[#f2f1fb] px-2.5 py-0.5 text-[11px] font-medium text-[#5b5ea6]
                               dark:border-violet-500/20 dark:bg-violet-500/[0.10] dark:text-violet-400">
                <PlannerIcon className="h-3 w-3 text-[#5b5ea6] dark:text-violet-400" />
                Microsoft Planner
              </span>
            ) : task.sourceSystem ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border
                               border-violet-100 bg-violet-50 px-2.5 py-0.5 text-[11px] font-medium text-violet-600
                               dark:border-violet-500/20 dark:bg-violet-500/[0.10] dark:text-violet-400">
                <ExternalLink className="h-3 w-3" />
                {task.sourceSystem}
              </span>
            ) : null}
          </div>

          {/* Metadatos en grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

            {/* Vencimiento */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-[#545d68]">
                Vencimiento
              </span>
              <span className={cn(
                "flex items-center gap-1.5 text-[12px] font-medium",
                task.priority === "alta"
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-slate-700 dark:text-[#adbac7]"
              )}>
                <Clock className={cn("h-3.5 w-3.5",
                  task.priority === "alta" ? "text-rose-400" : "text-slate-400 dark:text-[#545d68]"
                )} />
                {fmtFecha(task.due)}
              </span>
            </div>

            {/* Asignado a */}
            {task.assignee && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-[#545d68]">
                  Asignado a
                </span>
                <span className="flex items-center gap-1.5 text-[12px] font-medium text-slate-700 dark:text-[#adbac7]">
                  <Avatar initials={task.assignee.initials} {...(task.assignee.color !== undefined && { color: task.assignee.color })} />
                  {task.assignee.name}
                </span>
              </div>
            )}

            {/* Solicitante */}
            {task.requester && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-[#545d68]">
                  Solicitante
                </span>
                <span className="flex items-center gap-1.5 text-[12px] font-medium text-slate-700 dark:text-[#adbac7]">
                  <Avatar initials={task.requester.initials} {...(task.requester.color !== undefined && { color: task.requester.color })} />
                  {task.requester.name}
                </span>
              </div>
            )}

            {/* Área */}
            {task.area && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-[#545d68]">
                  Área
                </span>
                <span className="flex items-center gap-1.5 text-[12px] font-medium text-slate-700 dark:text-[#adbac7]">
                  <Building2 className="h-3.5 w-3.5 text-slate-400 dark:text-[#545d68]" />
                  {task.area}
                </span>
              </div>
            )}

          </div>

          {/* Descripción */}
          {task.description && (
            <div className={cn(
              "text-[12px] leading-relaxed text-slate-500 dark:text-[#768390]",
              p.detailAccent
            )}>
              {task.description}
            </div>
          )}

          {/* Etiquetas */}
          {task.tags?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5
                             text-[11px] text-slate-500
                             dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#768390]"
                >
                  <Tag className="h-2.5 w-2.5 text-slate-400 dark:text-[#545d68]" />
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          {/* Acciones */}
          <div className="flex items-center gap-2 pt-0.5">
            {isFromPlanner && task.plannerUrl && (
              <a
                href={task.plannerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5",
                  "bg-[#5b5ea6] hover:bg-[#4e51a0] transition-colors",
                  "text-[11.5px] font-semibold text-white"
                )}
              >
                <PlannerIcon className="h-3.5 w-3.5 text-white" />
                Abrir en Planner
                <ArrowUpRight className="h-3 w-3 text-white/70" />
              </a>
            )}
            <button className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-colors",
              "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300",
              "dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#adbac7] dark:hover:bg-[#1c2128] dark:hover:border-[#444c56]",
              "text-[11.5px] font-medium"
            )}>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Completar
            </button>
            <button className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-colors",
              "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300",
              "dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#adbac7] dark:hover:bg-[#1c2128] dark:hover:border-[#444c56]",
              "text-[11.5px] font-medium"
            )}>
              <History className="h-3.5 w-3.5 text-slate-400 dark:text-[#545d68]" />
              Historial
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function TasksCard({ tasks }: { tasks: TaskDetail[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const isEmpty = tasks.length === 0;

  const toggle = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const counts = {
    alta:  tasks.filter((t) => t.priority === "alta").length,
    media: tasks.filter((t) => t.priority === "media").length,
    baja:  tasks.filter((t) => t.priority === "baja").length,
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col h-full overflow-hidden
                    dark:border-[#30363d] dark:bg-[#161b22]">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0
                      dark:border-[#21262d]">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg
                           bg-violet-600/10 dark:bg-violet-500/[0.12]">
            <ClipboardList className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </span>
          <div>
            <p className="text-[13.5px] font-semibold text-slate-800 leading-none tracking-tight
                          dark:text-[#e6edf3]">
              Mis Tareas
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-none dark:text-[#545d68]">
              Microsoft Planner · Pendientes de atención
            </p>
          </div>
        </div>
        {!isEmpty && (
          <span className="rounded-full bg-violet-50 border border-violet-100 px-2.5 py-0.5
                           text-[11px] font-semibold text-violet-600 tabular-nums
                           dark:bg-violet-500/[0.12] dark:border-violet-500/20 dark:text-violet-400">
            {tasks.length}
          </span>
        )}
      </div>

      {/* ── Resumen de prioridades ────────────────────────────────── */}
      {!isEmpty && (
        <div className="flex items-center gap-4 px-5 py-2.5 border-b border-slate-100 bg-slate-50/50 shrink-0
                        dark:border-[#21262d] dark:bg-[#1c2128]/50">
          {counts.alta > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                {counts.alta} alta{counts.alta > 1 ? "s" : ""}
              </span>
            </div>
          )}
          {counts.media > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                {counts.media} media{counts.media > 1 ? "s" : ""}
              </span>
            </div>
          )}
          {counts.baja > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                {counts.baja} baja{counts.baja > 1 ? "s" : ""}
              </span>
            </div>
          )}
          <div className="ml-auto">
            <span className="text-[10px] text-slate-300 font-medium dark:text-[#444c56]">
              Última sync: hace 5 min
            </span>
          </div>
        </div>
      )}

      {/* ── Lista de tareas ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full
                            bg-slate-50 border border-slate-100
                            dark:bg-[#1c2128] dark:border-[#30363d]">
              <PartyPopper className="h-5 w-5 text-slate-300 dark:text-[#444c56]" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-500 dark:text-[#768390]">Todo al día</p>
              <p className="text-[11px] text-slate-300 mt-0.5 dark:text-[#444c56]">
                No tienes tareas pendientes en Planner
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-[#21262d]">
            {tasks.map((task) => {
              const p = PRIORITY_CONFIG[task.priority ?? "media"] ?? DEFAULT_PRIORITY;
              const s = STATUS_CONFIG[task.status     ?? "pendiente"] ?? DEFAULT_STATUS;
              const isExpanded = expandedId === task.id;
              const isUrgent = task.priority === "alta";

              return (
                <li key={task.id}>
                  {/* Fila de tarea */}
                  <button
                    onClick={() => toggle(task.id)}
                    className={cn(
                      "group relative w-full text-left flex items-center gap-3",
                      "px-5 py-3.5 transition-all duration-150",
                      p.rowHover,
                      isExpanded && "bg-slate-50/80 dark:bg-[#1c2128]/60"
                    )}
                  >
                    {/* Barra lateral (prioridad) */}
                    <span className={cn(
                      "absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full",
                      "transition-all duration-200",
                      isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-60",
                      p.bar
                    )} />

                    {/* Indicador de prioridad */}
                    <span className={cn("h-2 w-2 shrink-0 rounded-full ring-2 ring-white dark:ring-[#161b22]", p.dot)} />

                    {/* Contenido principal */}
                    <div className="min-w-0 flex-1">
                      <p className={cn(
                        "text-[13px] font-semibold leading-snug truncate",
                        isExpanded
                          ? "text-slate-900 dark:text-[#e6edf3]"
                          : "text-slate-800 dark:text-[#cdd9e5]"
                      )}>
                        {task.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2.5 flex-wrap">
                        {/* Vencimiento */}
                        <span className={cn(
                          "flex items-center gap-1 text-[11px]",
                          isUrgent
                            ? "text-rose-500 dark:text-rose-400 font-medium"
                            : "text-slate-400 dark:text-[#545d68]"
                        )}>
                          <Clock className="h-3 w-3" />
                          Vence {fmtFecha(task.due)}
                        </span>

                        {/* Estado (si no es pendiente) */}
                        {task.status && task.status !== "pendiente" && (
                          <span className={cn(
                            "flex items-center gap-1 text-[10.5px] font-medium",
                            s.text
                          )}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
                            {s.label}
                          </span>
                        )}

                        {/* Planner / sistema origen */}
                        {task.plannerUrl ? (
                          <span className="flex items-center gap-1 text-[10.5px] font-medium text-[#5b5ea6] dark:text-violet-400">
                            <PlannerIcon className="h-3 w-3" />
                            Planner
                          </span>
                        ) : task.sourceSystem ? (
                          <span className="text-[10.5px] font-medium text-violet-400 dark:text-violet-500">
                            {task.sourceSystem}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Badge prioridad */}
                    <span className={cn(
                      "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                      p.badge
                    )}>
                      {p.label}
                    </span>

                    {/* Chevron */}
                    <ChevronDown className={cn(
                      "h-3.5 w-3.5 shrink-0 transition-all duration-200",
                      isExpanded
                        ? "rotate-180 text-slate-500 dark:text-[#768390]"
                        : "text-slate-300 group-hover:text-slate-400 dark:text-[#444c56] dark:group-hover:text-[#545d68]"
                    )} />
                  </button>

                  {/* Panel de detalle (inline expandible) */}
                  {isExpanded && <TaskDetailPanel task={task} />}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────────────── */}
      {!isEmpty && (
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-slate-100 bg-slate-50/50 shrink-0
                        dark:border-[#21262d] dark:bg-[#1c2128]/50">
          <span className="text-[11px] text-slate-400 dark:text-[#545d68]">
            {tasks.filter((t) => t.status === "completada").length} completadas hoy
          </span>
          <button className="inline-flex items-center gap-1 text-[11px] font-medium
                             text-violet-500 hover:text-violet-700 transition-colors
                             dark:text-violet-400 dark:hover:text-violet-300">
            Ver todas en Planner
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}