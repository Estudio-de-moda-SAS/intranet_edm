import { TABS } from "../config";
import type { Tab, TicketDetail } from "../types";

/**
 * @module TicketDetailModal/components/TicketTabs
 * Navegación superior por pestañas del modal.
 */

interface TicketTabsProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
  ticket: TicketDetail;
}

/**
 * Navegación superior por pestañas del modal.
 *
 * @param props Propiedades del componente.
 * @returns Lista de tabs con contadores contextuales.
 */
export function TicketTabs({ activeTab, onChange, ticket }: TicketTabsProps) {
  return (
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
            onClick={() => onChange(tab.id)}
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
                  minWidth: 18,
                  height: 18,
                  borderRadius: "9px",
                  background: isActive ? "#2563eb" : "#e2e8f0",
                  color: isActive ? "#fff" : "#64748b",
                  fontSize: "10px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
  );
}