import { FileText } from "lucide-react";

/**
 * @module TicketDetailModal/components/EmptyState
 * Estado vacío simple para pestañas sin contenido.
 */

interface EmptyStateProps {
  text: string;
}

/**
 * Estado vacío simple para pestañas sin contenido.
 *
 * @param props Propiedades del componente.
 * @param props.text Texto mostrado al usuario.
 * @returns Vista vacía centrada con ícono.
 */
export function EmptyState({ text }: EmptyStateProps) {
  return (
    <div style={{ textAlign: "center", padding: "40px 24px", color: "#94a3b8", fontSize: "13px" }}>
      <div style={{ opacity: 0.4, marginBottom: "8px", display: "flex", justifyContent: "center" }}>
        <FileText className="h-8 w-8" />
      </div>
      {text}
    </div>
  );
}