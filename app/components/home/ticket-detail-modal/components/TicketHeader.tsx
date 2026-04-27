import { Hash, Tag } from "lucide-react";
import { STATUS_CONFIG } from "../config";
import { CloseIcon } from "./Icons";
import type { TicketDetail } from "../types";

/**
 * @module TicketDetailModal/components/TicketHeader
 * Encabezado principal del modal con resumen visual del ticket.
 */

interface TicketHeaderProps {
  ticket: TicketDetail;
  onClose: () => void;
}

/**
 * Encabezado principal del modal con resumen visual del ticket.
 *
 * @param props Propiedades del componente.
 * @returns Bloque superior con número, área, estado, título, descripción y tags.
 */
export function TicketHeader({ ticket, onClose }: TicketHeaderProps) {
  const cfg = STATUS_CONFIG[ticket.status];

  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
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
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
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

          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: "8px",
              border: "1.5px solid #e2e8f0",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              flexShrink: 0,
            }}
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      <h2 style={{ margin: "0 0 6px", fontSize: "17px", fontWeight: 700, color: "#0f172a", lineHeight: 1.3 }}>
        {ticket.title}
      </h2>

      <p style={{ margin: 0, fontSize: "13px", color: "#64748b", lineHeight: 1.6 }}>
        {ticket.description}
      </p>

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
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Tag className="h-2.5 w-2.5" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}