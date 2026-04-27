import React from "react";

/**
 * @module TicketDetailModal/components/MetaRow
 * Fila de metadato dentro de la pestaña de detalles.
 */

interface MetaRowProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

/**
 * Fila de metadato dentro de la pestaña de detalles.
 *
 * @param props Propiedades del componente.
 * @param props.icon Ícono representativo del dato.
 * @param props.label Etiqueta del campo.
 * @param props.children Valor renderizado del campo.
 * @returns Fila estructurada con ícono, etiqueta y contenido.
 */
export function MetaRow({ icon, label, children }: MetaRowProps) {
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