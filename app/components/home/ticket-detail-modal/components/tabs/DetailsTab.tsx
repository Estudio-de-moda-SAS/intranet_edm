import { AlertCircle, Building2, Calendar, FileText, User } from "lucide-react";
import { MetaRow } from "../MetaRow";
import type { TicketDetail } from "../../types";

/**
 * @module TicketDetailModal/components/tabs/DetailsTab
 * Pestaña de detalles generales del ticket.
 */

interface DetailsTabProps {
  ticket: TicketDetail;
}

export function DetailsTab({ ticket }: DetailsTabProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
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

      <div>
        <MetaRow icon={<User className="h-3.5 w-3.5" />} label="Asignado a">
          {ticket.assignee ?? <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Sin asignar</span>}
        </MetaRow>
        <MetaRow icon={<Calendar className="h-3.5 w-3.5" />} label="Creado">
          {new Date(ticket.date).toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </MetaRow>
        <MetaRow icon={<AlertCircle className="h-3.5 w-3.5" />} label="Vencimiento">
          {ticket.dueDate ? (
            new Date(ticket.dueDate).toLocaleDateString("es-CO", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
          ) : (
            <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Sin fecha</span>
          )}
        </MetaRow>
      </div>
    </div>
  );
}