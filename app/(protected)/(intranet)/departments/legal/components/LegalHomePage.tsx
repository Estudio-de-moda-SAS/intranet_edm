// app/(protected)/(intranet)/departments/legal/components/LegalHomePage.tsx
// SERVER COMPONENT

import { QuickLinksSection }      from "@/app/components/ui/QuickLinksSection";
import LegalContractsPanel         from "./LegalContractsPanel";
import LegalRequestsCard           from "./LegalRequestPanel";
import LegalLitigationPanel        from "./LegalLitigationPanel";
import LegalRegulatoryAlerts       from "./LegalRegulatoryAlerts";
import LegalCalendarCard           from "./LegalCalendarCard";
import LegalDocumentsPanel         from "./LegalDocumentsPanel";
import LegalHeroActions            from "./LegalHeroActions";

import { legalQuickLinks }         from "../config/legalQuickLinks";
import { DepartmentTeamSection }   from "@/app/components/team/DepartmentTeamSection";
import { legalTeam }               from "../config/legalTeam";
import type { LegalData }          from "@/lib/graph/departments/legal.service";

import { DepartmentHeroBanner }    from "@/app/components/ui/animated/DepartmentHeroBanner";
import { AnimatedCard }            from "@/app/components/ui/animated/AnimatedCard";
import { AnimatedSection }         from "@/app/components/ui/animated/AnimatedSection";
import { AnimatedViewCard }        from "@/app/components/ui/animated/AnimatedViewCard";
import { LegalKPIStrip }           from "./LegalKPIStrip";

import { can, type AccessLevel }   from "@/lib/roles";
import { processQuickLinks }       from "@/lib/quickLinksAccess";

type Props = {
  data:        LegalData;
  accessLevel: AccessLevel;
};

const TEAM_ACCENT = {
  sectionBg:       "bg-white",
  sectionBorder:   "border-emerald-200",
  iconBg:          "bg-emerald-50",
  iconColor:       "text-emerald-700",
  iconBorder:      "border-emerald-200",
  barGradient:     "from-emerald-800 to-emerald-600",
  pillBg:          "bg-emerald-50",
  pillBorder:      "border-emerald-200",
  pillText:        "text-emerald-700",
  hoverBorder:     "hover:border-emerald-200",
  dividerHover:    "group-hover:bg-emerald-50",
  avatarFrom:      "from-emerald-800",
  avatarTo:        "to-emerald-500",
  avatarRing:      "ring-emerald-100",
  avatarRingHover: "group-hover:ring-emerald-200",
  lineColor:       "bg-emerald-200",
  titleColor:      "text-slate-900",
  subtitleColor:   "text-slate-400",
  topAccent:       "from-emerald-800 via-emerald-600 to-teal-500",
} as const;

export default function LegalHomePage({ data, accessLevel }: Props) {

  const showKPIs       = can(accessLevel, "legal:view_kpis");
  const showCalendar   = can(accessLevel, "legal:view_calendar");
  const showRegulatory = can(accessLevel, "legal:view_regulatory");
  const showQuickLinks = can(accessLevel, "legal:view_quicklinks");
  const showContracts  = can(accessLevel, "legal:view_contracts");
  const showRequests   = can(accessLevel, "legal:view_requests");
  const showLitigation = can(accessLevel, "legal:view_litigation");
  const showDocuments  = can(accessLevel, "legal:view_documents");

  // ── Pills del hero — datos sensibles solo para quien puede verlos ─────────
  // contractsActive y complianceScore son KPIs — requieren legal:view_kpis
  const heroPills = [
    ...(showKPIs
      ? [
          { type: "status" as const, text: `${data.kpis.contractsActive} contratos vigentes` },
          { type: "info"   as const, text: `Compliance: ${data.kpis.complianceScore}%` },
        ]
      : [
          // Pill genérica sin datos sensibles para employee
          { type: "info" as const, text: "Asesoría legal corporativa" },
        ]
    ),
  ];

  // ── Actions del hero — solo para quien tiene acceso ───────────────────────
  // LegalHeroActions tiene botones de contratos, nueva solicitud, etc.
  // Solo se muestra si el usuario puede ver al menos los KPIs
  const heroActions = showKPIs ? <LegalHeroActions /> : undefined;

  // ── Quick links procesados ────────────────────────────────────────────────
  const processedLinks  = processQuickLinks(legalQuickLinks, accessLevel);
  const showQuickLinksSection = showQuickLinks && processedLinks.length > 0;

  const showMainCol = showContracts || showRequests || showLitigation || showDocuments;
  const showAside   = showCalendar  || showRegulatory || showQuickLinksSection;

  const mainColClass    = showAside    ? "lg:col-span-8"  : "lg:col-span-12";
  const asideColClass   = showMainCol  ? "lg:col-span-4"  : "lg:col-span-12";
  const asideInnerClass = !showMainCol && showAside
    ? "flex flex-col lg:flex-row gap-5"
    : "flex flex-col gap-5";

  return (
    <main
      className="min-h-screen w-full bg-[#f4f6f9]"
      style={{
        fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
      }}
    >

      {/* HERO */}
      <DepartmentHeroBanner
        breadcrumb="Departamentos · Jurídico"
        title="Área Jurídica"
        subtitle="Gestión de contratos, litigios, cumplimiento normativo y asesoría legal corporativa."
        imageSrc="/images/legal-banner.jpg"
        gradientFrom="from-emerald-950/88"
        gradientVia="via-emerald-800/80"
        gradientTo="to-teal-700/60"
        dotPatternId="legal-dots"
        pills={heroPills}
        actions={heroActions}
      />

      <div className="px-4 pb-10 lg:px-14">

        {showKPIs && <LegalKPIStrip />}

        {(showMainCol || showAside) && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

            {showMainCol && (
              <div className={`${mainColClass} flex flex-col gap-6`}>
                {showContracts && (
                  <AnimatedCard delay={0}>
                    <LegalContractsPanel data={data} />
                  </AnimatedCard>
                )}
                {showRequests && (
                  <AnimatedCard delay={0.07}>
                    <LegalRequestsCard data={data} />
                  </AnimatedCard>
                )}
                {showLitigation && (
                  <AnimatedCard delay={0.12}>
                    <LegalLitigationPanel data={data} />
                  </AnimatedCard>
                )}
                {showDocuments && (
                  <AnimatedCard delay={0.16}>
                    <LegalDocumentsPanel />
                  </AnimatedCard>
                )}
              </div>
            )}

            {showAside && (
              <AnimatedSection
                delay={0.08}
                stagger={0.07}
                className={`${asideColClass} ${asideInnerClass}`}
              >
                {showCalendar && (
                  <AnimatedCard delay={0.04}>
                    <LegalCalendarCard data={data} />
                  </AnimatedCard>
                )}
                {showRegulatory && (
                  <AnimatedCard delay={0.09}>
                    <LegalRegulatoryAlerts data={data} />
                  </AnimatedCard>
                )}
                {showQuickLinksSection && (
                  <AnimatedCard delay={0.14}>
                    <QuickLinksSection
                      title="Accesos rápidos · Jurídico"
                      quickLinks={processedLinks}
                    />
                  </AnimatedCard>
                )}
              </AnimatedSection>
            )}

          </div>
        )}

        <AnimatedViewCard className="mt-6">
          <DepartmentTeamSection
            members={legalTeam}
            title="Equipo Jurídico"
            subtitle="Contacta directamente al abogado responsable según el tipo de asunto."
            accent={TEAM_ACCENT}
          />
        </AnimatedViewCard>

      </div>
    </main>
  );
}