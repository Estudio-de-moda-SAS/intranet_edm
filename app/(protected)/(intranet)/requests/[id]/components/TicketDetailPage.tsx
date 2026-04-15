/**
 * @module TicketDetailPage
 * Vista de detalle de un ticket dentro del módulo de solicitudes de la intranet.
 *
 * @remarks
 * Este archivo define la experiencia completa de visualización de una solicitud
 * individual, incluyendo:
 *
 * - encabezado principal con identidad del ticket
 * - información contextual y metadatos
 * - descripción de la solicitud
 * - comentarios del ticket
 * - adjuntos asociados
 * - historial de eventos
 * - acciones rápidas de navegación e interacción
 *
 * El componente principal actúa como contenedor de presentación para el ticket,
 * mientras que los subcomponentes internos permiten mantener cierta separación
 * visual y estructural dentro del mismo archivo.
 *
 * Durante la revisión técnica se evidencia que este archivo concentra múltiples
 * responsabilidades de UI, por lo que en un futuro sería recomendable modularizar:
 *
 * - tarjetas base
 * - secciones del detalle
 * - timeline
 * - comentarios
 * - adjuntos
 * - barra lateral
 */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, Hash, Building2, User, Calendar, AlertCircle,
  FileText, MessageSquare, Paperclip, Clock, Send, Download,
  Tag, ChevronRight, Pencil, Share2, CheckCircle2,
} from "lucide-react";

import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  getTicketById,
  type TimelineEvent,
} from "@/app/(protected)/(intranet)/requests/data/tickets";

/* -------------------------------------------------------------------------- */
/* Tipos y contratos                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Props del componente {@link TicketDetailPage}.
 *
 * @property ticketId Identificador único del ticket a consultar y renderizar.
 */
const TYPE_ICON: Record<TimelineEvent["type"], React.ReactNode> = {
  created:       <CheckCircle2  className="h-3 w-3 text-violet-500" />,
  status_change: <ChevronRight  className="h-3 w-3 text-blue-500"   />,
  comment:       <MessageSquare className="h-3 w-3 text-slate-400"  />,
  attachment:    <Paperclip     className="h-3 w-3 text-slate-400"  />,
};

// ─── Component ────────────────────────────────────────────────────────────────

export function TicketDetailPage({ ticketId }: { ticketId: string }) {
  
  const ticket   = getTicketById(ticketId);
  const [comment, setComment] = useState("");
  const [loaded,  setLoaded]  = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 40);
    return () => clearTimeout(t);
  }, []);

  // Not found
  if (!ticket) {
    return (
      <main className="min-h-screen bg-[#f4f6f9] flex items-center justify-center"
        style={{ fontFamily: "'DM Sans','Plus Jakarta Sans',ui-sans-serif,system-ui,sans-serif" }}>
        <div className="text-center">
          <p className="text-4xl font-bold text-slate-200 mb-2">404</p>
          <p className="text-slate-500 mb-6">Ticket no encontrado</p>
          <Link href="/" className="text-violet-600 font-semibold hover:underline">← Volver al inicio</Link>
        </div>
      </main>
    );
  }

  const cfg  = STATUS_CONFIG[ticket.status];
  const pcfg = PRIORITY_CONFIG[ticket.priority];

  return (
    <main
      className="min-h-screen bg-[#f4f6f9]"
      style={{ fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
    >

      {/* ── Hero header — identidad propia ─────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #4c1d95 100%)",
        }}
      >
        {/* Dot pattern */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {/* Accent glow */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #a78bfa, transparent 70%)" }} />

        <div
          className="relative mx-auto max-w-7xl px-6 lg:px-14"
          style={{
            paddingTop: 28, paddingBottom: 32,
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(-8px)",
            transition: "opacity .35s ease, transform .35s ease",
          }}
        >
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-2 text-[12px] font-medium text-violet-300">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <ChevronRight className="h-3 w-3 opacity-50" />
            <Link href="/" className="hover:text-white transition-colors">Mis solicitudes</Link>
            <ChevronRight className="h-3 w-3 opacity-50" />
            <span className="text-white">{ticket.ticketNumber}</span>
          </nav>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1 min-w-0">
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-700 text-white"
                  style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)" }}>
                  <Hash className="h-3 w-3" />
                  {ticket.ticketNumber}
                </span>
                <span className="rounded-full px-3 py-1 text-[11px] font-semibold"
                  style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", color: "#c4b5fd" }}>
                  {ticket.departmentLabel}
                </span>
                <span className="rounded-full px-3 py-1 text-[11px] font-semibold"
                  style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", color: "#c4b5fd" }}>
                  {ticket.category}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-white lg:text-3xl leading-tight mb-3 max-w-2xl">
                {ticket.title}
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {ticket.tags?.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold"
                    style={{ background: "rgba(167,139,250,.2)", color: "#ddd6fe", border: "1px solid rgba(167,139,250,.3)" }}>
                    <Tag className="h-2.5 w-2.5" />{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Status + actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <span className="flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-bold"
                style={{ background: cfg.bg, color: cfg.color, border: `1.5px solid ${cfg.ring}` }}>
                <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: cfg.dot }} />
                {cfg.label}
              </span>
              <button className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-semibold text-white transition"
                style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.2)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,.12)")}>
                <Share2 className="h-3.5 w-3.5" /> Compartir
              </button>
            </div>
          </div>

          {/* Meta strip */}
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-violet-300 border-t"
            style={{ borderColor: "rgba(255,255,255,.1)", paddingTop: 14 }}>
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              Solicitado por <strong className="text-white ml-1">{ticket.requester}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(ticket.date).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}
            </span>
            {ticket.dueDate && (
              <span className="flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                Vence: <strong className="text-white ml-1">
                  {new Date(ticket.dueDate).toLocaleDateString("es-CO", { day: "2-digit", month: "long" })}
                </strong>
              </span>
            )}
            {ticket.assignee && (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Asignado a <strong className="text-white ml-1">{ticket.assignee}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div
        className="mx-auto max-w-7xl px-4 pb-16 lg:px-14"
        style={{
          paddingTop: 32,
          opacity: loaded ? 1 : 0,
          transform: loaded ? "translateY(0)" : "translateY(8px)",
          transition: "opacity .4s ease .1s, transform .4s ease .1s",
        }}
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          {/* ── Main column ──────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-6">

            {/* Description card */}
            <Card>
              <SectionHeader icon={<FileText className="h-4 w-4" />} title="Descripción" />
              <p className="text-[13.5px] leading-relaxed text-slate-600 mt-1">
                {ticket.description}
              </p>
            </Card>

            {/* Comments */}
            <Card>
              <SectionHeader
                icon={<MessageSquare className="h-4 w-4" />}
                title="Comentarios"
                count={ticket.comments.length}
              />

              <div className="space-y-4 mt-2">
                {ticket.comments.map((c, i) => (
                  <div key={c.id} className="flex gap-3"
                    style={{ animation: `fadeUp .25s ease ${i * 70}ms both` }}>
                    <Avatar initials={c.initials} color={c.color} size={34} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[13px] font-bold text-slate-800">{c.author}</span>
                        <span className="text-[11px] text-slate-400">{c.date}</span>
                      </div>
                      <div className="rounded-xl px-4 py-3 text-[13px] text-slate-600 leading-relaxed"
                        style={{ background: "#f8fafc", border: "1px solid #f1f3f6" }}>
                        {c.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* New comment */}
              <div className="mt-5 flex gap-3">
                <div className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold text-violet-600"
                  style={{ background: "#ede9fe", border: "1.5px solid #c4b5fd" }}>
                  YO
                </div>
                <div className="flex-1 rounded-xl overflow-hidden"
                  style={{ border: "1.5px solid #e2e8f0", background: "#fafbfc", transition: "border-color .15s" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#7c3aed")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#e2e8f0")}>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Escribe un comentario…"
                    rows={3}
                    className="w-full border-none bg-transparent outline-none resize-none px-4 pt-3 text-[13px] text-slate-700 placeholder:text-slate-400"
                    style={{ fontFamily: "inherit" }}
                  />
                  <div className="flex items-center justify-between px-3 pb-2.5">
                    <span className="text-[11px] text-slate-400">Visible para el equipo</span>
                    <button
                      disabled={!comment.trim()}
                      className="flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[12px] font-semibold transition-all"
                      style={{
                        background: comment.trim() ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "#e2e8f0",
                        color: comment.trim() ? "#fff" : "#94a3b8",
                        cursor: comment.trim() ? "pointer" : "default",
                      }}
                    >
                      <Send className="h-3 w-3" /> Enviar
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Attachments */}
            <Card>
              <SectionHeader
                icon={<Paperclip className="h-4 w-4" />}
                title="Adjuntos"
                count={ticket.attachments.length}
              />
              <div className="mt-2 space-y-2">
                {ticket.attachments.map((a, i) => (
                  <div key={a.id} className="group flex items-center gap-3 rounded-xl px-4 py-3 transition-all cursor-pointer"
                    style={{ border: "1px solid #f1f3f6", background: "#fafbfc", animation: `fadeUp .22s ease ${i * 60}ms both` }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "#c4b5fd";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(124,58,237,.08)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "#f1f3f6";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                    }}
                  >
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center text-[10px] font-800 shrink-0"
                      style={{ background: "#ede9fe", color: "#6d28d9", border: "1px solid #ddd6fe", fontWeight: 800, letterSpacing: ".5px" }}>
                      {a.ext}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-800 truncate">{a.name}</p>
                      <p className="text-[11px] text-slate-400">{a.size}</p>
                    </div>
                    <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11.5px] font-semibold text-violet-600 transition"
                      style={{ background: "#ede9fe", border: "1px solid #ddd6fe" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#ddd6fe")}
                      onMouseLeave={e => (e.currentTarget.style.background = "#ede9fe")}>
                      <Download className="h-3.5 w-3.5" /> Descargar
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* ── Sidebar ───────────────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-5">

            {/* Status + Priority card */}
            <Card>
              <p className="text-[10.5px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Estado del ticket</p>

              {/* Status */}
              <div className="flex items-center justify-between rounded-xl px-4 py-3 mb-3"
                style={{ background: cfg.bg, border: `1px solid ${cfg.ring}` }}>
                <span className="text-[12.5px] font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: cfg.dot }} />
              </div>

              {/* Priority bar */}
              <div className="rounded-xl px-4 py-3" style={{ background: pcfg.bg, border: "1px solid #f1f3f6" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: pcfg.color }}>
                    Prioridad · {pcfg.label}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/60 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${pcfg.bar}`}
                    style={{ background: pcfg.color }} />
                </div>
              </div>
            </Card>

            {/* Meta */}
            <Card>
              <p className="text-[10.5px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Información</p>
              <div className="space-y-0">
                <MetaRow icon={<User className="h-3.5 w-3.5" />} label="Solicitante">{ticket.requester}</MetaRow>
                <MetaRow icon={<Building2 className="h-3.5 w-3.5" />} label="Área">{ticket.departmentLabel}</MetaRow>
                <MetaRow icon={<FileText className="h-3.5 w-3.5" />} label="Categoría">{ticket.category ?? "—"}</MetaRow>
                <MetaRow icon={<User className="h-3.5 w-3.5" />} label="Asignado a">
                  {ticket.assignee ?? <span className="text-slate-400 italic text-[12px]">Sin asignar</span>}
                </MetaRow>
                <MetaRow icon={<Calendar className="h-3.5 w-3.5" />} label="Creado">
                  {new Date(ticket.date).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}
                </MetaRow>
                {ticket.dueDate && (
                  <MetaRow icon={<AlertCircle className="h-3.5 w-3.5" />} label="Vencimiento">
                    {new Date(ticket.dueDate).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}
                  </MetaRow>
                )}
              </div>
            </Card>

            {/* Timeline */}
            <Card>
              <SectionHeader icon={<Clock className="h-4 w-4" />} title="Historial" count={ticket.timeline.length} />
              <div className="relative mt-3 pl-5">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-100" />
                <div className="space-y-4">
                  {ticket.timeline.map((ev, i) => (
                    <div key={ev.id} className="relative"
                      style={{ animation: `fadeUp .22s ease ${i * 60}ms both` }}>
                      <span className="absolute -left-5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full"
                        style={{
                          background: i === 0 ? "#ede9fe" : "#f8fafc",
                          border: `1.5px solid ${i === 0 ? "#c4b5fd" : "#e2e8f0"}`,
                        }}>
                        {TYPE_ICON[ev.type]}
                      </span>
                      <p className="text-[12.5px] font-semibold text-slate-700">{ev.label}</p>
                      <p className="text-[11px] text-slate-400">{ev.by} · {ev.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Action buttons */}
            <div className="space-y-2">
              <button className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-semibold text-white transition-opacity"
                style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = ".88")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                <Pencil className="h-4 w-4" /> Editar solicitud
              </button>
              <Link href="/"
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-semibold text-slate-600 transition"
                style={{ border: "1.5px solid #e2e8f0", background: "transparent" }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.background = "transparent")}>
                <ArrowLeft className="h-4 w-4" /> Volver a solicitudes
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}

// ─── Tiny sub-components ─────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white px-6 py-5"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)", border: "1px solid #f1f3f6" }}>
      {children}
    </div>
  );
}

function SectionHeader({ icon, title, count }: { icon: React.ReactNode; title: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-violet-500">{icon}</span>
      <h3 className="text-[13.5px] font-bold text-slate-800">{title}</h3>
      {count !== undefined && (
        <span className="ml-auto rounded-full px-2.5 py-0.5 text-[10.5px] font-bold text-violet-600"
          style={{ background: "#ede9fe" }}>
          {count}
        </span>
      )}
    </div>
  );
}

function MetaRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-slate-400 mt-0.5 shrink-0">{icon}</span>
      <span className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-400 w-20 shrink-0 mt-0.5">{label}</span>
      <span className="text-[12.5px] font-medium text-slate-700">{children}</span>
    </div>
  );
}


function Avatar({ initials, color, size = 32 }: { initials: string; color: string; size?: number }) {
  return (
    <span className="rounded-full shrink-0 flex items-center justify-center font-bold"
      style={{
        width: size, height: size,
        background: color + "18", color,
        fontSize: size * 0.33, border: `1.5px solid ${color}35`,
      }}>
      {initials}
    </span>
  );
}