"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  X, Hash, User, Building2, Calendar, AlertCircle, FileText,
  MessageSquare, Paperclip, Clock, Send, Download, Tag, ExternalLink,
} from "lucide-react";

import {
  DEPARTMENTS,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  buildDetail,
  type RequestStatus,
  type TicketDetail,
} from "@/app/(protected)/(intranet)/requests/data/tickets";
import { useTickets } from "@/app/(protected)/(intranet)/requests/hooks/useTickets";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

type ModalTab = "details" | "comments" | "attachments" | "timeline";

const MODAL_TABS: { id: ModalTab; label: string; icon: React.ReactNode; countKey?: keyof TicketDetail }[] = [
  { id: "details",     label: "Detalles",    icon: <FileText      className="h-3.5 w-3.5" /> },
  { id: "comments",    label: "Comentarios", icon: <MessageSquare className="h-3.5 w-3.5" />, countKey: "comments"    },
  { id: "attachments", label: "Adjuntos",    icon: <Paperclip     className="h-3.5 w-3.5" />, countKey: "attachments" },
  { id: "timeline",    label: "Historial",   icon: <Clock         className="h-3.5 w-3.5" />, countKey: "timeline"    },
];

function MetaRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-slate-100 dark:border-[#21262d]">
      <span className="text-slate-400 dark:text-[#545d68] mt-px shrink-0">{icon}</span>
      <span className="text-[10.5px] font-semibold text-slate-400 dark:text-[#545d68] uppercase tracking-[0.4px] w-20 shrink-0 mt-0.5">
        {label}
      </span>
      <span className="text-[12.5px] font-medium text-slate-700 dark:text-[#cdd9e5]">{children}</span>
    </div>
  );
}

function AvatarBubble({ initials, color, size = 30 }: { initials: string; color: string; size?: number }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: "50%",
      background: color + "20", color,
      flexShrink: 0, fontSize: size * 0.35, fontWeight: 700,
      display: "flex", alignItems: "center", justifyContent: "center",
      border: `1.5px solid ${color}40`,
    }}>
      {initials}
    </span>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-9 text-slate-400 dark:text-[#545d68] text-[13px]">
      <FileText className="mx-auto mb-2 opacity-35 w-7 h-7" />{label}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODAL
// ═══════════════════════════════════════════════════════════════════════════════

function TicketDetailModal({
  ticket,
  onClose,
  onViewFull,
}: {
  ticket:     TicketDetail;
  onClose:    () => void;
  onViewFull: () => void;
}) {
  const [tab,     setTab]     = useState<ModalTab>("details");
  const [comment, setComment] = useState("");
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted) requestAnimationFrame(() => setVisible(true)); }, [mounted]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function handleClose()    { setVisible(false); setTimeout(onClose,    220); }
  function handleViewFull() { setVisible(false); setTimeout(onViewFull, 220); }

  const cfg = STATUS_CONFIG[ticket.status];

  const modalJsx = (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center p-4",
        "transition-all duration-[220ms] ease-out",
        visible
          ? "bg-slate-900/50 backdrop-blur-[4px]"
          : "bg-slate-900/0 backdrop-blur-0"
      )}
    >
      <div className={cn(
        "w-full max-w-[700px] rounded-[20px] overflow-hidden flex flex-col",
        "max-h-[90vh]",
        // Light
        "bg-white shadow-[0_24px_64px_rgba(0,0,0,0.18),0_4px_12px_rgba(0,0,0,0.08)]",
        // Dark
        "dark:bg-[#161b22] dark:shadow-[0_24px_64px_rgba(0,0,0,0.5)]",
        "transition-[opacity,transform] duration-[220ms] [transition-timing-function:cubic-bezier(0.22,0.68,0,1.2)]",
        visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-[0.97]",
      )}>

        {/* Violet gradient accent */}
        <div className="h-[3px] w-full bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-500 shrink-0" />

        <div className="overflow-y-auto flex-1">
          <div className="px-6 pt-5 pb-0">

            {/* Top row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="flex items-center gap-1 px-2.5 py-[3px] rounded-full
                                 bg-violet-50 text-violet-700 text-[11px] font-bold
                                 dark:bg-violet-500/[0.12] dark:text-violet-400">
                  <Hash className="h-3 w-3" />{ticket.ticketNumber}
                </span>
                <span className="px-2.5 py-[3px] rounded-full border text-[11px] font-semibold
                                 bg-slate-50 border-slate-200 text-slate-600
                                 dark:bg-[#1c2128] dark:border-[#30363d] dark:text-[#768390]">
                  {ticket.departmentLabel}
                </span>
                <span className="px-2.5 py-[3px] rounded-full border text-[11px] font-semibold
                                 bg-slate-50 border-slate-200 text-slate-600
                                 dark:bg-[#1c2128] dark:border-[#30363d] dark:text-[#768390]">
                  {ticket.category}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
                      style={{ background: cfg.bg, color: cfg.color }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                  {cfg.label}
                </span>
                <button
                  onClick={handleClose}
                  className="w-[30px] h-[30px] rounded-lg flex items-center justify-center transition-colors
                             border border-slate-200 text-slate-400 bg-transparent
                             hover:bg-slate-100 hover:text-slate-600
                             dark:border-[#30363d] dark:text-[#545d68] dark:hover:bg-[#21262d] dark:hover:text-[#adbac7]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <h2 className="m-0 mb-1.5 text-[16.5px] font-bold leading-snug
                           text-slate-900 dark:text-[#e6edf3]">
              {ticket.title}
            </h2>
            <p className="m-0 mb-2.5 text-[13px] leading-relaxed text-slate-500 dark:text-[#768390]">
              {ticket.description}
            </p>

            {/* Tags */}
            {ticket.tags && ticket.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {ticket.tags.filter(Boolean).map((t) => (
                  <span key={t} className="flex items-center gap-1 px-2.5 py-[2px] rounded-full text-[10.5px] font-semibold
                                           bg-violet-50 text-violet-700
                                           dark:bg-violet-500/[0.12] dark:text-violet-400">
                    <Tag className="h-2.5 w-2.5" />{t}
                  </span>
                ))}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-0.5 border-b border-slate-100 dark:border-[#21262d]">
              {MODAL_TABS.map((t) => {
                const isActive = tab === t.id;
                const count    = t.countKey ? (ticket[t.countKey] as unknown[]).length : null;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 border-b-2 text-[12px] font-medium cursor-pointer",
                      "whitespace-nowrap -mb-px transition-all duration-150",
                      isActive
                        ? "border-violet-600 text-violet-600 font-bold dark:text-violet-400 dark:border-violet-400"
                        : "border-transparent text-slate-500 hover:text-slate-700 dark:text-[#545d68] dark:hover:text-[#768390]"
                    )}
                  >
                    {t.icon}{t.label}
                    {count !== null && (
                      <span className={cn(
                        "min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 text-[10px] font-bold",
                        isActive
                          ? "bg-violet-600 text-white dark:bg-violet-500"
                          : "bg-slate-200 text-slate-500 dark:bg-[#30363d] dark:text-[#768390]"
                      )}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab content */}
          <div className="px-6 py-[18px] min-h-[200px]">

            {tab === "details" && (
              <div className="grid grid-cols-2 gap-x-8">
                <div>
                  <MetaRow icon={<User className="h-3.5 w-3.5" />} label="Solicitante">{ticket.requester}</MetaRow>
                  <MetaRow icon={<Building2 className="h-3.5 w-3.5" />} label="Área">{ticket.departmentLabel}</MetaRow>
                  <MetaRow icon={<FileText className="h-3.5 w-3.5" />} label="Categoría">{ticket.category}</MetaRow>
                </div>
                <div>
                  <MetaRow icon={<User className="h-3.5 w-3.5" />} label="Asignado a">
                    {ticket.assignee ?? (
                      <span className="text-slate-400 dark:text-[#545d68] italic">Sin asignar</span>
                    )}
                  </MetaRow>
                  <MetaRow icon={<Calendar className="h-3.5 w-3.5" />} label="Creado">
                    {new Date(ticket.date).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}
                  </MetaRow>
                  <MetaRow icon={<AlertCircle className="h-3.5 w-3.5" />} label="Vencimiento">
                    {ticket.dueDate
                      ? new Date(ticket.dueDate).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })
                      : <span className="text-slate-400 dark:text-[#545d68] italic">Sin fecha</span>}
                  </MetaRow>
                </div>
              </div>
            )}

            {tab === "comments" && (
              <div>
                <div className="flex flex-col gap-3.5 mb-[18px]">
                  {ticket.comments.length === 0 ? (
                    <EmptyState label="Sin comentarios aún" />
                  ) : ticket.comments.map((c, i) => (
                    <div key={c.id} className="flex gap-2.5" style={{ animation: `fadeSlideUp .22s ease ${i * 60}ms both` }}>
                      <AvatarBubble initials={c.initials} color={c.color} />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[12.5px] font-bold text-slate-800 dark:text-[#e6edf3]">{c.author}</span>
                          <span className="text-[10.5px] text-slate-400 dark:text-[#545d68]">{c.date}</span>
                        </div>
                        <div className="px-3 py-2 rounded-[10px] text-[12.5px] leading-relaxed
                                        bg-slate-50 border border-slate-100 text-slate-600
                                        dark:bg-[#1c2128] dark:border-[#30363d] dark:text-[#adbac7]">
                          {c.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Composer */}
                <div className="flex gap-2 items-end p-2.5 rounded-[10px] transition-colors
                                border border-slate-200 bg-slate-50
                                dark:border-[#30363d] dark:bg-[#1c2128]
                                focus-within:border-violet-400 dark:focus-within:border-violet-500/50">
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Escribe un comentario…"
                    rows={2}
                    className="flex-1 border-none bg-transparent outline-none resize-none text-[12.5px] leading-relaxed
                               text-slate-700 placeholder:text-slate-400
                               dark:text-[#cdd9e5] dark:placeholder:text-[#545d68]"
                  />
                  <button
                    disabled={!comment.trim()}
                    className={cn(
                      "w-8 h-8 rounded-lg shrink-0 flex items-center justify-center transition-all",
                      comment.trim()
                        ? "bg-gradient-to-br from-violet-600 to-violet-700 text-white cursor-pointer"
                        : "bg-slate-200 text-slate-400 cursor-default dark:bg-[#30363d] dark:text-[#545d68]"
                    )}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {tab === "attachments" && (
              <div className="flex flex-col gap-2">
                {ticket.attachments.length === 0 ? (
                  <EmptyState label="Sin adjuntos" />
                ) : ticket.attachments.map((a, i) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-[10px] cursor-pointer transition-colors
                               border border-slate-100 bg-slate-50 hover:border-violet-200
                               dark:border-[#30363d] dark:bg-[#1c2128] dark:hover:border-violet-500/40"
                    style={{ animation: `fadeSlideUp .22s ease ${i * 60}ms both` }}
                  >
                    <span className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center
                                     text-[9px] font-extrabold tracking-[0.5px]
                                     bg-violet-50 border border-violet-200 text-violet-700
                                     dark:bg-violet-500/[0.12] dark:border-violet-500/25 dark:text-violet-400">
                      {a.ext}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="m-0 text-[12.5px] font-semibold truncate
                                    text-slate-800 dark:text-[#e6edf3]">{a.name}</p>
                      <p className="m-0 text-[11px] text-slate-400 dark:text-[#545d68]">{a.size}</p>
                    </div>
                    <button className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center transition-all
                                       border border-slate-200 bg-transparent text-slate-400
                                       hover:bg-violet-50 hover:border-violet-400 hover:text-violet-600
                                       dark:border-[#30363d] dark:text-[#545d68] dark:hover:bg-violet-500/[0.12] dark:hover:border-violet-500/50 dark:hover:text-violet-400">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {tab === "timeline" && (
              <div className="relative pl-[22px]">
                <div className="absolute left-[7px] top-2 bottom-2 w-[1.5px] rounded-sm
                                bg-slate-200 dark:bg-[#30363d]" />
                <div className="flex flex-col">
                  {ticket.timeline.map((ev, i) => (
                    <div
                      key={ev.id}
                      className={cn("relative", i < ticket.timeline.length - 1 && "pb-4")}
                      style={{ animation: `fadeSlideUp .22s ease ${i * 70}ms both` }}
                    >
                      <span className={cn(
                        "absolute -left-[18px] top-1 w-2.5 h-2.5 rounded-full z-[1]",
                        i === 0
                          ? "bg-violet-100 border-2 border-violet-300 dark:bg-violet-500/20 dark:border-violet-500/50"
                          : "bg-slate-100 border-2 border-slate-200 dark:bg-[#21262d] dark:border-[#30363d]"
                      )} />
                      <p className="m-0 mb-px text-[12.5px] font-semibold
                                    text-slate-800 dark:text-[#e6edf3]">{ev.label}</p>
                      <p className="m-0 text-[11px] text-slate-400 dark:text-[#545d68]">
                        {ev.by} · {ev.date}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-3 flex items-center justify-between shrink-0
                        border-slate-100 bg-white
                        dark:border-[#21262d] dark:bg-[#161b22]">
          <span className="text-[11px] text-slate-400 dark:text-[#545d68]">
            {new Date(ticket.date).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-colors
                         border border-slate-200 bg-transparent text-slate-600
                         hover:bg-slate-50
                         dark:border-[#30363d] dark:text-[#768390] dark:hover:bg-[#21262d]"
            >
              Cerrar
            </button>
            <button
              onClick={handleViewFull}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-semibold
                         bg-gradient-to-br from-violet-600 to-violet-700 text-white
                         transition-opacity hover:opacity-90"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Ver detalle completo
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalJsx, document.body);
}

// ═══════════════════════════════════════════════════════════════════════════════
// REQUESTS PANEL
// ═══════════════════════════════════════════════════════════════════════════════

export function RequestsPanel() {
  const router = useRouter();
  const [activeTab,    setActiveTab]    = useState<string>("all");
  const [activeStatus, setActiveStatus] = useState<RequestStatus | "all">("all");
  const [selected,     setSelected]     = useState<TicketDetail | null>(null);

  const { tickets, loading, error } = useTickets();

  const allDepts = [{ id: "all", label: "Todas" }, ...DEPARTMENTS.filter((d) => d.show)];

  const filtered = tickets.filter((r) => {
    const deptMatch   = activeTab    === "all" || r.departmentId === activeTab;
    const statusMatch = activeStatus === "all" || r.status       === activeStatus;
    return deptMatch && statusMatch;
  });

  const countByDept = (id: string) =>
    id === "all" ? tickets.length : tickets.filter((r) => r.departmentId === id).length;

  const handleTabsMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.style.cursor = "grabbing";
    const startX = e.pageX - el.offsetLeft;
    const scrollLeft = el.scrollLeft;
    const onMove = (ev: MouseEvent) => { el.scrollLeft = scrollLeft - (ev.pageX - el.offsetLeft - startX); };
    const onUp   = () => { el.style.cursor = "grab"; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <>
      <section className="rounded-2xl overflow-hidden
                          bg-white border border-slate-200 shadow-sm
                          dark:bg-[#161b22] dark:border-[#30363d]">

        {/* ── Header ── */}
        <div className="px-6 pt-5 pb-0 border-b border-slate-100 dark:border-[#21262d]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-violet-600 to-violet-700
                               flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                  <rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
                </svg>
              </span>
              <div>
                <h2 className="m-0 text-[15px] font-bold leading-tight
                               text-slate-900 dark:text-[#e6edf3]">
                  Mis Solicitudes
                </h2>
                <p className="m-0 text-[12px] mt-px text-slate-400 dark:text-[#545d68]">
                  {filtered.length} solicitud{filtered.length !== 1 ? "es" : ""} encontrada{filtered.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Status pills */}
            <div className="flex gap-1.5 flex-wrap justify-end">
              {(["all", "pending", "in_progress", "resolved", "rejected"] as const).map((s) => {
                const isAll  = s === "all";
                const cfg    = isAll ? null : STATUS_CONFIG[s];
                const active = activeStatus === s;
                return (
                  <button
                    key={s}
                    onClick={() => setActiveStatus(s)}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all",
                      "border",
                      active
                        ? "border-current"
                        : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-[#30363d] dark:text-[#545d68] dark:hover:border-[#444c56]"
                    )}
                    style={active ? { background: cfg?.bg ?? "#f1f5f9", color: cfg?.color ?? "#334155", borderColor: cfg?.color ?? "#334155" } : {}}
                  >
                    {!isAll && <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg!.dot }} />}
                    {isAll ? "Todos" : cfg!.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dept tabs — drag to scroll */}
          <div
            className="flex gap-0.5 overflow-x-auto [scrollbar-width:none] select-none"
            style={{ cursor: "grab" }}
            onMouseDown={handleTabsMouseDown}
          >
            {allDepts.map((dept) => {
              const count  = countByDept(dept.id);
              const active = activeTab === dept.id;
              return (
                <button
                  key={dept.id}
                  onClick={() => setActiveTab(dept.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-2 border-b-2 whitespace-nowrap shrink-0",
                    "text-[12.5px] -mb-px transition-all duration-150",
                    active
                      ? "border-violet-600 text-violet-600 font-bold dark:border-violet-400 dark:text-violet-400"
                      : "border-transparent text-slate-500 font-medium hover:text-slate-700 dark:text-[#545d68] dark:hover:text-[#768390]"
                  )}
                >
                  {dept.label}
                  <span className={cn(
                    "min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 text-[10px] font-bold",
                    active
                      ? "bg-violet-600 text-white dark:bg-violet-500"
                      : "bg-slate-200 text-slate-500 dark:bg-[#30363d] dark:text-[#768390]"
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── List ── */}
        <div className="px-4 pt-3 pb-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-7 h-7 rounded-full border-[2.5px] border-violet-200 border-t-violet-600
                              animate-spin dark:border-violet-900 dark:border-t-violet-400" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-[13px] text-slate-400">
              <p className="text-rose-600 dark:text-rose-400 mb-2">Error al cargar solicitudes</p>
              <p className="text-[11.5px] text-slate-400 dark:text-[#545d68]">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-[13px] text-slate-400 dark:text-[#545d68]">
              <svg className="mx-auto mb-3 opacity-40" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              No hay solicitudes para este filtro
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((req) => {
                const cfg  = STATUS_CONFIG[req.status];
                const pcfg = PRIORITY_CONFIG[req.priority];
                const dept = DEPARTMENTS.find((d) => d.id === req.departmentId);
                return (
                  <div
                    key={req.id}
                    onClick={() => setSelected(buildDetail(req))}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === "Enter" && setSelected(buildDetail(req))}
                    className="grid gap-3 px-3.5 py-3 rounded-[10px] cursor-pointer transition-all duration-150
                               border border-slate-100 bg-slate-50
                               hover:border-violet-200 hover:bg-white hover:shadow-[0_2px_8px_rgba(124,58,237,0.07)]
                               dark:border-[#30363d] dark:bg-[#1c2128]
                               dark:hover:border-violet-500/40 dark:hover:bg-[#21262d]"
                    style={{ gridTemplateColumns: "1fr auto" }}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-[3px] flex-wrap">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: pcfg.dot }} title={`Prioridad: ${pcfg.label}`} />
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-[#545d68] tracking-[0.4px]">
                          {req.ticketNumber}
                        </span>
                        <span className="w-[3px] h-[3px] rounded-full bg-slate-300 dark:bg-[#444c56]" />
                        <span className="text-[10px] font-semibold px-1.5 py-px rounded-full
                                         bg-violet-50 text-violet-600
                                         dark:bg-violet-500/[0.12] dark:text-violet-400">
                          {dept?.label ?? req.departmentId}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 dark:text-[#545d68]">{req.category}</span>
                      </div>
                      <p className="m-0 text-[13px] font-semibold truncate text-slate-800 dark:text-[#e6edf3]">
                        {req.title}
                      </p>
                      <p className="m-0 mt-0.5 text-[11.5px] truncate text-slate-400 dark:text-[#545d68]">
                        {req.description}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span
                        className="flex items-center gap-1 px-2.5 py-[3px] rounded-full text-[10.5px] font-bold"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        <span className="w-[5px] h-[5px] rounded-full" style={{ background: cfg.dot }} />
                        {cfg.label}
                      </span>
                      <span className="text-[10.5px] font-medium text-slate-400 dark:text-[#545d68]">
                        {new Date(req.date).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {selected && (
        <TicketDetailModal
          ticket={selected}
          onClose={() => setSelected(null)}
          onViewFull={() => {
            const id = selected.id;
            router.push(`/requests/${id}`);
          }}
        />
      )}
    </>
  );
}