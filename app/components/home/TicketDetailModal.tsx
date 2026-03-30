"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/app/components/ui/Modal"; // ajusta la ruta a tu Modal
import {
  Clock,
  User,
  Building2,
  Hash,
  Paperclip,
  MessageSquare,
  Send,
  Download,
  Calendar,
  Tag,
  FileText,
  AlertCircle,
  CheckCircle2,
  Circle,
  Loader2,
  XCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type RequestStatus = "pending" | "in_progress" | "resolved" | "rejected";

type TimelineEvent = {
  id: string;
  type: "created" | "status_change" | "comment" | "attachment";
  label: string;
  by: string;
  date: string;
};

type Comment = {
  id: string;
  author: string;
  initials: string;
  color: string;
  message: string;
  date: string;
};

type Attachment = {
  id: string;
  name: string;
  size: string;
  ext: string;
};

export type TicketDetail = {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  departmentId: string;
  departmentLabel: string;
  status: RequestStatus;
  date: string;
  dueDate?: string;
  requester: string;
  assignee?: string;
  category?: string;
  tags?: string[];
  timeline: TimelineEvent[];
  comments: Comment[];
  attachments: Attachment[];
};

// ─── Status config (same tokens as RequestsPanel) ────────────────────────────

const STATUS_CONFIG: Record<
  RequestStatus,
  { label: string; color: string; bg: string; dot: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pendiente",
    color: "#b45309",
    bg: "#fef3c7",
    dot: "#f59e0b",
    icon: <Circle className="h-3 w-3" />,
  },
  in_progress: {
    label: "En proceso",
    color: "#1d4ed8",
    bg: "#dbeafe",
    dot: "#3b82f6",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  resolved: {
    label: "Resuelto",
    color: "#15803d",
    bg: "#dcfce7",
    dot: "#22c55e",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  rejected: {
    label: "Rechazado",
    color: "#b91c1c",
    bg: "#fee2e2",
    dot: "#ef4444",
    icon: <XCircle className="h-3 w-3" />,
  },
};

// ─── Mock ticket detail (reemplaza con fetch real) ────────────────────────────

export const MOCK_DETAIL: TicketDetail = {
  id: "1",
  ticketNumber: "TI-0041",
  title: "Instalación de software",
  description:
    "Se requiere instalación de Adobe Creative Cloud completo (Photoshop, Illustrator, Premiere Pro) para el equipo del área de Marketing. El equipo actualmente no cuenta con licencia activa y necesita las herramientas para la campaña Q3.",
  departmentId: "ti",
  departmentLabel: "Tecnología",
  status: "in_progress",
  date: "2025-06-10",
  dueDate: "2025-06-20",
  requester: "Laura Martínez",
  assignee: "Carlos Jiménez",
  category: "Software",
  tags: ["Adobe", "Licencias", "Marketing"],
  timeline: [
    { id: "t1", type: "created",       label: "Ticket creado",                        by: "Laura Martínez",  date: "10 jun · 9:14 am" },
    { id: "t2", type: "status_change", label: "Estado cambiado a En proceso",         by: "Carlos Jiménez",  date: "11 jun · 8:02 am" },
    { id: "t3", type: "comment",       label: "Comentario agregado",                  by: "Carlos Jiménez",  date: "11 jun · 8:05 am" },
    { id: "t4", type: "attachment",    label: "Adjunto: Licencia_Adobe_2025.pdf",     by: "Laura Martínez",  date: "12 jun · 2:31 pm" },
  ],
  comments: [
    {
      id: "c1",
      author: "Carlos Jiménez",
      initials: "CJ",
      color: "#2563eb",
      message: "Revisé el ticket. Estoy coordinando con el proveedor para la activación de la licencia. Espero tener novedades antes del miércoles.",
      date: "11 jun · 8:05 am",
    },
    {
      id: "c2",
      author: "Laura Martínez",
      initials: "LM",
      color: "#7c3aed",
      message: "Perfecto, adjunto la orden de compra aprobada por finanzas para agilizar el proceso.",
      date: "12 jun · 2:30 pm",
    },
  ],
  attachments: [
    { id: "a1", name: "Orden_de_compra_Adobe.pdf", size: "284 KB", ext: "PDF" },
    { id: "a2", name: "Licencia_Adobe_2025.pdf",   size: "118 KB", ext: "PDF" },
  ],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetaRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-slate-100 last:border-0">
      <span className="mt-0.5 text-slate-400 shrink-0">{icon}</span>
      <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider w-20 shrink-0 mt-0.5">
        {label}
      </span>
      <span className="text-[12.5px] text-slate-700 font-medium">{children}</span>
    </div>
  );
}

function Avatar({
  initials,
  color,
  size = 28,
}: {
  initials: string;
  color: string;
  size?: number;
}) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color + "20",
        color,
        fontSize: size * 0.35,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        border: `1.5px solid ${color}40`,
      }}
    >
      {initials}
    </span>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = "details" | "comments" | "attachments" | "timeline";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "details",     label: "Detalles",  icon: <FileText className="h-3.5 w-3.5" />    },
  { id: "comments",   label: "Comentarios", icon: <MessageSquare className="h-3.5 w-3.5" /> },
  { id: "attachments",label: "Adjuntos",  icon: <Paperclip className="h-3.5 w-3.5" />   },
  { id: "timeline",   label: "Historial", icon: <Clock className="h-3.5 w-3.5" />       },
];

// ─── Main component ───────────────────────────────────────────────────────────

interface TicketDetailModalProps {
  open: boolean;
  onClose: () => void;
  ticket: TicketDetail;
}

export function TicketDetailModal({ open, onClose, ticket }: TicketDetailModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("details");
  const [comment, setComment] = useState("");
  const [animateIn, setAnimateIn] = useState(false);

  const cfg = STATUS_CONFIG[ticket.status];

  // Trigger entry animation whenever modal opens
useEffect(() => {
  if (!open) return;
  setAnimateIn(false);
  const t = setTimeout(() => setAnimateIn(true), 20);
  return () => clearTimeout(t);
}, [open]);

  // Reset tab on open
  useEffect(() => {
    if (open) setActiveTab("details");
  }, [open]);

  const footer = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: "11px", color: "#94a3b8" }}>
        Última actualización: {new Date(ticket.date).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
      </span>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={onClose}
          style={{
            padding: "7px 16px",
            borderRadius: "8px",
            border: "1.5px solid #e2e8f0",
            background: "transparent",
            color: "#64748b",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Cerrar
        </button>
        <button
          style={{
            padding: "7px 16px",
            borderRadius: "8px",
            border: "none",
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            color: "#fff",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <ExternalLinkIcon />
          Ver en portal
        </button>
      </div>
    </div>
  );

  return (
<Modal
  open={open}
  onClose={onClose}
  size="xl"
  accentColor="bg-blue-600"
  footer={footer}
  hideCloseButton
>
      {/* ── Animated wrapper ── */}
      <div
        style={{
          fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
          opacity: animateIn ? 1 : 0,
          transform: animateIn ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
        }}
      >

        {/* ── Ticket header ── */}
        <div style={{ marginBottom: "20px" }}>
          {/* Top row: ticket number + status + close */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Ticket number pill */}
              <span
                style={{
                  display: "flex", alignItems: "center", gap: "4px",
                  padding: "3px 10px",
                  borderRadius: "20px",
                  background: "#eff6ff",
                  color: "#2563eb",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: ".3px",
                }}
              >
                <Hash className="h-3 w-3" />
                {ticket.ticketNumber}
              </span>

              {/* Department */}
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: "20px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  color: "#475569",
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                {ticket.departmentLabel}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Status pill */}
              <span
                style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  background: cfg.bg,
                  color: cfg.color,
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
                {cfg.label}
              </span>

              {/* Close button */}
              <button
                onClick={onClose}
                style={{
                  width: 30, height: 30,
                  borderRadius: "8px",
                  border: "1.5px solid #e2e8f0",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#94a3b8",
                  flexShrink: 0,
                }}
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Title */}
          <h2 style={{ margin: "0 0 6px", fontSize: "17px", fontWeight: 700, color: "#0f172a", lineHeight: 1.3 }}>
            {ticket.title}
          </h2>

          {/* Description */}
          <p style={{ margin: 0, fontSize: "13px", color: "#64748b", lineHeight: 1.6 }}>
            {ticket.description}
          </p>

          {/* Tags */}
          {ticket.tags && ticket.tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "10px" }}>
              {ticket.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: "2px 9px",
                    borderRadius: "20px",
                    background: "#f1f5f9",
                    color: "#475569",
                    fontSize: "10.5px",
                    fontWeight: 600,
                    display: "flex", alignItems: "center", gap: "4px",
                  }}
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Tabs ── */}
        <div
          style={{
            display: "flex",
            gap: "2px",
            borderBottom: "1px solid #f1f3f6",
            marginBottom: "18px",
          }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count =
              tab.id === "comments"
                ? ticket.comments.length
                : tab.id === "attachments"
                ? ticket.attachments.length
                : tab.id === "timeline"
                ? ticket.timeline.length
                : null;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "8px 12px",
                  border: "none",
                  background: "transparent",
                  borderBottom: isActive ? "2px solid #2563eb" : "2px solid transparent",
                  color: isActive ? "#2563eb" : "#64748b",
                  fontSize: "12px",
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all .15s",
                  marginBottom: "-1px",
                }}
              >
                {tab.icon}
                {tab.label}
                {count !== null && (
                  <span
                    style={{
                      minWidth: 18, height: 18,
                      borderRadius: "9px",
                      background: isActive ? "#2563eb" : "#e2e8f0",
                      color: isActive ? "#fff" : "#64748b",
                      fontSize: "10px", fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: "0 4px",
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Tab content ── */}
        <div style={{ minHeight: "220px" }}>

          {/* DETAILS */}
          {activeTab === "details" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
              {/* Left column */}
              <div>
                <MetaRow icon={<User className="h-3.5 w-3.5" />} label="Solicitante">
                  {ticket.requester}
                </MetaRow>
                <MetaRow icon={<Building2 className="h-3.5 w-3.5" />} label="Área">
                  {ticket.departmentLabel}
                </MetaRow>
                <MetaRow icon={<FileText className="h-3.5 w-3.5" />} label="Categoría">
                  {ticket.category ?? "—"}
                </MetaRow>
              </div>
              {/* Right column */}
              <div>
                <MetaRow icon={<User className="h-3.5 w-3.5" />} label="Asignado a">
                  {ticket.assignee ?? (
                    <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Sin asignar</span>
                  )}
                </MetaRow>
                <MetaRow icon={<Calendar className="h-3.5 w-3.5" />} label="Creado">
                  {new Date(ticket.date).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}
                </MetaRow>
                <MetaRow icon={<AlertCircle className="h-3.5 w-3.5" />} label="Vencimiento">
                  {ticket.dueDate
                    ? new Date(ticket.dueDate).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })
                    : <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Sin fecha</span>
                  }
                </MetaRow>
              </div>
            </div>
          )}

          {/* COMMENTS */}
          {activeTab === "comments" && (
            <div>
              {/* Comment list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "18px" }}>
                {ticket.comments.length === 0 ? (
                  <Empty text="Sin comentarios aún" />
                ) : (
                  ticket.comments.map((c, i) => (
                    <div
                      key={c.id}
                      style={{
                        display: "flex",
                        gap: "10px",
                        opacity: 0,
                        animation: `fadeSlideUp 0.25s ease forwards`,
                        animationDelay: `${i * 60}ms`,
                      }}
                    >
                      <Avatar initials={c.initials} color={c.color} size={30} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                          <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#1e293b" }}>{c.author}</span>
                          <span style={{ fontSize: "10.5px", color: "#94a3b8" }}>{c.date}</span>
                        </div>
                        <div
                          style={{
                            padding: "10px 12px",
                            borderRadius: "10px",
                            background: "#f8fafc",
                            border: "1px solid #f1f3f6",
                            fontSize: "12.5px",
                            color: "#334155",
                            lineHeight: 1.6,
                          }}
                        >
                          {c.message}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* New comment input */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "flex-end",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1.5px solid #e2e8f0",
                  background: "#fafbfc",
                  transition: "border-color .15s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
              >
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Escribe un comentario…"
                  rows={2}
                  style={{
                    flex: 1,
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    resize: "none",
                    fontSize: "12.5px",
                    color: "#334155",
                    fontFamily: "inherit",
                    lineHeight: 1.5,
                  }}
                />
                <button
                  disabled={!comment.trim()}
                  style={{
                    width: 32, height: 32,
                    borderRadius: "8px",
                    border: "none",
                    background: comment.trim()
                      ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
                      : "#e2e8f0",
                    color: comment.trim() ? "#fff" : "#94a3b8",
                    cursor: comment.trim() ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    transition: "all .15s",
                  }}
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ATTACHMENTS */}
          {activeTab === "attachments" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {ticket.attachments.length === 0 ? (
                <Empty text="Sin adjuntos" />
              ) : (
                ticket.attachments.map((a, i) => (
                  <div
                    key={a.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: "1px solid #f1f3f6",
                      background: "#fafbfc",
                      cursor: "pointer",
                      transition: "border-color .15s, box-shadow .15s",
                      opacity: 0,
                      animation: `fadeSlideUp 0.25s ease forwards`,
                      animationDelay: `${i * 60}ms`,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "#cbd5e1";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,.06)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "#f1f3f6";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                    }}
                  >
                    {/* Ext badge */}
                    <span
                      style={{
                        width: 36, height: 36,
                        borderRadius: "8px",
                        background: "#eff6ff",
                        color: "#2563eb",
                        fontSize: "9px",
                        fontWeight: 800,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                        border: "1px solid #dbeafe",
                        letterSpacing: ".5px",
                      }}
                    >
                      {a.ext}
                    </span>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: "12.5px", fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {a.name}
                      </p>
                      <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>{a.size}</p>
                    </div>

                    <button
                      style={{
                        width: 28, height: 28,
                        borderRadius: "7px",
                        border: "1.5px solid #e2e8f0",
                        background: "transparent",
                        cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#94a3b8",
                        flexShrink: 0,
                        transition: "all .15s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "#eff6ff";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#2563eb";
                        (e.currentTarget as HTMLButtonElement).style.color = "#2563eb";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
                        (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
                      }}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TIMELINE */}
          {activeTab === "timeline" && (
            <div style={{ position: "relative", paddingLeft: "20px" }}>
              {/* Vertical line */}
              <div
                style={{
                  position: "absolute",
                  left: "7px",
                  top: "8px",
                  bottom: "8px",
                  width: "1.5px",
                  background: "#e2e8f0",
                  borderRadius: "1px",
                }}
              />

              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {ticket.timeline.map((ev, i) => (
                  <div
                    key={ev.id}
                    style={{
                      position: "relative",
                      paddingBottom: i < ticket.timeline.length - 1 ? "16px" : "0",
                      opacity: 0,
                      animation: `fadeSlideUp 0.25s ease forwards`,
                      animationDelay: `${i * 70}ms`,
                    }}
                  >
                    {/* Dot */}
                    <span
                      style={{
                        position: "absolute",
                        left: "-16px",
                        top: "4px",
                        width: "10px", height: "10px",
                        borderRadius: "50%",
                        background: i === 0 ? "#2563eb" : "#e2e8f0",
                        border: i === 0 ? "2px solid #bfdbfe" : "2px solid #f1f5f9",
                        zIndex: 1,
                      }}
                    />

                    <div>
                      <p style={{ margin: "0 0 1px", fontSize: "12.5px", fontWeight: 600, color: "#1e293b" }}>
                        {ev.label}
                      </p>
                      <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>
                        {ev.by} · {ev.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── CSS keyframes injected once ── */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>
    </Modal>
  );
}

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function Empty({ text }: { text: string }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 24px", color: "#94a3b8", fontSize: "13px" }}>
      <div style={{ opacity: 0.4, marginBottom: "8px", display: "flex", justifyContent: "center" }}>
        <FileText className="h-8 w-8" />
      </div>
      {text}
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="1" y1="1" x2="13" y2="13" />
      <line x1="13" y1="1" x2="1" y2="13" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

// ─── Usage example: hook into RequestsPanel ───────────────────────────────────
//
// In RequestsPanel.tsx, add:
//
//   const [selected, setSelected] = useState<TicketDetail | null>(null);
//
// On each card click:
//   onClick={() => setSelected(MOCK_DETAIL)} // → replace with fetch(req.id)
//
// At the bottom of the JSX:
//   {selected && (
//     <TicketDetailModal
//       open={!!selected}
//       onClose={() => setSelected(null)}
//       ticket={selected}
//     />
//   )}
