/**
 * @module RetailPanels
 * Paneles condicionales del módulo de Retail.
 *
 * @remarks
 * Este archivo define una capa de composición para los paneles principales
 * del módulo de Retail, permitiendo renderizar únicamente el contenido
 * asociado al canal actualmente activo.
 *
 * El comportamiento implementado es intencionalmente condicional:
 * - cada panel se monta solo cuando su canal está activo
 * - al cambiar de canal, el panel anterior se desmonta completamente
 * - no se utilizan estrategias de ocultamiento visual (`hidden`)
 * - se aplica una transición de entrada suave al montar el panel activo
 *
 * Esta aproximación resulta útil cuando se desea:
 * - evitar render innecesario de paneles inactivos
 * - reducir carga visual y lógica acumulada
 * - reiniciar el estado interno de cada panel al cambiar de canal
 * - mantener una experiencia de navegación más limpia
 *
 * La lógica de canal activo depende del contexto provisto por
 * {@link useRetailChannel}, definido junto a la barra de tabs del módulo.
 */

"use client";

// RetailPanels.tsx
// Tres paneles condicionales — cada uno se monta solo cuando su canal
// está activo en el contexto. Al cambiar de tab el panel anterior
// se desmonta completamente (no hidden, sino null).
// Incluye una transición de entrada suave sin dependencias externas.

import { type ReactNode, useEffect, useState } from "react";
import { useRetailChannel, type ChannelId }    from "./RetailChannelTabsBar";

// ── Panel base ────────────────────────────────────────────────────

/**
 * Propiedades del panel base por canal.
 *
 * @property channel Identificador del canal al que pertenece el panel.
 * @property children Contenido visual que se renderiza dentro del panel.
 */
type ChannelPanelProps = {
  channel: ChannelId;
  children: ReactNode;
};

/**
 * Panel base controlado por el canal activo del contexto de Retail.
 *
 * @param props Propiedades del componente.
 * @param props.channel Canal al que corresponde el panel.
 * @param props.children Contenido del panel.
 * @returns El contenido del canal activo con transición de entrada, o `null` si el canal no está activo.
 *
 * @remarks
 * Este componente encapsula la lógica común de render condicional
 * para los paneles del módulo.
 *
 * Su comportamiento puede resumirse así:
 *
 * 1. Consulta el canal activo desde {@link useRetailChannel}
 * 2. Determina si el panel actual corresponde a dicho canal
 * 3. Si no corresponde, retorna `null`
 * 4. Si corresponde, monta el contenido y aplica una animación
 *    suave de entrada mediante cambio de `opacity` y `transform`
 *
 * La transición se dispara usando `requestAnimationFrame`
 * para permitir que el navegador aplique primero el estado inicial
 * y luego anime hacia el estado visible.
 *
 * Esta estrategia evita dependencias externas de animación
 * y mantiene el comportamiento liviano y controlado.
 */
function ChannelPanel({
  channel,
  children,
}: ChannelPanelProps) {
  const { active } = useRetailChannel();
  const isActive = active === channel;

  /**
   * Estado local de visibilidad usado para animar la entrada del panel.
   *
   * @remarks
   * Solo se activa cuando el panel corresponde al canal actualmente visible.
   * Cuando el canal cambia y el panel deja de estar activo,
   * se reinicia a `false`.
   */
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
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
      }}
    >
      {children}
    </div>
  );
}

// ── Paneles exportados ────────────────────────────────────────────

/**
 * Panel condicional del canal Comercial.
 *
 * @param props Propiedades del componente.
 * @param props.children Contenido a renderizar cuando el canal activo es `comercial`.
 * @returns El contenido del canal comercial si está activo; en caso contrario, `null`.
 *
 * @remarks
 * Este componente es una especialización de {@link ChannelPanel}
 * para el canal comercial del módulo Retail.
 */
export function CommercialPanel({ children }: { children: ReactNode }) {
  return <ChannelPanel channel="comercial">{children}</ChannelPanel>;
}

/**
 * Panel condicional del canal E-Commerce.
 *
 * @param props Propiedades del componente.
 * @param props.children Contenido a renderizar cuando el canal activo es `ecommerce`.
 * @returns El contenido del canal e-commerce si está activo; en caso contrario, `null`.
 *
 * @remarks
 * Este componente es una especialización de {@link ChannelPanel}
 * para el canal de comercio electrónico del módulo Retail.
 */
export function EcommercePanel({ children }: { children: ReactNode }) {
  return <ChannelPanel channel="ecommerce">{children}</ChannelPanel>;
}

/**
 * Panel condicional del canal Tiendas.
 *
 * @param props Propiedades del componente.
 * @param props.children Contenido a renderizar cuando el canal activo es `tiendas`.
 * @returns El contenido del canal tiendas si está activo; en caso contrario, `null`.
 *
 * @remarks
 * Este componente es una especialización de {@link ChannelPanel}
 * para el canal de tiendas físicas del módulo Retail.
 */
export function TiendasPanel({ children }: { children: ReactNode }) {
  return <ChannelPanel channel="tiendas">{children}</ChannelPanel>;
}