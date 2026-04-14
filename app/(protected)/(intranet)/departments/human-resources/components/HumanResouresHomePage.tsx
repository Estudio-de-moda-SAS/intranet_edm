/**
 * @module HumanResourcesHomePage
 * Página principal del módulo de Recursos Humanos.
 *
 * @remarks
 * Este componente servidor compone el dashboard principal del área de RRHH,
 * renderizando secciones de forma condicional según el nivel de acceso del usuario.
 *
 * Secciones disponibles:
 * - Hero principal del departamento
 * - KPI strip
 * - Grid de aplicaciones
 * - Quick links
 * - Aniversarios
 * - Formación
 * - Headcount
 * - Solicitudes
 * - Reclutamiento
 * - Analítica de personas
 * - Equipo del departamento
 *
 * La lógica de visibilidad se controla mediante permisos evaluados con {@link can}.
 *
 * @see {@link HRKPIStrip}
 * @see {@link HRAppsGrid}
 * @see {@link HRQuickLinks}
 * @see {@link DepartmentTeamSection}
 */

// ✅ SERVER COMPONENT — sin "use client"
//
// Guards aplicados por sección:
//   Hero + Equipo          → todos          (employee+)
//   KPI Strip              → manager+       (hr:view_kpis)
//   Apps Grid              → manager+       (hr:view_apps)
//   Quick Links            → manager+       (hr:view_quicklinks) + links disponibles
//   Aniversarios           → manager+       (hr:view_anniversaries)
//   Formación              → manager+       (hr:view_training)
//   Headcount              → hr + admin     (hr:view_headcount)
//   Solicitudes            → hr + admin     (hr:view_requests)
//   Reclutamiento          → hr + admin     (hr:view_recruitment)
//   Analítica de Personas  → hr + admin     (hr:view_analytics)

import { TrendingUp } from "lucide-react";
import HRDashboard from "./HRDashboard";
import HRRequestsCard from "./HRRequestCard";
import HRRecruitmentCard from "./HRRecruitmentCard";
import HRAnniversariesCard from "./HRAnniversariesCard";
import HRTrainingCard from "./HRTrainingCard";
import HRHeadcountSection from "./HRHeadCountSection";
import { hrApps } from "../config/hrApps";
import { DepartmentTeamSection } from "@/app/components/team/DepartmentTeamSection";
import { hrTeam } from "../config/hrTeam";
import type { HRData } from "@/lib/graph/departments/hr.service";

import { DepartmentHeroBanner } from "@/app/components/ui/animated/DepartmentHeroBanner";
import { AnimatedCard } from "@/app/components/ui/animated/AnimatedCard";
import { AnimatedSection } from "@/app/components/ui/animated/AnimatedSection";
import { AnimatedViewCard } from "@/app/components/ui/animated/AnimatedViewCard";
import { HRKPIStrip } from "./HRKPIStrip";
import { HRAppsGrid } from "./HRAppsGrid";
import { HRQuickLinks } from "./HRQuickLinks";

import { can, type AccessLevel } from "@/lib/roles";
import { hrQuickLinks } from "../config/hrQuickLinks";
import { processQuickLinks } from "@/lib/quickLinksAccess";

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Props del componente {@link HRPageContent}.
 *
 * @property data Datos generales del módulo de RRHH.
 * @property accessLevel Nivel de acceso del usuario autenticado.
 */
type Props = {
  data: HRData;
  accessLevel: AccessLevel;
};

// ── Team accent ───────────────────────────────────────────────────────────────

/**
 * Configuración visual del acento temático para la sección de equipo.
 *
 * @remarks
 * Este objeto define colores, gradientes, bordes y estilos utilizados por
 * {@link DepartmentTeamSection} para mantener la identidad visual del área de RRHH.
 */
const TEAM_ACCENT = {
  sectionBg: "bg-white",
  sectionBorder: "border-rose-100",
  iconBg: "bg-rose-50",
  iconColor: "text-rose-500",
  iconBorder: "border-rose-100",
  barGradient: "from-rose-500 to-pink-500",
  pillBg: "bg-rose-50",
  pillBorder: "border-rose-100",
  pillText: "text-rose-500",
  hoverBorder: "hover:border-rose-200",
  dividerHover: "group-hover:bg-rose-100",
  avatarFrom: "from-rose-500",
  avatarTo: "to-pink-600",
  avatarRing: "ring-rose-100",
  avatarRingHover: "group-hover:ring-rose-200",
  lineColor: "bg-rose-200",
  titleColor: "text-slate-900",
  subtitleColor: "text-slate-400",
  topAccent: "from-rose-500 via-pink-400 to-purple-500",
} as const;

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Contenido principal de la página de Recursos Humanos.
 *
 * @param props Propiedades del componente.
 * @returns Dashboard de RRHH construido dinámicamente según permisos.
 *
 * @remarks
 * Este componente:
 * - Evalúa permisos por sección
 * - Procesa quick links según el rol del usuario
 * - Calcula la distribución del grid principal
 * - Renderiza únicamente los bloques autorizados
 *
 * Distribución general:
 * - Hero superior siempre visible
 * - Grid principal opcional con columna principal y/o aside
 * - Sección de analítica para perfiles HR/Admin
 * - Sección de equipo siempre visible
 *
 * Aunque recibe `data`, en esta implementación actual no se consume directamente
 * dentro del render. Puede reservarse para futuras integraciones con contenido dinámico.
 *
 * @example
 * ```tsx
 * <HRPageContent
 *   data={data}
 *   accessLevel={accessLevel}
 * />
 * ```
 */
export default function HRPageContent({ accessLevel }: Props) {
  // ── Permisos ───────────────────────────────────────────────────

  /**
   * Visibilidad del strip de KPIs.
   */
  const showKPIs = can(accessLevel, "hr:view_kpis");

  /**
   * Visibilidad del grid de aplicaciones del módulo.
   */
  const showApps = can(accessLevel, "hr:view_apps");

  /**
   * Visibilidad de la tarjeta de aniversarios.
   */
  const showAnniv = can(accessLevel, "hr:view_anniversaries");

  /**
   * Visibilidad de la tarjeta de formación.
   */
  const showTraining = can(accessLevel, "hr:view_training");

  /**
   * Visibilidad de la sección de headcount.
   */
  const showHeadcount = can(accessLevel, "hr:view_headcount");

  /**
   * Visibilidad de la sección de solicitudes.
   */
  const showRequests = can(accessLevel, "hr:view_requests");

  /**
   * Visibilidad de la sección de reclutamiento.
   */
  const showRecruitment = can(accessLevel, "hr:view_recruitment");

  /**
   * Visibilidad del dashboard de analítica de personas.
   */
  const showAnalytics = can(accessLevel, "hr:view_analytics");

  /**
   * Quick links procesados según permisos del usuario.
   *
   * @remarks
   * La lista puede quedar vacía si el rol no tiene acceso a ningún enlace.
   */
  const processedLinks = processQuickLinks(hrQuickLinks, accessLevel);

  /**
   * Determina si la sección de quick links debe renderizarse.
   */
  const showQuickLinks =
    can(accessLevel, "hr:view_quicklinks") && processedLinks.length > 0;

  // ── Columnas del grid ──────────────────────────────────────────

  /**
   * Indica si la columna principal del grid debe mostrarse.
   *
   * @remarks
   * Contiene apps y módulos de gestión interna para RRHH.
   */
  const showMainCol =
    showApps || showHeadcount || showRequests || showRecruitment;

  /**
   * Indica si el aside del grid debe mostrarse.
   *
   * @remarks
   * Contiene quick links, aniversarios y formación.
   */
  const showAside = showQuickLinks || showAnniv || showTraining;

  /**
   * Clase responsiva de ancho para la columna principal.
   *
   * @remarks
   * - Si existe aside: ocupa 8 columnas
   * - Si no existe aside: ocupa 12 columnas
   */
  const mainColClass = showAside ? "lg:col-span-8" : "lg:col-span-12";

  /**
   * Clase responsiva de ancho para el aside.
   *
   * @remarks
   * - Si existe columna principal: ocupa 4 columnas
   * - Si no existe columna principal: ocupa 12 columnas
   */
  const asideColClass = showMainCol ? "lg:col-span-4" : "lg:col-span-12";

  /**
   * Layout interno del aside según si existe o no columna principal.
   *
   * @remarks
   * Cuando el aside se renderiza solo, se dispone horizontalmente en pantallas grandes.
   */
  const asideInnerClass = !showMainCol
    ? "flex flex-col lg:flex-row gap-5"
    : "flex flex-col gap-5";

  /**
   * Indica si debe renderizarse el grid principal.
   */
  const showGrid = showMainCol || showAside;

  return (
    <main
      className="min-h-screen w-full bg-[#f4f6f9]"
      style={{
        fontFamily:
          "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {/* ── HERO — todos ──────────────────────────────────────────── */}
      <DepartmentHeroBanner
        breadcrumb="Departamentos · RRHH"
        title="Recursos Humanos"
        subtitle="Gestión del talento, bienestar organizacional y desarrollo de personas."
        imageSrc="/images/hr-banner.jpg"
        gradientFrom="from-rose-900/85"
        gradientVia="via-pink-800/75"
        gradientTo="to-purple-800/70"
        dotPatternId="hr-dots"
        pills={[
          ...(showHeadcount
            ? [{ type: "status" as const, text: "1,284 colaboradores activos" }]
            : []),
          { type: "info" as const, text: "Última actualización: hace 3 min" },
        ]}
        ctaLinks={[
          ...(showRecruitment
            ? [
                {
                  href: "/rrhh/empleados/nuevo",
                  label: "Nuevo empleado",
                  variant: "ghost" as const,
                },
              ]
            : []),
          ...(showRequests
            ? [
                {
                  href: "/rrhh/nomina",
                  label: "Procesar nómina",
                  variant: "solid" as const,
                },
              ]
            : []),
        ]}
      />

      <div className="px-4 pb-10 lg:px-14">
        {/* ── KPI STRIP — manager+ ──────────────────────────────────── */}
        {showKPIs && <HRKPIStrip />}

        {/* ── GRID PRINCIPAL ────────────────────────────────────────── */}
        {showGrid && (
          <AnimatedSection className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-12">
            {/* ── Columna principal (izquierda) ── */}
            {showMainCol && (
              <div className={`${mainColClass} flex flex-col gap-6`}>
                {showApps && (
                  <HRAppsGrid
                    apps={hrApps}
                    title="Aplicaciones de Recursos Humanos"
                  />
                )}

                {showHeadcount && (
                  <AnimatedCard delay={0}>
                    <HRHeadcountSection />
                  </AnimatedCard>
                )}

                {showRequests && (
                  <AnimatedCard delay={0.1}>
                    <HRRequestsCard />
                  </AnimatedCard>
                )}

                {showRecruitment && (
                  <AnimatedCard delay={0.2}>
                    <HRRecruitmentCard />
                  </AnimatedCard>
                )}
              </div>
            )}

            {/* ── Aside (derecha) — manager+ ── */}
            {showAside && (
              <AnimatedSection
                delay={0.05}
                stagger={0.08}
                className={`${asideColClass} ${asideInnerClass}`}
              >
                {showQuickLinks && (
                  <HRQuickLinks quickLinks={processedLinks} />
                )}

                {showAnniv && (
                  <AnimatedCard delay={0.05}>
                    <HRAnniversariesCard />
                  </AnimatedCard>
                )}

                {showTraining && (
                  <AnimatedCard delay={0.13}>
                    <HRTrainingCard />
                  </AnimatedCard>
                )}
              </AnimatedSection>
            )}
          </AnimatedSection>
        )}

        {/* ── ANALÍTICA DE PERSONAS — hr + admin ───────────────────── */}
        {showAnalytics && (
          <AnimatedViewCard className="mt-6 border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50">
                  <TrendingUp className="h-3.5 w-3.5 text-rose-500" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">
                    Analítica de Personas
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Tendencias de personal, rotación y desempeño organizacional
                  </p>
                </div>
              </div>

              <span className="hidden md:inline-flex items-center rounded-full bg-rose-50 border border-rose-100 px-3 py-1 text-[11px] font-semibold text-rose-500">
                Actualizado hoy
              </span>
            </div>

            <HRDashboard />
          </AnimatedViewCard>
        )}

        {/* ── EQUIPO — todos ────────────────────────────────────────── */}
        <AnimatedViewCard className="mt-6">
          <DepartmentTeamSection
            members={hrTeam}
            title="Conoce al equipo de Recursos Humanos"
            subtitle="Las personas que cuidan el talento y bienestar de la organización."
            accent={TEAM_ACCENT}
          />
        </AnimatedViewCard>
      </div>
    </main>
  );
}