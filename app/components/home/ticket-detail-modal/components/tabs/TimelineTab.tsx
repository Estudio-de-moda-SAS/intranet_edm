import type { TicketDetail } from "../../types";

/**
 * @module TicketDetailModal/components/tabs/TimelineTab
 * Pestaña de historial del ticket.
 */

interface TimelineTabProps {
  ticket: TicketDetail;
}

export function TimelineTab({ ticket }: TimelineTabProps) {
  return (
    <div style={{ position: "relative", paddingLeft: "20px" }}>
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
            <span
              style={{
                position: "absolute",
                left: "-16px",
                top: "4px",
                width: "10px",
                height: "10px",
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
  );
}