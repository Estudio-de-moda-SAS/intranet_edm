// app/it/components/ITHomePage.tsx
// SERVER COMPONENT
//
// Guards aplicados:
//   Hero + Equipo + Quick Links    → todos        (employee+)
//   KPI Strip + Tickets            → manager+     (it:view_kpis)
//   Dashboard + Estado Servicios   → it + admin   (it:view_dashboard)
//   Monitor de Servidores          → it + admin   (it:view_server_monitor)

import { QuickLinksSection }  from "@/app/components/ui/QuickLinksSection";
import ITDashboardSection      from "./ITDashboardSection";
import ServiceStatusCard       from "./ServiceStatusCard";
import ServerMonitorPanel      from "./ServerMonitorPanel";
import ITTicketsCard           from "./ITTicketsCard";
import ITTicketController      from "./ITTicketController";

import { itQuickLinks }        from "../config/itQuickLinks";
import { processQuickLinks }   from "@/lib/quickLinksAccess";
import { DepartmentTeamSection } from "@/app/components/team/DepartmentTeamSection";
import { itTeam }              from "../config/itTeam";
import type { ITData }         from "@/lib/graph/departments/it.service";

import { DepartmentHeroBanner } from "@/app/components/ui/animated/DepartmentHeroBanner";
import { AnimatedCard }         from "@/app/components/ui/animated/AnimatedCard";
import { AnimatedSection }      from "@/app/components/ui/animated/AnimatedSection";
import { AnimatedViewCard }     from "@/app/components/ui/animated/AnimatedViewCard";
import { ITKPIStrip }           from "./ITKPIStrip";

import { can, type AccessLevel } from "@/lib/roles";

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  data:        ITData;
  accessLevel: AccessLevel;
};

// ── Team accent ───────────────────────────────────────────────────────────────

const TEAM_ACCENT = {
  sectionBg:       "bg-white",
  sectionBorder:   "border-indigo-100",
  iconBg:          "bg-indigo-50",
  iconColor:       "text-indigo-600",
  iconBorder:      "border-indigo-100",
  barGradient:     "from-slate-700 to-indigo-600",
  pillBg:          "bg-indigo-50",
  pillBorder:      "border-indigo-100",
  pillText:        "text-indigo-600",
  hoverBorder:     "hover:border-indigo-200",
  dividerHover:    "group-hover:bg-indigo-100",
  avatarFrom:      "from-slate-700",
  avatarTo:        "to-indigo-700",
  avatarRing:      "ring-indigo-100",
  avatarRingHover: "group-hover:ring-indigo-200",
  lineColor:       "bg-indigo-200",
  titleColor:      "text-slate-900",
  subtitleColor:   "text-slate-400",
  topAccent:       "from-slate-600 via-indigo-500 to-sky-500",
} as const;

// ── Component ─────────────────────────────────────────────────────────────────

export default function ITPageContent({ data, accessLevel }: Props) {

  const showKPIs          = can(accessLevel, 'it:view_kpis');
  const showTickets       = can(accessLevel, 'it:view_tickets');
  const showDashboard     = can(accessLevel, 'it:view_dashboard');
  const showServiceStatus = can(accessLevel, 'it:view_service_status');
  const processedITLinks  = processQuickLinks(itQuickLinks, accessLevel);
  const showQuickLinks         = processedITLinks.length > 0;
  const showServerMonitor = can(accessLevel, 'it:view_server_monitor');

  // ¿Hay contenido en la columna principal?
  const showMainCol = showDashboard || showServiceStatus;
  // ¿Hay contenido en el aside?
  const showAside   = showTickets;
  // Layout dinámico
  const mainColClass    = showAside   ? "lg:col-span-8" : "lg:col-span-12";
  const asideColClass   = showMainCol ? "lg:col-span-4" : "lg:col-span-12";

  return (
    <main
      className="min-h-screen w-full bg-[#f4f6f9]"
      style={{
        fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {/* ── HERO — todos ──────────────────────────────────────────── */}
      <DepartmentHeroBanner
        breadcrumb="Departamentos · TI"
        title="Tecnología de la Información"
        subtitle="Monitoreo de infraestructura, gestión de sistemas y soporte técnico en tiempo real."
        imageSrc="/images/it-banner.jpg"
        gradientFrom="from-slate-900/85"
        gradientVia="via-slate-800/75"
        gradientTo="to-indigo-900/70"
        dotPatternId="it-dots"
        pills={[
          { type: "status", text: "Todos los sistemas operativos" },
          { type: "info",   text: "Última actualización: hace 2 min" },
        ]}
        actions={<ITTicketController />}
      />

      <div className="px-4 pb-10 lg:px-14">

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