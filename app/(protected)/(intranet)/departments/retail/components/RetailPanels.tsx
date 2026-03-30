"use client";

// RetailPanels.tsx
// Tres paneles condicionales — cada uno se monta solo cuando su canal
// está activo en el contexto. Al cambiar de tab el panel anterior
// se desmonta completamente (no hidden, sino null).
// Incluye una transición de entrada suave sin dependencias externas.

import { type ReactNode, useEffect, useState } from "react";
import { useRetailChannel, type ChannelId }    from "./RetailChannelTabsBar";

// ── Panel base ────────────────────────────────────────────────────

function ChannelPanel({
  channel,
  children,
}: {
  channel:  ChannelId;
  children: ReactNode;
}) {
  const { active }          = useRetailChannel();
  const isActive            = active === channel;

  // Fade-in al montar el panel activo
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setVisible(false);
      return;
    }
    // Tick de espera para que el navegador aplique la clase de inicio
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div
      className="transition-all duration-300 ease-out"
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
      }}
    >
      {children}
    </div>
  );
}

// ── Paneles exportados ────────────────────────────────────────────

export function CommercialPanel({ children }: { children: ReactNode }) {
  return <ChannelPanel channel="comercial">{children}</ChannelPanel>;
}

export function EcommercePanel({ children }: { children: ReactNode }) {
  return <ChannelPanel channel="ecommerce">{children}</ChannelPanel>;
}

export function TiendasPanel({ children }: { children: ReactNode }) {
  return <ChannelPanel channel="tiendas">{children}</ChannelPanel>;
}
