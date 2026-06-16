/**
 * @module NewsSection
 * Sección principal del workspace y contenido operativo en el home.
 *
 * @remarks
 * Este componente organiza el espacio principal del home como un dashboard
 * operativo para la intranet.
 *
 * En esta versión se reemplaza el carrusel de noticias por un bloque de
 * workspace personal, orientado a:
 * - búsqueda dentro de la intranet,
 * - acciones rápidas hacia módulos internos,
 * - tarjeta institucional de la organización,
 * - accesos rápidos a herramientas Microsoft 365.
 */

"use client";

import { Newspaper } from "lucide-react";
import { KnowUsCard } from "@/app/components/home/KnowUsCard";
import { PoliciesCardAside } from "@/app/components/home/PoliciesCard";
import { QuickLinksSection } from "@/app/components/ui/QuickLinksSection";
import {
  microsoft365QuickLinks,
} from "@/app/components/home/config/homeQuickLinks";
import { HomeWorkspace } from "@/app/components/home/HomeWorkspace";

/**
 * Representa una noticia o comunicado.
 *
 * @remarks
 * Se mantiene por compatibilidad con la estructura previa del home,
 * aunque en esta versión el carrusel de noticias ya no se renderiza.
 */
interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  imageUrl?: string;
}

/**
 * Props del componente {@link NewsSection}.
 */
interface Props {
  /**
   * Lista de anuncios disponibles.
   *
   * @remarks
   * Actualmente se conserva para no romper el contrato del componente,
   * pero el home ya no depende de los anuncios para renderizar esta sección.
   */
  announcements: Announcement[];
}

/**
 * Renderiza el bloque principal del home.
 *
 * @param props Propiedades del componente.
 * @param props.announcements Lista de noticias disponibles.
 * @returns Sección con workspace, acciones rápidas, tarjeta institucional y accesos Microsoft 365.
 *
 * @remarks
 * - El carrusel de noticias fue reemplazado por un workspace operativo.
 * - La columna izquierda concentra la búsqueda y los accesos internos.
 * - La columna derecha conserva "Nuestra organización" y agrupa Microsoft 365.
 * - No requiere backend, base de datos ni integración adicional con Microsoft Graph.
 */
export function NewsSection({ announcements: _announcements }: Props) {
  const SHOW_POLICIES_CARD_ASIDE = false; // Controla visibilidad de la tarjeta de políticas en el lado derecho
  const SHOW_MICROSOFT_365_SECTION = true; // Controla visibilidad de accesos rápidos a herramientas Microsoft 365

  return (
    <section className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg
                           bg-violet-50 dark:bg-violet-500/[0.12]">
            <Newspaper className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
          </span>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-[#e6edf3]">
            Mi espacio de trabajo
          </h2>
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:h-[620px]">

        {/* Workspace principal */}
<div className="h-auto lg:h-full">
  <HomeWorkspace />
</div>
        {/* Panel derecho */}
        <div className="grid grid-cols-2 grid-rows-2 gap-2 lg:h-full">
          <div
            className={`
              ${
                SHOW_POLICIES_CARD_ASIDE
                  ? SHOW_MICROSOFT_365_SECTION
                    ? "col-span-1 row-span-1"
                    : "col-span-1 row-span-2"
                  : SHOW_MICROSOFT_365_SECTION
                    ? "col-span-2 row-span-1"
                    : "col-span-2 row-span-2"
              }
              lg:h-full
            `}
          >
            <KnowUsCard />
          </div>

          {SHOW_POLICIES_CARD_ASIDE && <PoliciesCardAside />}

          {SHOW_MICROSOFT_365_SECTION && (
            <div className="col-span-2 lg:h-full">
              <QuickLinksSection
                quickLinks={microsoft365QuickLinks}
                title="Microsoft 365"
                subtitle="Accede a tus herramientas corporativas"
                badgeLabel={`${microsoft365QuickLinks.length} herramientas`}
                showFavorites={false}
                fillHeight
              />
            </div>
          )}
        </div>

      </div>
    </section>
  );
}