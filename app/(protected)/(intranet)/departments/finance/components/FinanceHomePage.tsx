/**
 * @module FinanceHomePage
 * Página principal del módulo financiero con composición condicional por permisos.
 *
 * @remarks
 * Este componente actúa como punto de entrada visual del área de Finanzas
 * y organiza los distintos bloques funcionales de la home del módulo.
 *
 * Su responsabilidad principal es:
 *
 * - estructurar la vista general del departamento
 * - decidir qué secciones renderizar según el nivel de acceso
 * - integrar componentes informativos, operativos y analíticos
 * - coordinar la distribución del layout principal
 *
 * La página combina contenido transversal para todos los usuarios
 * con paneles restringidos por permisos específicos del dominio financiero.
 */

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

import { BarChart2 } from "lucide-react";
import { QuickLinksSection } from "@/app/components/ui/QuickLinksSection";
import FinanceModulesSection from "../components/FinanceModulesSection";
import FinanceAlertsCard from "../components/FinanceAlertsCard";
import FinanceToolsCard from "../components/FinanceToolsCard";
import FinanceDashboard from "../components/FinanceDashboard";
import { financeQuickLinks } from "../config/financeQuickLinks";
import { DepartmentTeamSection } from "@/app/components/team/DepartmentTeamSection";
import { financeTeam } from "../config/financeTeam";
import type { FinanceData } from "@/lib/graph/departments/finance.service";
import { DepartmentHeroBanner } from "@/app/components/ui/animated/DepartmentHeroBanner";
import { AnimatedCard } from "@/app/components/ui/animated/AnimatedCard";
import { AnimatedSection } from "@/app/components/ui/animated/AnimatedSection";
import { AnimatedViewCard } from "@/app/components/ui/animated/AnimatedViewCard";
import { FinanceKPIStrip } from "./FinanceKPIStrip";
import { can, type AccessLevel } from "@/lib/roles";

// Nuevos componentes
import { FinanceAnnouncementBanner } from "../components/FinanceAnnouncementBanner";
import { FinanceCalendarCard } from "../components/FinanceCalendarCard";
import { FinanceActivityFeed } from "../components/FinanceActivityFeed";
import { FinanceExportToolbar } from "../components/FinanceExportToolbar";

/* -------------------------------------------------------------------------- */
/* Tipos                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Props del componente {@link FinancePageContent}.
 *
 * @property data Datos consolidados del módulo financiero.
 * @property accessLevel Nivel de acceso efectivo del usuario autenticado.
 *
 * @remarks
 * Aunque actualmente `data` no se consume de forma explícita
 * dentro del cuerpo del componente, forma parte del contrato
 * del contenedor y puede ser utilizada por futuras secciones
 * o componentes subordinados.
 */
type Props = {
  data: FinanceData;
  accessLevel: AccessLevel;
};

/* -------------------------------------------------------------------------- */
/* Configuración visual del equipo                                             */
/* -------------------------------------------------------------------------- */

/**
 * Configuración visual aplicada a la sección de equipo.
 *
 * @remarks
 * Este objeto centraliza la identidad visual específica
 * del bloque "Conoce al equipo de Finanzas", permitiendo
 * mantener consistencia cromática y de interacción.
 */
const TEAM_ACCENT = {
  sectionBg: "bg-white",
  sectionBorder: "border-violet-100",
  iconBg: "bg-violet-50",
  iconColor: "text-violet-600",
  iconBorder: "border-violet-100",
  barGradient: "from-violet-500 to-fuchsia-500",
  pillBg: "bg-violet-50",
  pillBorder: "border-violet-100",
  pillText: "text-violet-600",
  hoverBorder: "hover:border-violet-200",
  dividerHover: "group-hover:bg-violet-100",
  avatarFrom: "from-violet-500",
  avatarTo: "to-fuchsia-600",
  avatarRing: "ring-violet-100",
  avatarRingHover: "group-hover:ring-violet-200",
  lineColor: "bg-violet-200",
  titleColor: "text-slate-900",
  subtitleColor: "text-slate-400",
  topAccent: "from-violet-500 via-fuchsia-400 to-purple-500",
} as const;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Construye la lista de CTAs disponibles en el hero
 * según el nivel de acceso del usuario.
 *
 * @param accessLevel Nivel de acceso actual.
 * @returns Lista de enlaces de acción visibles en el banner principal.
 *
 * @remarks
 * Reglas aplicadas:
 *
 * - `finance:view_reports` habilita "Ver reportes"
 * - `finance:create_report` habilita "Nuevo reporte"
 *
 * La función desacopla la lógica de permisos de la construcción
 * del componente visual del hero banner.
 */
function buildCtaLinks(accessLevel: AccessLevel) {
  const links: { href: string; label: string; variant: "ghost" | "solid" }[] = [];

  if (can(accessLevel, "finance:view_reports")) {
    links.push({
      href: "/finance/reports",
      label: "Ver reportes",
      variant: "ghost",
    });
  }

  if (can(accessLevel, "finance:create_report")) {
    links.push({
      href: "/finance/reports/new",
      label: "Nuevo reporte",
      variant: "solid",
    });
  }

  return links;
}

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Contenido principal de la home del departamento financiero.
 *
 * @param props Propiedades del componente.
 * @returns Página compuesta del módulo financiero con secciones condicionadas por permisos.
 *
 * @remarks
 * Este componente organiza la pantalla en varios niveles:
 *
 * 1. Hero institucional del módulo
 * 2. Comunicados y KPIs
 * 3. Grid principal con módulos y panel lateral
 * 4. Panel financiero analítico
 * 5. Sección de equipo
 *
 * Además, resuelve de forma centralizada la lógica de visibilidad
 * de cada bloque a partir del sistema de permisos.
 *
 * Flujo general:
 *
 * - se construyen CTAs según permisos
 * - se evalúan guards por sección
 * - se calculan clases de layout derivadas del contenido visible
 * - se renderizan los bloques correspondientes
 *
 * @example
 * ```tsx
 * <FinancePageContent data={data} accessLevel={accessLevel} />
 * ```
 */
export default function FinancePageContent({ accessLevel }: Props) {
  /**
   * Enlaces de acción visibles en el hero banner.
   */
  const ctaLinks = buildCtaLinks(accessLevel);

  /* ------------------------------------------------------------------------ */
  /* Guards base                                                              */
  /* ------------------------------------------------------------------------ */

  /**
   * Indica si el usuario puede visualizar la franja de KPIs.
   */
  const showKPIs = can(accessLevel, "finance:view_kpis");

  /**
   * Indica si se debe renderizar la columna principal
   * con módulos funcionales del área.
   */
  const showMain = can(accessLevel, "finance:view_modules");

  /**
   * Indica si el bloque de alertas está habilitado.
   */
  const showAlerts = can(accessLevel, "finance:view_alerts");

  /**
   * Indica si el bloque de herramientas financieras está habilitado.
   */
  const showTools = can(accessLevel, "finance:view_tools");

  /**
   * Indica si se deben mostrar accesos rápidos del módulo.
   */
  const showLinks = can(accessLevel, "finance:view_modules");

  /**
   * Indica si el panel analítico financiero completo
   * está disponible para el usuario.
   */
  const showPanel = can(accessLevel, "finance:view_dashboard");

  /* ------------------------------------------------------------------------ */
  /* Guards complementarios                                                   */
  /* ------------------------------------------------------------------------ */

  /**
   * Indica si la tarjeta de calendario financiero debe mostrarse.
   */
  const showCalendar = can(accessLevel, "finance:view_modules");

  /**
   * Indica si el feed de actividad reciente está habilitado.
   */
  const showActivity = can(accessLevel, "finance:view_dashboard");

  /**
   * Indica si la barra de exportación debe mostrarse.
   */
  const showExport = can(accessLevel, "finance:create_report");

  /* ------------------------------------------------------------------------ */
  /* Layout derivado                                                          */
  /* ------------------------------------------------------------------------ */

  /**
   * Indica si existe contenido visible en la columna lateral.
   *
   * @remarks
   * Se usa para decidir la estructura final del grid principal.
   */
  const showAside = showAlerts || showLinks || showTools || showCalendar;

  /**
   * Indica si debe renderizarse el grid principal.
   */
  const showGrid = showMain || showAside;

  /**
   * Clase de columnas para la sección principal del grid.
   *
   * @remarks
   * Si existe aside, la columna principal ocupa 8 columnas.
   * En caso contrario, ocupa el ancho completo.
   */
  const mainColClass = showAside ? "lg:col-span-8" : "lg:col-span-12";

  /**
   * Clase de columnas para el aside del grid principal.
   */
  const asideColClass = showMain ? "lg:col-span-4" : "lg:col-span-12";

  /**
   * Distribución interna del aside según el contenido visible.
   *
   * @remarks
   * Si no existe columna principal, el aside puede adaptarse
   * a un flujo horizontal en pantallas grandes.
   */
  const asideInnerClass =
    !showMain && showAside
      ? "flex flex-col lg:flex-row gap-5"
      : "flex flex-col gap-5";

  return (
    <main
      className="min-h-screen w-full bg-[#f4f6f9]"
      style={{
        fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {/* ── Hero — todos ──────────────────────────────────────────── */}
      <DepartmentHeroBanner
        title="Gestión Financiera"
        subtitle="Control presupuestario, reportes y seguimiento operativo en tiempo real."
        imageSrc="/images/finance-banner.jpg"
        gradientFrom="from-violet-900/85"
        gradientVia="via-violet-800/75"
        gradientTo="to-fuchsia-800/70"
        dotPatternId="fin-dots"
        pills={[
          { type: "status", text: "Cierre mensual al día" },
          { type: "info", text: "Última sincronización: hace 5 min" },
        ]}
        ctaLinks={ctaLinks}
      />

<div className="px-6 pb-10">
        {/* ── Comunicados — todos ────────────────────────────────── */}
        <FinanceAnnouncementBanner className="-mt-2" />

        {/* ── KPI Strip — manager+ ───────────────────────────────── */}
        {showKPIs && <FinanceKPIStrip />}

        {/* ── Grid principal ─────────────────────────────────────── */}
        {showGrid && (
          <AnimatedSection className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Columna principal — finance+ */}
            {showMain && (
              <div className={`${mainColClass} space-y-6`}>
                <AnimatedCard delay={0}>
                  <FinanceModulesSection />
                </AnimatedCard>

                {/* ── Activity Feed — manager+ ───────────────────── */}
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

                {showCalendar && (
                  <AnimatedCard delay={0.29}>
                    <FinanceCalendarCard />
                  </AnimatedCard>
                )}
              </AnimatedSection>
            )}
          </AnimatedSection>
        )}

        {/* ── Panel Financiero — manager+ ───────────────────────── */}
        {showPanel && (
          <AnimatedViewCard className="mt-6 border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
                  <BarChart2 className="h-3.5 w-3.5 text-violet-600" />
                </span>

                <div>
                  <h2 className="text-sm font-semibold text-slate-800">
                    Panel Financiero
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Visualización estratégica de ingresos, gastos y actividad reciente
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden md:inline-flex items-center rounded-full bg-violet-50 border border-violet-100 px-3 py-1 text-[11px] font-semibold text-violet-600">
                  Actualizado hoy
                </span>

                {/* ── Export Toolbar — finance:create_report ─────── */}
                {showExport && (
                  <FinanceExportToolbar periodLabel="Q1 2025" />
                )}
              </div>
            </div>

            <FinanceDashboard />
          </AnimatedViewCard>
        )}

        {/* ── Equipo — todos ────────────────────────────────────── */}
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