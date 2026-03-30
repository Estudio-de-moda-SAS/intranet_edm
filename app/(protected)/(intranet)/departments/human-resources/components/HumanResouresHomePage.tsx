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

import { TrendingUp }            from "lucide-react";
import HRDashboard                from "./HRDashboard";
import HRRequestsCard             from "./HRRequestCard";
import HRRecruitmentCard          from "./HRRecruitmentCard";
import HRAnniversariesCard        from "./HRAnniversariesCard";
import HRTrainingCard             from "./HRTrainingCard";
import HRHeadcountSection         from "./HRHeadCountSection";
import { hrApps }                 from "../config/hrApps";
import { DepartmentTeamSection }  from "@/app/components/team/DepartmentTeamSection";
import { hrTeam }                 from "../config/hrTeam";
import type { HRData }            from "@/lib/graph/departments/hr.service";

import { DepartmentHeroBanner }   from "@/app/components/ui/animated/DepartmentHeroBanner";
import { AnimatedCard }           from "@/app/components/ui/animated/AnimatedCard";
import { AnimatedSection }        from "@/app/components/ui/animated/AnimatedSection";
import { AnimatedViewCard }       from "@/app/components/ui/animated/AnimatedViewCard";
import { HRKPIStrip }             from "./HRKPIStrip";
import { HRAppsGrid }             from "./HRAppsGrid";
import { HRQuickLinks }           from "./HRQuickLinks";

import { can, type AccessLevel }  from "@/lib/roles";
import { hrQuickLinks }           from "../config/hrQuickLinks";
import { processQuickLinks }      from "@/lib/quickLinksAccess";

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  data:        HRData;
  accessLevel: AccessLevel;
};

// ── Team accent ───────────────────────────────────────────────────────────────

const TEAM_ACCENT = {
  sectionBg:       "bg-white",
  sectionBorder:   "border-rose-100",
  iconBg:          "bg-rose-50",
  iconColor:       "text-rose-500",
  iconBorder:      "border-rose-100",
  barGradient:     "from-rose-500 to-pink-500",
  pillBg:          "bg-rose-50",
  pillBorder:      "border-rose-100",
  pillText:        "text-rose-500",
  hoverBorder:     "hover:border-rose-200",
  dividerHover:    "group-hover:bg-rose-100",
  avatarFrom:      "from-rose-500",
  avatarTo:        "to-pink-600",
  avatarRing:      "ring-rose-100",
  avatarRingHover: "group-hover:ring-rose-200",
  lineColor:       "bg-rose-200",
  titleColor:      "text-slate-900",
  subtitleColor:   "text-slate-400",
  topAccent:       "from-rose-500 via-pink-400 to-purple-500",
} as const;

// ── Component ─────────────────────────────────────────────────────────────────

export default function HRPageContent({ accessLevel }: Props) {

  // ── Permisos ───────────────────────────────────────────────────
  const showKPIs        = can(accessLevel, 'hr:view_kpis');
  const showApps        = can(accessLevel, 'hr:view_apps');
  const showAnniv       = can(accessLevel, 'hr:view_anniversaries');
  const showTraining    = can(accessLevel, 'hr:view_training');
  const showHeadcount   = can(accessLevel, 'hr:view_headcount');
  const showRequests    = can(accessLevel, 'hr:view_requests');
  const showRecruitment = can(accessLevel, 'hr:view_recruitment');
  const showAnalytics   = can(accessLevel, 'hr:view_analytics');

  // Quick links procesados — pueden estar vacíos si el rol no tiene acceso
  const processedLinks  = processQuickLinks(hrQuickLinks, accessLevel);
  const showQuickLinks  = can(accessLevel, 'hr:view_quicklinks') && processedLinks.length > 0;

  // ── Columnas del grid ──────────────────────────────────────────
  // Columna principal (izquierda 8): apps + contenido hr+
  const showMainCol = showApps || showHeadcount || showRequests || showRecruitment;
  // Aside (derecha 4): quick links + aniversarios + formación
  const showAside   = showQuickLinks || showAnniv || showTraining;

  // Si solo hay main sin aside → main ocupa 12 cols
  // Si solo hay aside sin main → aside ocupa 12 cols en fila horizontal
  // Si ambos → 8/4 estándar
  const mainColClass    = showAside   ? "lg:col-span-8"  : "lg:col-span-12";
  const asideColClass   = showMainCol ? "lg:col-span-4"  : "lg:col-span-12";
  const asideInnerClass = !showMainCol
    ? "flex flex-col lg:flex-row gap-5"
    : "flex flex-col gap-5";

  const showGrid = showMainCol || showAside;

  return (
    <main
      className="min-h-screen w-full bg-[#f4f6f9]"
      style={{
        fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
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
          // Número de colaboradores solo para hr+ — dato interno sensible
          ...(showHeadcount ? [
            { type: "status" as const, text: "1,284 colaboradores activos" },
          ] : []),
          { type: "info" as const, text: "Última actualización: hace 3 min" },
        ]}
        ctaLinks={[
          // Nuevo empleado — solo hr+
          ...(showRecruitment ? [{ href: "/rrhh/empleados/nuevo", label: "Nuevo empleado", variant: "ghost" as const }] : []),
          // Procesar nómina — solo hr+
          ...(showRequests    ? [{ href: "/rrhh/nomina",          label: "Procesar nómina", variant: "solid" as const }] : []),
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
                  <h2 className="text-sm font-semibold text-slate-800">Analítica de Personas</h2>
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