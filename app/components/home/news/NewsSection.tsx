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
 *
 * Layout: antes tenía un grid interno de 2 columnas (workspace a la
 * izquierda, tarjeta institucional + Microsoft 365 a la derecha) con
 * altura fija de 620px. Al reducir el ancho de esta sección en el home
 * (para darle más espacio a EDM News), ese grid interno de 2 columnas
 * quedaba demasiado apretado. Se cambió a un stack vertical de una sola
 * columna — mismo contenido, sin altura fija, apilado de arriba a abajo.
 *
 * Orden del stack: tarjeta institucional (KnowUsCard) primero, luego el
 * workspace de búsqueda/accesos, luego Microsoft 365 — a pedido, para que
 * lo institucional sea lo primero que se vea al entrar.
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
 * @returns Sección con tarjeta institucional, workspace y accesos Microsoft 365, apilados verticalmente.
 *
 * @remarks
 * - El carrusel de noticias fue reemplazado por un workspace operativo.
 * - Todo el contenido va en una sola columna vertical (ver nota de layout arriba).
 * - No requiere backend, base de datos ni integración adicional con Microsoft Graph.
 */
export function NewsSection({ announcements: _announcements }: Props) {
  const SHOW_POLICIES_CARD_ASIDE = false; // Controla visibilidad de la tarjeta de políticas
  const SHOW_MICROSOFT_365_SECTION = true; // Controla visibilidad de accesos rápidos a Microsoft 365
  const SHOW_WORKSPACE = false; // Controla visibilidad del workspace de búsqueda y accesos rápidos

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

    {/* Stack vertical: tarjeta institucional → Microsoft 365 → workspace */}
      <div className="flex flex-col gap-3">
        <KnowUsCard />

        {SHOW_MICROSOFT_365_SECTION && (
          <QuickLinksSection
            quickLinks={microsoft365QuickLinks}
            title="Microsoft 365"
            subtitle="Accede a tus herramientas corporativas"
            badgeLabel={`${microsoft365QuickLinks.length} herramientas`}
            showFavorites={false}
          />
        )}

        {SHOW_POLICIES_CARD_ASIDE && <PoliciesCardAside />}
        {SHOW_WORKSPACE && <HomeWorkspace />}
      </div>

    </section>
  );
}