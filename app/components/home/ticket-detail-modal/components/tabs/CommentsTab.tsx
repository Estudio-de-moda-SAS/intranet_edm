import { Send } from "lucide-react";
import { Avatar } from "../Avatar";
import { EmptyState } from "../EmptyState";
import type { TicketDetail } from "../../types";

/**
 * @module TicketDetailModal/components/tabs/CommentsTab
 * Pestaña de comentarios del ticket.
 */

interface CommentsTabProps {
  ticket: TicketDetail;
  comment: string;
  setComment: (value: string) => void;
}

export function CommentsTab({ ticket, comment, setComment }: CommentsTabProps) {
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "18px" }}>
        {ticket.comments.length === 0 ? (
          <EmptyState text="Sin comentarios aún" />
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
            width: 32,
            height: 32,
            borderRadius: "8px",
            border: "none",
            background: comment.trim() ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" : "#e2e8f0",
            color: comment.trim() ? "#fff" : "#94a3b8",
            cursor: comment.trim() ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all .15s",
          }}
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}