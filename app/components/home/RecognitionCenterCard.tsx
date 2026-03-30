"use client";

import { useState } from "react";
import type { Recognition, RecognitionCategory } from "@/lib/recognitions";

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  RecognitionCategory,
  { label: string; icon: string; color: string; bg: string }
> = {
  destacado:      { label: "Destacado",            icon: "⭐", color: "#b45309", bg: "#fef3c7" },
  innovacion:     { label: "Innovación",           icon: "💡", color: "#7c3aed", bg: "#ede9fe" },
  trabajo_equipo: { label: "Trabajo en equipo",    icon: "🤝", color: "#0369a1", bg: "#e0f2fe" },
  liderazgo:      { label: "Liderazgo",            icon: "🏆", color: "#15803d", bg: "#dcfce7" },
  cliente:        { label: "Orientación cliente",  icon: "💼", color: "#be185d", bg: "#fce7f3" },
};

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  /** Lista de reconocimientos del usuario logueado.
   *  Viene del server (via getRecognitionsByUser) o del mock. */
  recognitions: Recognition[];
};

// ─── Component ────────────────────────────────────────────────────────────────

export function RecognitionsCard({ recognitions }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,.07), 0 4px 16px rgba(0,0,0,.04)",
        overflow: "hidden",
        fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: "16px 18px 14px",
          borderBottom: "1px solid #f1f3f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <span
            style={{
              width: 34, height: 34, borderRadius: "10px",
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px", flexShrink: 0,
            }}
          >
            🏅
          </span>
          <div>
            <h2 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>
              Mis Reconocimientos
            </h2>
            <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8", marginTop: "1px" }}>
              {recognitions.length} recibido{recognitions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <span
          style={{
            minWidth: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg, #fef3c7, #fde68a)",
            color: "#92400e",
            fontSize: "12px", fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1.5px solid #fcd34d",
          }}
        >
          {recognitions.length}
        </span>
      </div>

      {/* ── List ── */}
      <div style={{ padding: "10px 12px 4px", display: "flex", flexDirection: "column", gap: "6px" }}>
        {recognitions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 16px", color: "#94a3b8", fontSize: "12.5px" }}>
            <span style={{ fontSize: "28px", display: "block", marginBottom: "8px", opacity: .5 }}>🏅</span>
            Aún no tienes reconocimientos
          </div>
        ) : (
          recognitions.map((rec) => {
            const cat    = CATEGORY_CONFIG[rec.category] ?? CATEGORY_CONFIG.destacado;
            const isOpen = expanded === rec.id;

            return (
              <div
                key={rec.id}
                onClick={() => setExpanded(isOpen ? null : rec.id)}
                style={{
                  borderRadius: "10px",
                  border: isOpen ? `1.5px solid ${cat.color}30` : "1px solid #f1f3f6",
                  background: isOpen ? cat.bg + "55" : "#fafbfc",
                  cursor: "pointer",
                  overflow: "hidden",
                  transition: "border-color .2s, background .2s",
                }}
              >
                {/* Row */}
                <div
                  style={{
                    padding: "10px 12px",
                    display: "grid",
                    gridTemplateColumns: "32px 1fr auto",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  {/* Avatar: foto Graph si existe, si no iniciales */}
                  <div
                    style={{
                      width: 32, height: 32, borderRadius: "50%",
                      overflow: "hidden",
                      background: "linear-gradient(135deg, #2563eb22, #2563eb44)",
                      border: "1.5px solid #2563eb33",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "10px", fontWeight: 800, color: "#1d4ed8",
                      flexShrink: 0,
                    }}
                  >
                    {rec.fromPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={rec.fromPhoto}
                        alt={rec.from}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      rec.fromAvatar
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0, fontSize: "12.5px", fontWeight: 700,
                        color: "#1e293b",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}
                    >
                      {rec.title}
                    </p>
                    <p style={{ margin: "1px 0 0", fontSize: "11px", color: "#94a3b8" }}>
                      De <strong style={{ color: "#475569", fontWeight: 600 }}>{rec.from}</strong>
                    </p>
                  </div>

                  {/* Categoría + chevron */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
                    <span
                      style={{
                        padding: "2px 7px", borderRadius: "20px",
                        background: cat.bg, color: cat.color,
                        fontSize: "10px", fontWeight: 700,
                        display: "flex", alignItems: "center", gap: "3px",
                      }}
                    >
                      {cat.icon} {cat.label}
                    </span>
                    <svg
                      width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s" }}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>

                {/* Mensaje expandido */}
                {isOpen && (
                  <div
                    style={{
                      padding: "0 12px 12px",
                      borderTop: `1px solid ${cat.color}20`,
                    }}
                  >
                    <p
                      style={{
                        margin: "10px 0 6px",
                        fontSize: "12px",
                        color: "#475569",
                        lineHeight: 1.6,
                        fontStyle: "italic",
                      }}
                    >
                      "{rec.message}"
                    </p>
                    <span style={{ fontSize: "10.5px", color: "#b0bec5", fontWeight: 500 }}>
                      {new Date(rec.date).toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{ padding: "10px 12px 12px" }}>
        <button
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "8px",
            border: "1px dashed #e2e8f0",
            background: "transparent",
            color: "#64748b",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "border-color .15s, color .15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#f59e0b";
            (e.currentTarget as HTMLButtonElement).style.color = "#b45309";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
            (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
          }}
        >
          Ver todos los reconocimientos →
        </button>
      </div>
    </section>
  );
}