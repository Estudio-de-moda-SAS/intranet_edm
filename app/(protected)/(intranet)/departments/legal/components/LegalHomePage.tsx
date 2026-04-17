/**
 * @module LegalHomePage
 * Página principal del módulo jurídico.
 *
 * SERVER COMPONENT — carga todos los datos de SharePoint en paralelo
 * y los pasa al LegalTabsShell (Client Component).
 */

import { Suspense }                        from "react";
import { DepartmentHeroBanner }            from "@/app/components/ui/animated/DepartmentHeroBanner";
import { DepartmentTeamSection }           from "@/app/components/team/DepartmentTeamSection";
import { AnimatedViewCard }                from "@/app/components/ui/animated/AnimatedViewCard";
import { legalTeam }                       from "../config/legalTeam";
import { can, type AccessLevel }           from "@/lib/roles";
import { LegalTabsShell }                  from "./LegalTabsShell";
import LegalHeroActions                    from "./LegalHeroActions";
import { getLegalFolderDocuments }         from "@/lib/graph/departments/legal.sharepoint.service";
import { JURIDICO_FOLDERS, CUMPLIMIENTO_FOLDERS } from "../config/legalSharepointFolders";
import type { LegalData }                  from "@/lib/graph/departments/legal.service";

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

export default async function LegalHomePage({ data, accessLevel }: Props) {
  const showKPIs      = can(accessLevel, "legal:view_kpis");
  const showDocuments = can(accessLevel, "legal:view_documents");
  const showCompliance = can(accessLevel, "legal:view_regulatory");

  // Cargar datos de SharePoint en paralelo solo si el usuario tiene acceso
  const [juridicoFolderDocs, complianceDocs] = await Promise.all([
    showDocuments
      ? Promise.all(JURIDICO_FOLDERS.map((f) => getLegalFolderDocuments(f.siteRelativePath)))
      : Promise.resolve([[], [], [], []]),
    showCompliance && CUMPLIMIENTO_FOLDERS[0]
      ? getLegalFolderDocuments(CUMPLIMIENTO_FOLDERS[0].siteRelativePath)
      : Promise.resolve([]),
  ]);

  const heroPills = showKPIs
    ? [
        { type: "status" as const, text: `${data.kpis.contractsActive} contratos vigentes` },
        { type: "info"   as const, text: `Compliance: ${data.kpis.complianceScore}%` },
      ]
    : [{ type: "info" as const, text: "Gestión documental y asesoría legal corporativa" }];

  const heroActions = showKPIs ? <LegalHeroActions /> : undefined;

  return (
    <main
      className="min-h-screen w-full bg-[#f4f6f9] dark:bg-slate-900"
      style={{
        fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <DepartmentHeroBanner
        breadcrumb="Departamentos · Jurídico"
        title="Área Jurídica"
        subtitle="Gestión documental, contratos, litigios, cumplimiento normativo y asesoría legal corporativa."
        imageSrc="/images/legal-banner.jpg"
        gradientFrom="from-emerald-950/88"
        gradientVia="via-emerald-800/80"
        gradientTo="to-teal-700/60"
        dotPatternId="legal-dots"
        pills={heroPills}
        actions={heroActions}
      />

      <div className="px-4 pb-12 lg:px-14">
        {(showDocuments || showCompliance) ? (
          <Suspense fallback={<LegalTabsSkeleton />}>
            <LegalTabsShell
              accessLevel={accessLevel}
              juridicoFolderDocs={juridicoFolderDocs}
              complianceDocs={complianceDocs}
            />
          </Suspense>
        ) : (
          <div className="mt-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Sin acceso a los repositorios documentales
              </p>
              <p className="text-[12px] text-slate-400">
                Contacta al área jurídica para solicitar acceso.
              </p>
            </div>
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

function LegalTabsSkeleton() {
  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="flex gap-2">
        <div className="h-9 w-28 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div className="h-9 w-28 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
        ))}
      </div>
    </div>
  );
}