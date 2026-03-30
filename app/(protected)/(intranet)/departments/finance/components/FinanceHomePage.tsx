// app/finance/components/FinancePageContent.tsx
// SERVER COMPONENT — sin "use client"
//
// Guards aplicados por sección:
//   Hero                → todos        (employee+)
//   KPI Strip           → manager+     (finance:view_kpis)
//   AnnouncementBanner  → todos        (employee+)  ← debajo de KPIs
//   Módulos             → finance+     (finance:view_modules)
//   Alertas             → finance+     (finance:view_alerts)
//   Tools               → finance+     (finance:view_tools)
//   Quick Links         → finance+     (finance:view_modules)
//   CalendarCard        → finance+     (finance:view_modules)
//   Panel Financiero    → manager+     (finance:view_dashboard)
//   ExportToolbar       → finance+     (finance:create_report)
//   ActivityFeed        → manager+     (finance:view_dashboard)
//   Botón Ver Reportes  → manager+     (finance:view_reports)
//   Botón Nuevo Reporte → finance+     (finance:create_report)
//   Equipo              → todos        (employee+)

import { BarChart2 }                    from "lucide-react";
import { QuickLinksSection }             from "@/app/components/ui/QuickLinksSection";
import FinanceModulesSection             from "../components/FinanceModulesSection";
import FinanceAlertsCard                 from "../components/FinanceAlertsCard";
import FinanceToolsCard                  from "../components/FinanceToolsCard";
import FinanceDashboard                  from "../components/FinanceDashboard";
import { financeQuickLinks }             from "../config/financeQuickLinks";
import { DepartmentTeamSection }         from "@/app/components/team/DepartmentTeamSection";
import { financeTeam }                   from "../config/financeTeam";
import type { FinanceData }              from "@/lib/graph/departments/finance.service";
import { DepartmentHeroBanner }          from "@/app/components/ui/animated/DepartmentHeroBanner";
import { AnimatedCard }                  from "@/app/components/ui/animated/AnimatedCard";
import { AnimatedSection }               from "@/app/components/ui/animated/AnimatedSection";
import { AnimatedViewCard }              from "@/app/components/ui/animated/AnimatedViewCard";
import { FinanceKPIStrip }               from "./FinanceKPIStrip";
import { can, type AccessLevel }         from "@/lib/roles";

// Nuevos componentes
import { FinanceAnnouncementBanner }     from "../components/FinanceAnnouncementBanner";
import { FinanceCalendarCard }           from "../components/FinanceCalendarCard";
import { FinanceActivityFeed }           from "../components/FinanceActivityFeed";
import { FinanceExportToolbar }          from "../components/FinanceExportToolbar";

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  data:        FinanceData;
  accessLevel: AccessLevel;
};

// ── Team accent ───────────────────────────────────────────────────────────────

const TEAM_ACCENT = {
  sectionBg:       "bg-white",
  sectionBorder:   "border-violet-100",
  iconBg:          "bg-violet-50",
  iconColor:       "text-violet-600",
  iconBorder:      "border-violet-100",
  barGradient:     "from-violet-500 to-fuchsia-500",
  pillBg:          "bg-violet-50",
  pillBorder:      "border-violet-100",
  pillText:        "text-violet-600",
  hoverBorder:     "hover:border-violet-200",
  dividerHover:    "group-hover:bg-violet-100",
  avatarFrom:      "from-violet-500",
  avatarTo:        "to-fuchsia-600",
  avatarRing:      "ring-violet-100",
  avatarRingHover: "group-hover:ring-violet-200",
  lineColor:       "bg-violet-200",
  titleColor:      "text-slate-900",
  subtitleColor:   "text-slate-400",
  topAccent:       "from-violet-500 via-fuchsia-400 to-purple-500",
} as const;

// ── CTAs según nivel ──────────────────────────────────────────────────────────

function buildCtaLinks(accessLevel: AccessLevel) {
  const links: { href: string; label: string; variant: "ghost" | "solid" }[] = [];
  if (can(accessLevel, "finance:view_reports"))
    links.push({ href: "/finance/reports",     label: "Ver reportes",  variant: "ghost" });
  if (can(accessLevel, "finance:create_report"))
    links.push({ href: "/finance/reports/new", label: "Nuevo reporte", variant: "solid" });
  return links;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function FinancePageContent({ accessLevel }: Props) {

  const ctaLinks    = buildCtaLinks(accessLevel);

  // Guards existentes
  const showKPIs    = can(accessLevel, "finance:view_kpis");
  const showMain    = can(accessLevel, "finance:view_modules");
  const showAlerts  = can(accessLevel, "finance:view_alerts");
  const showTools   = can(accessLevel, "finance:view_tools");
  const showLinks   = can(accessLevel, "finance:view_modules");
  const showPanel   = can(accessLevel, "finance:view_dashboard");

  // Guards nuevos
  const showCalendar  = can(accessLevel, "finance:view_modules");   // finance+
  const showActivity  = can(accessLevel, "finance:view_dashboard"); // manager+
  const showExport    = can(accessLevel, "finance:create_report");  // finance:create_report

  // Layout
  const showAside    = showAlerts || showLinks || showTools || showCalendar;
  const showGrid     = showMain   || showAside;
  const mainColClass  = showAside  ? "lg:col-span-8" : "lg:col-span-12";
  const asideColClass = showMain   ? "lg:col-span-4" : "lg:col-span-12";
  const asideInnerClass = (!showMain && showAside)
    ? "flex flex-col lg:flex-row gap-5"
    : "flex flex-col gap-5";

  return (
    <main
      className="min-h-screen w-full bg-[#f4f6f9]"
      style={{ fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
    >

      {/* ── Hero — todos ──────────────────────────────────────────── */}
      <DepartmentHeroBanner
        breadcrumb="Departamentos · Finanzas"
        title="Gestión Financiera"
        subtitle="Control presupuestario, reportes y seguimiento operativo en tiempo real."
        imageSrc="/images/finance-banner.jpg"
        gradientFrom="from-violet-900/85"
        gradientVia="via-violet-800/75"
        gradientTo="to-fuchsia-800/70"
        dotPatternId="fin-dots"
        pills={[
          { type: "status", text: "Cierre mensual al día" },
          { type: "info",   text: "Última sincronización: hace 5 min" },
        ]}
        ctaLinks={ctaLinks}
      />

      <div className="px-4 pb-10 lg:px-14">
        <FinanceAnnouncementBanner className="-mt-2" />

        {/* ── KPI Strip — manager+ ──────────────────────────────────── */}
        {showKPIs && <FinanceKPIStrip />}

        {/* ── Comunicados — todos (pegado debajo de KPIs) ──────────── */}

        {/* ── Grid principal ────────────────────────────────────────── */}
        {showGrid && (
          <AnimatedSection className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">

            {/* Columna principal — finance+ */}
            {showMain && (
              <div className={`${mainColClass} space-y-6`}>
                <AnimatedCard delay={0}>
                  <FinanceModulesSection />
                </AnimatedCard>
                {/* ── Activity Feed — manager+ (debajo de módulos) ──── */}
                {showActivity && (
                  <AnimatedCard delay={0.1}>
                    <FinanceActivityFeed limit={7} />
                  </AnimatedCard>
                )}
              </div>
            )}

            {/* Aside — finance+ */}
            {showAside && (
              <AnimatedSection
                delay={0.1}
                stagger={0.08}
                className={`${asideColClass} ${asideInnerClass}`}
              >
                {showAlerts && (
                  <AnimatedCard delay={0.05}>
                    <FinanceAlertsCard />
                  </AnimatedCard>
                )}
                {showLinks && (
                  <AnimatedCard delay={0.13}>
                    <QuickLinksSection
                      title="Accesos rápidos · Finanzas"
                      quickLinks={financeQuickLinks}
                    />
                  </AnimatedCard>
                )}
                {showTools && (
                  <AnimatedCard delay={0.21}>
                    <FinanceToolsCard />
                  </AnimatedCard>
                )}
                {/* ── Calendario — finance+ (nuevo) ─────────────────── */}
                {showCalendar && (
                  <AnimatedCard delay={0.29}>
                    <FinanceCalendarCard />
                  </AnimatedCard>
                )}
              </AnimatedSection>
            )}

          </AnimatedSection>
        )}

        {/* ── Panel Financiero — manager+ ───────────────────────────── */}
        {showPanel && (
          <AnimatedViewCard className="mt-6 border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
                  <BarChart2 className="h-3.5 w-3.5 text-violet-600" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">Panel Financiero</h2>
                  <p className="text-[11px] text-slate-400">
                    Visualización estratégica de ingresos, gastos y actividad reciente
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden md:inline-flex items-center rounded-full bg-violet-50 border border-violet-100 px-3 py-1 text-[11px] font-semibold text-violet-600">
                  Actualizado hoy
                </span>
                {/* ── Export Toolbar — finance:create_report (nuevo) ─── */}
                {showExport && (
                  <FinanceExportToolbar periodLabel="Q1 2025" />
                )}
              </div>
            </div>
            <FinanceDashboard />
          </AnimatedViewCard>
        )}

        {/* ── Equipo — todos ────────────────────────────────────────── */}
        <AnimatedViewCard className="mt-6">
          <DepartmentTeamSection
            members={financeTeam}
            title="Conoce al equipo de Finanzas"
            subtitle="Las personas que gestionan la salud financiera de la organización."
            accent={TEAM_ACCENT}
          />
        </AnimatedViewCard>

      </div>
    </main>
  );
}