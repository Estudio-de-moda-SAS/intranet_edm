/**
 * @module RetailHomePage
 * Contenido principal de la homepage del módulo de Retail.
 *
 * @remarks
 * Este archivo define el componente principal de composición de la vista
 * de Retail dentro de la intranet.
 *
 * Su responsabilidad no es obtener datos ni resolver autenticación,
 * sino construir la interfaz del módulo a partir del nivel de acceso
 * del usuario y del conjunto de canales disponibles.
 *
 * A nivel funcional, este componente:
 * - evalúa permisos por sección y por canal
 * - determina qué bloques de la vista deben renderizarse
 * - procesa accesos rápidos según permisos efectivos
 * - establece el canal inicial visible
 * - compone la homepage del módulo con paneles condicionales
 *
 * La página integra tres dominios operativos principales:
 * - Comercial
 * - E-Commerce
 * - Tiendas físicas
 *
 * Además, puede mostrar una capa adicional de analítica transversal
 * y una sección institucional del equipo del área.
 *
 * Este componente funciona como orquestador principal de la experiencia
 * del módulo Retail y constituye el punto central de ensamblaje visual
 * para todos sus subcomponentes.
 */

// ✅ SERVER COMPONENT — sin "use client"
//
// Guards aplicados por sección:
//   Hero + Equipo + Quick Links  → todos          (employee+)
//   KPI Strip                    → manager+       (retail:view_kpis)
//   Panel Comercial              → retail + admin (retail:view_commercial)
//   Panel E-Commerce             → retail + admin (retail:view_ecommerce)
//   Panel Tiendas                → retail + admin (retail:view_stores)
//   Analítica cross-canal        → retail + admin (retail:view_analytics)

import { TrendingUp, BarChart2 }                               from "lucide-react";

import CommercialSalesSection                                   from "./CommercialSalesSection";
import CommercialPipelineCard                                   from "./CommercialPipelineCard";
import CommercialOrdersCard                                     from "./CommercialOrdersCard";
import { CommercialAlertsCard, CommercialGoalsCard }            from "./CommercialSidebarCards";

import EcommerceCatalogCard                                     from "./EcommerceCatalogCard";
import EcommerceOrdersCard                                      from "./EcommerceOrdersCards";
import { EcommerceReviewsCard, EcommerceAlertsCard }            from "./EcommerceSidebarCards";

import TiendasOpsCenter                                         from "./StoresOpsCenter";
import TiendasSalesTable                                        from "./StoreSalesTable";
import TiendasStoreGrid                                         from "./StoreGrid";
import { TiendasRankingCard, TiendasReplenishmentCard }         from "./StoreSidebarCards";

import { QuickLinksSection }     from "@/app/components/ui/QuickLinksSection";
import { DepartmentTeamSection } from "@/app/components/team/DepartmentTeamSection";
import { retailQuickLinks }      from "../config/retailQuickLinks";
import { retailTeam }            from "../config/retailTeam";
import RetailDashboard           from "./RetailDashboard";

import { DepartmentHeroBanner }  from "@/app/components/ui/animated/DepartmentHeroBanner";
import { AnimatedCard }          from "@/app/components/ui/animated/AnimatedCard";
import { AnimatedSection }       from "@/app/components/ui/animated/AnimatedSection";
import { AnimatedViewCard }      from "@/app/components/ui/animated/AnimatedViewCard";

import { RetailKPIStrip }        from "./RetailKPIStrip";
import {
  RetailChannelProvider,
  RetailChannelTabsBar,
}                                from "./RetailChannelTabsBar";
import { CommercialPanel, EcommercePanel, TiendasPanel } from "./RetailPanels";

import type { CommercialData }   from "@/lib/graph/departments/commercial.service";
import type { EcommerceData }    from "@/lib/graph/departments/ecommerce.service";
import type { StoresData }       from "@/lib/graph/departments/stores.service";
import { can, type AccessLevel } from "@/lib/roles";
import { processQuickLinks }     from "@/lib/quickLinksAccess";

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Propiedades del componente {@link RetailPageContent}.
 *
 * @property commercial Datos del canal comercial.
 * @property ecommerce Datos del canal e-commerce.
 * @property stores Datos del canal de tiendas físicas.
 * @property accessLevel Nivel de acceso del usuario autenticado.
 *
 * @remarks
 * Este componente recibe los tres dominios de datos principales del módulo
 * de Retail junto con el nivel de acceso del usuario.
 *
 * Aunque en la implementación actual varios de estos datos no se consumen
 * directamente dentro del componente, forman parte del contrato de la página
 * para:
 * - mantener consistencia con la capa de servicios
 * - facilitar evolución futura
 * - permitir delegación de datos hacia componentes hijos
 */
type Props = {
  commercial:  CommercialData;
  ecommerce:   EcommerceData;
  stores:      StoresData;
  accessLevel: AccessLevel;
};

// ── Team accent ───────────────────────────────────────────────────────────────

/**
 * Configuración visual del bloque de equipo del módulo de Retail.
 *
 * @remarks
 * Este objeto centraliza la paleta y estilos semánticos aplicados
 * al componente {@link DepartmentTeamSection} para representar
 * la identidad visual del área de Retail.
 *
 * La configuración utiliza tonos índigo, violeta y púrpura
 * para transmitir una estética corporativa transversal y moderna,
 * coherente con un módulo multicanal.
 *
 * Centralizar esta configuración permite:
 * - mantener consistencia visual
 * - evitar duplicación de clases
 * - facilitar personalización por departamento
 */
const TEAM_ACCENT = {
  sectionBg:       "bg-white",
  sectionBorder:   "border-indigo-100",
  iconBg:          "bg-indigo-50",
  iconColor:       "text-indigo-600",
  iconBorder:      "border-indigo-100",
  barGradient:     "from-indigo-500 to-violet-500",
  pillBg:          "bg-indigo-50",
  pillBorder:      "border-indigo-100",
  pillText:        "text-indigo-600",
  hoverBorder:     "hover:border-indigo-200",
  dividerHover:    "group-hover:bg-indigo-100",
  avatarFrom:      "from-indigo-500",
  avatarTo:        "to-violet-600",
  avatarRing:      "ring-indigo-100",
  avatarRingHover: "group-hover:ring-indigo-200",
  lineColor:       "bg-indigo-200",
  titleColor:      "text-slate-900",
  subtitleColor:   "text-slate-400",
  topAccent:       "from-indigo-500 via-violet-400 to-purple-500",
} as const;

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Contenido principal de la homepage del módulo de Retail.
 *
 * @param props Propiedades del componente.
 * @param props.commercial Datos del canal comercial.
 * @param props.ecommerce Datos del canal de e-commerce.
 * @param props.stores Datos del canal de tiendas físicas.
 * @param props.accessLevel Nivel de acceso del usuario autenticado.
 * @returns La estructura principal renderizada de la vista de Retail.
 *
 * @remarks
 * Este componente actúa como coordinador principal de la experiencia
 * del módulo, construyendo la página en función de permisos
 * y de los canales operativos disponibles para el usuario.
 *
 * Su flujo interno puede resumirse en cinco etapas:
 *
 * 1. **Evaluación de permisos**
 *    Determina qué secciones y canales están habilitados
 *    usando la función {@link can}.
 *
 * 2. **Determinación de disponibilidad de canales**
 *    Establece si se debe mostrar la capa de navegación por tabs
 *    y cuáles paneles pueden montarse.
 *
 * 3. **Procesamiento de quick links**
 *    Filtra y adapta los accesos rápidos según el nivel de acceso
 *    usando {@link processQuickLinks}.
 *
 * 4. **Resolución del canal inicial**
 *    Define qué canal se mostrará por defecto al montar
 *    el contexto de navegación de Retail.
 *
 * 5. **Composición de la página**
 *    Ensambla:
 *    - hero institucional
 *    - KPI strip
 *    - quick links
 *    - paneles por canal
 *    - analítica cross-canal
 *    - sección de equipo
 *
 * ### Secciones principales renderizadas
 *
 * - Hero del módulo
 * - Franja de KPIs
 * - Accesos rápidos
 * - Panel Comercial
 * - Panel E-Commerce
 * - Panel Tiendas
 * - Dashboard analítico cross-canal
 * - Equipo del área
 *
 * ### Consideraciones de arquitectura
 *
 * - El componente permanece como **Server Component**
 * - Los paneles de canal se montan condicionalmente
 * - Los permisos gobiernan la visibilidad de bloques enteros
 * - Los quick links se procesan según reglas de acceso más finas
 * - El canal inicial depende del primer dominio disponible
 *
 * @example
 * ```tsx
 * <RetailPageContent
 *   commercial={commercial}
 *   ecommerce={ecommerce}
 *   stores={stores}
 *   accessLevel={accessLevel}
 * />
 * ```
 */
export default function RetailPageContent({ accessLevel }: Props) {

  /**
   * Controla la visibilidad de la franja de KPIs del módulo.
   */
  const showKPIs       = can(accessLevel, 'retail:view_kpis');

  /**
   * Controla la visibilidad del canal Comercial.
   */
  const showCommercial = can(accessLevel, 'retail:view_commercial');

  /**
   * Controla la visibilidad del canal E-Commerce.
   */
  const showEcommerce  = can(accessLevel, 'retail:view_ecommerce');

  /**
   * Controla la visibilidad del canal Tiendas.
   */
  const showStores     = can(accessLevel, 'retail:view_stores');

  /**
   * Controla la visibilidad del bloque de analítica transversal.
   */
  const showAnalytics  = can(accessLevel, 'retail:view_analytics');

  /**
   * Indica si existe al menos un canal operativo visible para el usuario.
   *
   * @remarks
   * Esta variable determina si debe renderizarse la infraestructura
   * de tabs y paneles de canal.
   */
  const showChannels = showCommercial || showEcommerce || showStores;

  /**
   * Accesos rápidos procesados según el nivel de acceso del usuario.
   *
   * @remarks
   * El arreglo resultante puede incluir accesos visibles, habilitados
   * o deshabilitados según la lógica definida en {@link processQuickLinks}.
   */
  const processedRetailLinks = processQuickLinks(retailQuickLinks, accessLevel);

  /**
   * Indica si debe mostrarse la sección de quick links.
   *
   * @remarks
   * Solo se renderiza cuando el procesamiento de accesos genera
   * al menos un elemento visible para el usuario actual.
   */
  const showQuickLinks       = processedRetailLinks.length > 0;

  /**
   * Canal visible por defecto dentro del provider de Retail.
   *
   * @remarks
   * Se resuelve a partir del primer canal disponible según permisos,
   * siguiendo este orden de prioridad:
   * - comercial
   * - e-commerce
   * - tiendas
   *
   * Esto garantiza que el provider arranque siempre
   * con un canal visible y válido.
   */
  const defaultChannel = showCommercial ? "comercial"
    : showEcommerce                     ? "ecommerce"
    : "tiendas";

  return (
    <main
      className="min-h-screen w-full bg-[#f4f6f9]"
      style={{ fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
    >
      {/* ── HERO — todos ──────────────────────────────────────────── */}
      <DepartmentHeroBanner
        breadcrumb="Departamentos · Retail"
        title="Retail"
        subtitle="Visión unificada de los canales comercial, e-commerce y tiendas físicas."
        imageSrc="/images/retail-banner.jpg"
        gradientFrom="from-indigo-900/88"
        gradientVia="via-violet-900/78"
        gradientTo="to-slate-900/70"
        dotPatternId="retail-dots"
        pills={[
          { type: "status", text: "3 canales activos" },
          { type: "info",   text: "Actualizado hace 2 min" },
        ]}
        ctaLinks={[
          // CTAs de gestión solo para retail+
          ...(showCommercial ? [
            { href: "/retail/pipeline", label: "Ver pipeline",     variant: "ghost" as const },
            { href: "/retail/pedidos",  label: "Pedidos globales", variant: "solid" as const },
          ] : []),
        ]}
      />

      <div className="px-4 pb-12 lg:px-14">

        {/* ── KPI STRIP — manager+ ──────────────────────────────────── */}
        {showKPIs && <RetailKPIStrip />}

        {/* ── QUICK LINKS — oculto si no hay links disponibles ─────────── */}
        {showQuickLinks && (
          <AnimatedViewCard className="mt-6">
            <QuickLinksSection
              title="Accesos rápidos · Retail"
              quickLinks={processedRetailLinks}
            />
          </AnimatedViewCard>
        )}

        {/* ── PANELES DE CANAL — retail + admin ─────────────────────── */}
        {showChannels && (
          <RetailChannelProvider defaultChannel={defaultChannel}>

            <RetailChannelTabsBar
              showCommercial={showCommercial}
              showEcommerce={showEcommerce}
              showStores={showStores}
            />

            {showCommercial && (
              <CommercialPanel>
                <AnimatedSection className="grid grid-cols-1 gap-6 lg:grid-cols-12 mb-6">
                  <div className="lg:col-span-8 flex flex-col gap-6">
                    <AnimatedCard delay={0}>
                      <CommercialSalesSection />
                    </AnimatedCard>
                    <AnimatedCard delay={0.1}>
                      <CommercialPipelineCard />
                    </AnimatedCard>
                    <AnimatedCard delay={0.2}>
                      <CommercialOrdersCard />
                    </AnimatedCard>
                  </div>
                  <AnimatedSection delay={0.1} stagger={0.08} className="lg:col-span-4 flex flex-col gap-5">
                    <AnimatedCard delay={0.05}>
                      <CommercialGoalsCard />
                    </AnimatedCard>
                    <AnimatedCard delay={0.13}>
                      <CommercialAlertsCard />
                    </AnimatedCard>
                  </AnimatedSection>
                </AnimatedSection>
              </CommercialPanel>
            )}

            {showEcommerce && (
              <EcommercePanel>
                <AnimatedSection className="grid grid-cols-1 gap-6 lg:grid-cols-12 mb-6">
                  <div className="lg:col-span-8 flex flex-col gap-6">
                    <AnimatedCard delay={0}>
                      <EcommerceCatalogCard />
                    </AnimatedCard>
                    <AnimatedCard delay={0.1}>
                      <EcommerceOrdersCard />
                    </AnimatedCard>
                  </div>
                  <AnimatedSection delay={0.1} stagger={0.08} className="lg:col-span-4 flex flex-col gap-5">
                    <AnimatedCard delay={0.05}>
                      <EcommerceAlertsCard />
                    </AnimatedCard>
                    <AnimatedCard delay={0.13}>
                      <EcommerceReviewsCard />
                    </AnimatedCard>
                  </AnimatedSection>
                </AnimatedSection>
              </EcommercePanel>
            )}

            {showStores && (
              <TiendasPanel>
                <AnimatedCard delay={0} className="mb-6">
                  <TiendasOpsCenter />
                </AnimatedCard>
                <AnimatedCard delay={0} className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50">
                      <TrendingUp className="h-3.5 w-3.5 text-indigo-600" />
                    </span>
                    <h2 className="text-sm font-semibold text-slate-700">Ventas por tienda</h2>
                    <span className="text-[11px] text-slate-400">— rendimiento en tiempo real vs objetivo</span>
                  </div>
                  <TiendasSalesTable />
                </AnimatedCard>
                <AnimatedSection className="grid grid-cols-1 gap-6 lg:grid-cols-12 mb-6" delay={0.1} stagger={0.1}>
                  <AnimatedCard delay={0} className="lg:col-span-8">
                    <TiendasStoreGrid />
                  </AnimatedCard>
                  <AnimatedSection delay={0.1} stagger={0.08} className="lg:col-span-4 flex flex-col gap-5">
                    <AnimatedCard delay={0.05}>
                      <TiendasRankingCard />
                    </AnimatedCard>
                    <AnimatedCard delay={0.13}>
                      <TiendasReplenishmentCard />
                    </AnimatedCard>
                  </AnimatedSection>
                </AnimatedSection>
              </TiendasPanel>
            )}

          </RetailChannelProvider>
        )}

        {/* ── ANALÍTICA CROSS-CANAL — retail + admin ────────────────── */}
        {showAnalytics && (
          <AnimatedViewCard className="mt-6 border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
                  <BarChart2 className="h-3.5 w-3.5 text-indigo-600" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">Analítica Retail · Cross-Canal</h2>
                  <p className="text-[11px] text-slate-400">
                    Tendencias de ventas B2B, tráfico online y facturación en tienda
                  </p>
                </div>
              </div>
              <span className="hidden md:inline-flex items-center rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-[11px] font-semibold text-indigo-600">
                Actualizado hoy
              </span>
            </div>
            <RetailDashboard />
          </AnimatedViewCard>
        )}

        {/* ── EQUIPO — todos ────────────────────────────────────────── */}
        <AnimatedViewCard className="mt-6">
          <DepartmentTeamSection
            members={retailTeam}
            title="Conoce al equipo Retail"
            subtitle="Los equipos comercial, digital y de tiendas que impulsan todos los canales."
            accent={TEAM_ACCENT}
          />
        </AnimatedViewCard>

      </div>
    </main>
  );
}