/**
 * @module HRQuickLinks
 * Componente contenedor para accesos rápidos del módulo de Recursos Humanos.
 *
 * @remarks
 * Este componente actúa como wrapper especializado de {@link QuickLinksSection},
 * adaptado al contexto de RRHH.
 *
 * Recibe enlaces previamente procesados (filtrados y autorizados) desde un
 * Server Component, garantizando que solo se rendericen accesos permitidos
 * según el nivel de acceso del usuario.
 */

"use client";

import { QuickLinksSection } from "@/app/components/ui/QuickLinksSection";
import type { QuickLinkItem } from "@/app/components/ui/QuickLinksSection";

/**
 * Props del componente {@link HRQuickLinks}.
 *
 * @property quickLinks Lista de accesos rápidos ya procesados y autorizados.
 * @property title Título opcional de la sección.
 * @property columns Número de columnas para el layout (2, 3 o 4).
 */
interface HRQuickLinksProps {
  quickLinks: QuickLinkItem[];
  title?: string;
  columns?: 2 | 3 | 4;
}

/**
 * Componente de accesos rápidos para RRHH.
 *
 * @param props Propiedades del componente.
 * @returns Sección de accesos rápidos renderizada con layout configurable.
 *
 * @remarks
 * Características:
 * - Delega completamente el render a {@link QuickLinksSection}
 * - Permite personalizar título y número de columnas
 * - Utiliza enlaces previamente filtrados por permisos en servidor
 *
 * Flujo esperado:
 * 1. Server Component procesa enlaces con `processQuickLinks`
 * 2. Se pasan como `quickLinks` a este componente
 * 3. Se renderizan únicamente los accesos válidos
 *
 * @example
 * ```tsx
 * <HRQuickLinks quickLinks={processedLinks} columns={3} />
 * ```
 */
export function HRQuickLinks({
  quickLinks,
  title = "Accesos rápidos · RRHH",
  columns = 2,
}: HRQuickLinksProps) {
  return (
    <QuickLinksSection
      title={title}
      quickLinks={quickLinks}
      columns={columns}
    />
  );
}