import { Download } from "lucide-react";
import { EmptyState } from "../EmptyState";
import type { TicketDetail } from "../../types";

/**
 * @module TicketDetailModal/components/tabs/AttachmentsTab
 * Pestaña de archivos adjuntos del ticket.
 */

interface AttachmentsTabProps {
  ticket: TicketDetail;
}

export function AttachmentsTab({ ticket }: AttachmentsTabProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {ticket.attachments.length === 0 ? (
        <EmptyState text="Sin adjuntos" />
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
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: "8px",
                background: "#eff6ff",
                color: "#2563eb",
                fontSize: "9px",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                border: "1px solid #dbeafe",
                letterSpacing: ".5px",
              }}
            >
              {a.ext}
            </span>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: "#1e293b",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {a.name}
              </p>
              <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>{a.size}</p>
            </div>

            <button
              style={{
                width: 28,
                height: 28,
                borderRadius: "7px",
                border: "1.5px solid #e2e8f0",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
  );
}