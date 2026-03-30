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

// ═══════════════════════════════════════════════════════════════════════════════
// MODAL
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
    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "8px 0", borderBottom: "1px solid #f1f3f6" }}>
      <span style={{ color: "#94a3b8", marginTop: "1px", flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: "10.5px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".4px", width: "80px", flexShrink: 0, marginTop: "2px" }}>{label}</span>
      <span style={{ fontSize: "12.5px", fontWeight: 500, color: "#1e293b" }}>{children}</span>
    </div>
  );
}

function AvatarBubble({ initials, color, size = 30 }: { initials: string; color: string; size?: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: "50%", background: color + "20", color, flexShrink: 0, fontSize: size * 0.35, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${color}40` }}>
      {initials}
    </span>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div style={{ textAlign: "center", padding: "36px 0", color: "#94a3b8", fontSize: "13px" }}>
      <FileText style={{ margin: "0 auto 8px", opacity: .35, width: 28, height: 28 }} />{label}
    </div>
  );
}

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

  // Ambas funciones respetan la animación de salida (220 ms)
  function handleClose()    { setVisible(false); setTimeout(onClose,    220); }
  function handleViewFull() { setVisible(false); setTimeout(onViewFull, 220); }

  const cfg = STATUS_CONFIG[ticket.status];

  const modalJsx = (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
        background: visible ? "rgba(15,23,42,.5)" : "rgba(15,23,42,0)",
        backdropFilter: visible ? "blur(4px)" : "blur(0px)",
        transition: "background .22s ease, backdrop-filter .22s ease",
      }}
    >
      <div style={{
        width: "100%", maxWidth: "700px", background: "#fff", borderRadius: "20px",
        boxShadow: "0 24px 64px rgba(0,0,0,.18), 0 4px 12px rgba(0,0,0,.08)", overflow: "hidden",
        fontFamily: "'DM Sans','Plus Jakarta Sans',ui-sans-serif,system-ui,sans-serif",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
        transition: "opacity .22s cubic-bezier(.22,.68,0,1.2), transform .22s cubic-bezier(.22,.68,0,1.2)",
        maxHeight: "90vh", display: "flex", flexDirection: "column",
      }}>

        {/* Violet gradient accent */}
        <div style={{ height: "3px", background: "linear-gradient(90deg,#7c3aed,#6d28d9,#4f46e5)", flexShrink: 0 }} />

        <div style={{ overflowY: "auto", flex: 1 }}>
          <div style={{ padding: "20px 24px 0" }}>

            {/* Top row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "20px", background: "#ede9fe", color: "#6d28d9", fontSize: "11px", fontWeight: 700 }}>
                  <Hash className="h-3 w-3" />{ticket.ticketNumber}
                </span>
                <span style={{ padding: "3px 10px", borderRadius: "20px", background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", fontSize: "11px", fontWeight: 600 }}>
                  {ticket.departmentLabel}
                </span>
                <span style={{ padding: "3px 10px", borderRadius: "20px", background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", fontSize: "11px", fontWeight: 600 }}>
                  {ticket.category}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 12px", borderRadius: "20px", background: cfg.bg, color: cfg.color, fontSize: "11px", fontWeight: 700 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />{cfg.label}
                </span>
                <button onClick={handleClose}
                  style={{ width: 30, height: 30, borderRadius: "8px", border: "1.5px solid #e2e8f0", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", transition: "all .15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f1f5f9")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <h2 style={{ margin: "0 0 6px", fontSize: "16.5px", fontWeight: 700, color: "#0f172a", lineHeight: 1.3 }}>{ticket.title}</h2>
            <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#64748b", lineHeight: 1.65 }}>{ticket.description}</p>

            {/* Tags */}
            {ticket.tags && ticket.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "16px" }}>
                {ticket.tags.filter(Boolean).map((t) => (
                  <span key={t} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "2px 9px", borderRadius: "20px", background: "#ede9fe", color: "#6d28d9", fontSize: "10.5px", fontWeight: 600 }}>
                    <Tag className="h-2.5 w-2.5" />{t}
                  </span>
                ))}
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: "flex", gap: "2px", borderBottom: "1px solid #f1f3f6" }}>
              {MODAL_TABS.map((t) => {
                const isActive = tab === t.id;
                const count    = t.countKey ? (ticket[t.countKey] as unknown[]).length : null;
                return (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 12px", border: "none", background: "transparent",
                      borderBottom: isActive ? "2px solid #7c3aed" : "2px solid transparent",
                      color: isActive ? "#7c3aed" : "#64748b", fontSize: "12px", fontWeight: isActive ? 700 : 500,
                      cursor: "pointer", whiteSpace: "nowrap", marginBottom: "-1px", transition: "all .15s" }}>
                    {t.icon}{t.label}
                    {count !== null && (
                      <span style={{ minWidth: 18, height: 18, borderRadius: "9px", background: isActive ? "#7c3aed" : "#e2e8f0", color: isActive ? "#fff" : "#64748b", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab content */}
          <div style={{ padding: "18px 24px", minHeight: "200px" }}>

            {tab === "details" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
                <div>
                  <MetaRow icon={<User className="h-3.5 w-3.5" />} label="Solicitante">{ticket.requester}</MetaRow>
                  <MetaRow icon={<Building2 className="h-3.5 w-3.5" />} label="Área">{ticket.departmentLabel}</MetaRow>
                  <MetaRow icon={<FileText className="h-3.5 w-3.5" />} label="Categoría">{ticket.category}</MetaRow>
                </div>
                <div>
                  <MetaRow icon={<User className="h-3.5 w-3.5" />} label="Asignado a">
                    {ticket.assignee ?? <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Sin asignar</span>}
                  </MetaRow>
                  <MetaRow icon={<Calendar className="h-3.5 w-3.5" />} label="Creado">
                    {new Date(ticket.date).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}
                  </MetaRow>
                  <MetaRow icon={<AlertCircle className="h-3.5 w-3.5" />} label="Vencimiento">
                    {ticket.dueDate
                      ? new Date(ticket.dueDate).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })
                      : <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Sin fecha</span>}
                  </MetaRow>
                </div>
              </div>
            )}

            {tab === "comments" && (
              <div>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "18px" }}>
                  {ticket.comments.length === 0 ? <EmptyState label="Sin comentarios aún" /> :
                    ticket.comments.map((c, i) => (
                      <div key={c.id} style={{ display: "flex", gap: "10px", animation: `fadeSlideUp .22s ease ${i * 60}ms both` }}>
                        <AvatarBubble initials={c.initials} color={c.color} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "4px" }}>
                            <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#1e293b" }}>{c.author}</span>
                            <span style={{ fontSize: "10.5px", color: "#94a3b8" }}>{c.date}</span>
                          </div>
                          <div style={{ padding: "9px 12px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #f1f3f6", fontSize: "12.5px", color: "#334155", lineHeight: 1.6 }}>
                            {c.message}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-end", padding: "10px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "#fafbfc", transition: "border-color .15s" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#7c3aed")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#e2e8f0")}>
                  <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Escribe un comentario…" rows={2}
                    style={{ flex: 1, border: "none", background: "transparent", outline: "none", resize: "none", fontSize: "12.5px", color: "#334155", fontFamily: "inherit", lineHeight: 1.5 }} />
                  <button disabled={!comment.trim()}
                    style={{ width: 32, height: 32, borderRadius: "8px", border: "none", background: comment.trim() ? "linear-gradient(135deg,#7c3aed,#6d28d9)" : "#e2e8f0", color: comment.trim() ? "#fff" : "#94a3b8", cursor: comment.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}>
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {tab === "attachments" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {ticket.attachments.length === 0 ? <EmptyState label="Sin adjuntos" /> :
                  ticket.attachments.map((a, i) => (
                    <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", border: "1px solid #f1f3f6", background: "#fafbfc", cursor: "pointer", transition: "border-color .15s", animation: `fadeSlideUp .22s ease ${i * 60}ms both` }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "#c4b5fd"}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "#f1f3f6"}>
                      <span style={{ width: 36, height: 36, borderRadius: "8px", background: "#ede9fe", color: "#6d28d9", fontSize: "9px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid #ddd6fe", letterSpacing: ".5px" }}>{a.ext}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: "12.5px", fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</p>
                        <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>{a.size}</p>
                      </div>
                      <button style={{ width: 28, height: 28, borderRadius: "7px", border: "1.5px solid #e2e8f0", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", flexShrink: 0, transition: "all .15s" }}
                        onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "#ede9fe"; b.style.borderColor = "#7c3aed"; b.style.color = "#7c3aed"; }}
                        onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "transparent"; b.style.borderColor = "#e2e8f0"; b.style.color = "#94a3b8"; }}>
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
              </div>
            )}

            {tab === "timeline" && (
              <div style={{ position: "relative", paddingLeft: "22px" }}>
                <div style={{ position: "absolute", left: "7px", top: "8px", bottom: "8px", width: "1.5px", background: "#e2e8f0", borderRadius: "1px" }} />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {ticket.timeline.map((ev, i) => (
                    <div key={ev.id} style={{ position: "relative", paddingBottom: i < ticket.timeline.length - 1 ? "16px" : "0", animation: `fadeSlideUp .22s ease ${i * 70}ms both` }}>
                      <span style={{ position: "absolute", left: "-18px", top: "4px", width: "10px", height: "10px", borderRadius: "50%", background: i === 0 ? "#ede9fe" : "#e2e8f0", border: `2px solid ${i === 0 ? "#c4b5fd" : "#f1f5f9"}`, zIndex: 1, display: "block" }} />
                      <p style={{ margin: "0 0 1px", fontSize: "12.5px", fontWeight: 600, color: "#1e293b" }}>{ev.label}</p>
                      <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>{ev.by} · {ev.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #f1f3f6", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: "#fff" }}>
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>
            {new Date(ticket.date).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={handleClose}
              style={{ padding: "7px 16px", borderRadius: "8px", border: "1.5px solid #e2e8f0", background: "transparent", color: "#64748b", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              Cerrar
            </button>
            <button onClick={handleViewFull}
              style={{ padding: "7px 16px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", transition: "opacity .15s" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = ".88")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
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

  // ── Fetch real desde la API ──────────────────────────────────────────────────
  // Cuando tengas sesión, pasa el userId del usuario autenticado:
  // const { tickets, loading, error } = useTickets({ userId: session.user.id });
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
      <section style={{
        background: "#ffffff", borderRadius: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,.07), 0 4px 16px rgba(0,0,0,.04)",
        overflow: "hidden",
        fontFamily: "'DM Sans','Plus Jakarta Sans',ui-sans-serif,system-ui,sans-serif",
      }}>
        {/* ── Header ── */}
        <div style={{ padding: "20px 24px 0", borderBottom: "1px solid #f1f3f6" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg,#7c3aed,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                  <rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
                </svg>
              </span>
              <div>
                <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>Mis Solicitudes</h2>
                <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", marginTop: "1px" }}>
                  {filtered.length} solicitud{filtered.length !== 1 ? "es" : ""} encontrada{filtered.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Status pills */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
              {(["all", "pending", "in_progress", "resolved", "rejected"] as const).map((s) => {
                const isAll  = s === "all";
                const cfg    = isAll ? null : STATUS_CONFIG[s];
                const active = activeStatus === s;
                return (
                  <button key={s} onClick={() => setActiveStatus(s)}
                    style={{ padding: "4px 10px", borderRadius: "20px",
                      border: active ? `1.5px solid ${cfg?.color ?? "#334155"}` : "1.5px solid #e2e8f0",
                      background: active ? (cfg?.bg ?? "#f1f5f9") : "transparent",
                      color: active ? (cfg?.color ?? "#334155") : "#64748b",
                      fontSize: "11px", fontWeight: 600, cursor: "pointer", transition: "all .15s",
                      display: "flex", alignItems: "center", gap: "4px" }}>
                    {!isAll && <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg!.dot }} />}
                    {isAll ? "Todos" : cfg!.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dept tabs — drag to scroll */}
          <div style={{ display: "flex", gap: "2px", overflowX: "auto", scrollbarWidth: "none", cursor: "grab", userSelect: "none" }}
            onMouseDown={handleTabsMouseDown}>
            {allDepts.map((dept) => {
              const count  = countByDept(dept.id);
              const active = activeTab === dept.id;
              return (
                <button key={dept.id} onClick={() => setActiveTab(dept.id)}
                  style={{ padding: "8px 14px", border: "none", background: "transparent",
                    borderBottom: active ? "2px solid #7c3aed" : "2px solid transparent",
                    color: active ? "#7c3aed" : "#64748b",
                    fontSize: "12.5px", fontWeight: active ? 700 : 500, cursor: "pointer",
                    whiteSpace: "nowrap", flexShrink: 0, transition: "all .15s",
                    display: "flex", alignItems: "center", gap: "5px" }}>
                  {dept.label}
                  <span style={{ minWidth: "18px", height: "18px", borderRadius: "9px", background: active ? "#7c3aed" : "#e2e8f0", color: active ? "#fff" : "#64748b", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── List ── */}
        <div style={{ padding: "12px 16px 16px" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2.5px solid #ddd6fe", borderTopColor: "#7c3aed", animation: "spin .7s linear infinite" }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "48px 24px", color: "#94a3b8", fontSize: "13px" }}>
              <p style={{ color: "#b91c1c", marginBottom: 8 }}>Error al cargar solicitudes</p>
              <p style={{ fontSize: "11.5px" }}>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", color: "#94a3b8", fontSize: "13px" }}>
              <svg style={{ margin: "0 auto 12px", display: "block", opacity: .4 }} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              No hay solicitudes para este filtro
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filtered.map((req) => {
                const cfg  = STATUS_CONFIG[req.status];
                const pcfg = PRIORITY_CONFIG[req.priority];
                const dept = DEPARTMENTS.find((d) => d.id === req.departmentId);
                return (
                  <div key={req.id} onClick={() => setSelected(buildDetail(req))} role="button" tabIndex={0}
                    onKeyDown={e => e.key === "Enter" && setSelected(buildDetail(req))}
                    style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: "12px", padding: "12px 14px", borderRadius: "10px", border: "1px solid #f1f3f6", background: "#fafbfc", cursor: "pointer", transition: "border-color .15s, box-shadow .15s, background .15s" }}
                    onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.borderColor = "#ddd6fe"; d.style.boxShadow = "0 2px 8px rgba(124,58,237,.07)"; d.style.background = "#fff"; }}
                    onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.borderColor = "#f1f3f6"; d.style.boxShadow = "none"; d.style.background = "#fafbfc"; }}>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: pcfg.dot, flexShrink: 0 }} title={`Prioridad: ${pcfg.label}`} />
                        <span style={{ fontSize: "10px", fontWeight: 600, color: "#94a3b8", letterSpacing: ".4px" }}>{req.ticketNumber}</span>
                        <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#cbd5e1" }} />
                        <span style={{ fontSize: "10px", fontWeight: 600, color: "#7c3aed", background: "#ede9fe", padding: "1px 7px", borderRadius: "20px" }}>
                          {dept?.label ?? req.departmentId}
                        </span>
                        <span style={{ fontSize: "10px", fontWeight: 500, color: "#94a3b8" }}>{req.category}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {req.title}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {req.description}
                      </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
                      <span style={{ padding: "3px 10px", borderRadius: "20px", background: cfg.bg, color: cfg.color, fontSize: "10.5px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot }} />{cfg.label}
                      </span>
                      <span style={{ fontSize: "10.5px", color: "#b0bec5", fontWeight: 500 }}>
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

      {/* Modal — onViewFull navega a la página de detalle */}
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
