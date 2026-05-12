/**
 * @module ITHomePage
 * Página principal del módulo de Tecnología de la Información.
 *
 * @remarks
 * Este módulo compone la vista principal del área de TI, organizando
 * secciones del dashboard según el nivel de acceso del usuario.
 *
 * Incluye:
 * - Hero principal del departamento
 * - Acciones rápidas para creación de tickets
 * - Franja de KPIs
 * - Dashboard operativo
 * - Estado de servicios
 * - Tarjeta de tickets
 * - Monitor de servidores
 * - Sección del equipo de TI
 *
 * El contenido visible se controla mediante permisos evaluados con
 * la función {@link can}, permitiendo una renderización condicional
 * por rol o nivel de acceso.
 */

// app/it/components/ITHomePage.tsx
// SERVER COMPONENT
//
// Guards aplicados:
//   Hero + Equipo + Quick Links    → todos        (employee+)
//   KPI Strip + Tickets            → manager+     (it:view_kpis)
//   Dashboard + Estado Servicios   → it + admin   (it:view_dashboard)
//   Monitor de Servidores          → it + admin   (it:view_server_monitor)

import { QuickLinksSection } from "@/app/components/ui/QuickLinksSection";
import { ITDashboardSection } from "./dashboard-section/ITDashboardSection";
import ServiceStatusCard from "./ServiceStatusCard";
import ServerMonitorPanel from "./ServerMonitorPanel";
import ITTicketsCard from "./ITTicketsCard";
import ITTicketController from "./ITTicketController";

import { itQuickLinks } from "../config/itQuickLinks";
import { processQuickLinks } from "@/lib/quickLinksAccess";
import { DepartmentTeamSection } from "@/app/components/team/DepartmentTeamSection";
import { itTeam } from "../config/itTeam";
import type { ITData } from "@/lib/graph/departments/it.service";

import { DepartmentHeroBanner } from "@/app/components/ui/animated/DepartmentHeroBanner";
import { AnimatedCard } from "@/app/components/ui/animated/AnimatedCard";
import { AnimatedSection } from "@/app/components/ui/animated/AnimatedSection";
import { AnimatedViewCard } from "@/app/components/ui/animated/AnimatedViewCard";
import { ITKPIStrip } from "./ITKPIStrip";

import { can, type AccessLevel } from "@/lib/roles";

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Props del componente {@link ITPageContent}.
 *
 * @property data Datos consolidados del módulo de TI.
 * @property accessLevel Nivel de acceso actual del usuario.
 */
type Props = {
  data: ITData;
  accessLevel: AccessLevel;
};

// ── Team accent ───────────────────────────────────────────────────────────────

/**
 * Configuración visual de acento para la sección del equipo de TI.
 *
 * @remarks
 * Este objeto centraliza colores, gradientes, bordes y estilos decorativos
 * aplicados al bloque del equipo, permitiendo mantener consistencia visual
 * con la identidad del departamento.
 */
const TEAM_ACCENT = {
  sectionBg: "bg-white",
  sectionBorder: "border-indigo-100",
  iconBg: "bg-indigo-50",
  iconColor: "text-indigo-600",
  iconBorder: "border-indigo-100",
  barGradient: "from-slate-700 to-indigo-600",
  pillBg: "bg-indigo-50",
  pillBorder: "border-indigo-100",
  pillText: "text-indigo-600",
  hoverBorder: "hover:border-indigo-200",
  dividerHover: "group-hover:bg-indigo-100",
  avatarFrom: "from-slate-700",
  avatarTo: "to-indigo-700",
  avatarRing: "ring-indigo-100",
  avatarRingHover: "group-hover:ring-indigo-200",
  lineColor: "bg-indigo-200",
  titleColor: "text-slate-900",
  subtitleColor: "text-slate-400",
  topAccent: "from-slate-600 via-indigo-500 to-sky-500",
} as const;

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Contenido principal de la página inicial del área de TI.
 *
 * @param props Propiedades del componente.
 * @returns Vista principal del dashboard de TI con renderizado condicional por permisos.
 *
 * @remarks
 * Este componente coordina toda la composición de la home del módulo de TI.
 *
 * Responsabilidades principales:
 * - Evaluar permisos según el nivel de acceso
 * - Determinar qué secciones deben mostrarse
 * - Construir un layout dinámico de columnas
 * - Integrar componentes animados del dashboard
 * - Pasar datos a subsecciones como tickets y estado de servicios
 *
 * Reglas de visibilidad:
 * - Hero y equipo: visibles para todos
 * - KPI strip y tickets: visibles para perfiles manager+
 * - Dashboard y estado de servicios: visibles para perfiles IT y admin
 * - Monitor de servidores: visible para perfiles IT y admin
 *
 * @example
 * ```tsx
 * <ITPageContent data={data} accessLevel={accessLevel} />
 * ```
 */
export default function ITPageContent({ data, accessLevel }: Props) {
  const showKPIs = can(accessLevel, "it:view_kpis");
  const showTickets = can(accessLevel, "it:view_tickets");
  const showDashboard = can(accessLevel, "it:view_dashboard");
  const showServiceStatus = can(accessLevel, "it:view_service_status");
  const processedITLinks = processQuickLinks(itQuickLinks, accessLevel);
  const showQuickLinks = processedITLinks.length > 0;
  const showServerMonitor = can(accessLevel, "it:view_server_monitor");

  /**
   * Indica si existe contenido para la columna principal.
   *
   * @remarks
   * La columna principal agrupa dashboard operativo y estado de servicios.
   */
  const showMainCol = showDashboard || showServiceStatus;

  /**
   * Indica si existe contenido para la columna lateral.
   *
   * @remarks
   * El aside contiene accesos rápidos y tarjeta de tickets.
   */
  const showAside = showTickets;

  /**
   * Clase dinámica de la columna principal.
   *
   * @remarks
   * Si existe aside, la columna principal ocupa menos espacio.
   * En caso contrario, se expande al ancho completo.
   */
  const mainColClass = showAside ? "lg:col-span-8" : "lg:col-span-12";

  /**
   * Clase dinámica de la columna lateral.
   *
   * @remarks
   * Si no existe contenido en la columna principal, el aside se expande.
   */
  const asideColClass = showMainCol ? "lg:col-span-4" : "lg:col-span-12";

  return (
    <main
      className="min-h-screen w-full bg-[#f4f6f9]"
      style={{
        fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {/* ── HERO — todos ──────────────────────────────────────────── */}
      <DepartmentHeroBanner
        title="Tecnología de la Información"
        subtitle="Monitoreo de infraestructura, gestión de sistemas y soporte técnico en tiempo real."
        imageSrc="/images/it-banner.jpg"
        gradientFrom="from-slate-900/85"
        gradientVia="via-slate-800/75"
        gradientTo="to-indigo-900/70"
        dotPatternId="it-dots"
        pills={[
          { type: "status", text: "Todos los sistemas operativos" },
          { type: "info", text: "Última actualización: hace 2 min" },
        ]}
        actions={<ITTicketController />}
      />

<div className="px-6 pb-10">
        {/* ── KPI STRIP — manager+ ──────────────────────────────────── */}
        {showKPIs && <ITKPIStrip />}

        {/* ── GRID — it + admin (main) / manager+ (aside) ───────────── */}
        {(showMainCol || showAside) && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Columna principal — it + admin */}
            {showMainCol && (
              <div className={`${mainColClass} flex flex-col gap-6`}>
                {showDashboard && (
                  <AnimatedCard delay={0}>
                    <ITDashboardSection />
                  </AnimatedCard>
                )}

                {showServiceStatus && (
                  <AnimatedCard delay={0.08}>
                    <ServiceStatusCard services={data.services} />
                  </AnimatedCard>
                )}
              </div>
            )}

            {/* Aside — manager+ */}
            {showAside && (
              <AnimatedSection
                delay={0.1}
                stagger={0.08}
                className={`${asideColClass} flex flex-col gap-5`}
              >
                {showQuickLinks && (
                  <AnimatedCard delay={0.13}>
                    <QuickLinksSection
                      title="Accesos rápidos · TI"
                      quickLinks={processedITLinks}
                    />
                  </AnimatedCard>
                )}

                <AnimatedCard delay={0.05}>
                  <ITTicketsCard data={data} />
                </AnimatedCard>
              </AnimatedSection>
            )}
          </div>
        )}

        {/* ── MONITOR SERVIDORES — it + admin ───────────────────────── */}
        {showServerMonitor && (
          <AnimatedViewCard className="mt-6">
            <ServerMonitorPanel />
          </AnimatedViewCard>
        )}

        {/* ── EQUIPO — todos ────────────────────────────────────────── */}
        <AnimatedViewCard className="mt-6">
          <DepartmentTeamSection
            members={itTeam}
            title="Conoce al equipo de TI"
            subtitle="Las personas que mantienen nuestra infraestructura y sistemas operativos."
            accent={TEAM_ACCENT}
          />
        </AnimatedViewCard>
      </div>
    </main>
  );
}