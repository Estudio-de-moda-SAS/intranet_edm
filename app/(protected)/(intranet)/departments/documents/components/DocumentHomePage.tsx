import { FileText }              from "lucide-react";
import DocumentTable              from "./DocumentTable";
import { DocumentRecentCard, DocumentOwnersCard } from "./DocumentSidebarCards";
import { DepartmentHeroBanner }   from "@/app/components/ui/animated/DepartmentHeroBanner";
import { AnimatedCard }           from "@/app/components/ui/animated/AnimatedCard";
import { AnimatedSection }        from "@/app/components/ui/animated/AnimatedSection";
import { DocumentStatBar }        from "./DocumentStatBar";
import { can, atLeast, type AccessLevel } from "@/lib/roles";
import { DOCUMENTS }              from "../config/documentData";
import { filterDocsByAccess }     from "../config/documentClassification";

type Props = { accessLevel: AccessLevel };

export default function DocumentHomePage({ accessLevel }: Props) {
  const authorizedDocs     = filterDocsByAccess(DOCUMENTS, accessLevel);
  const showClassification = atLeast(accessLevel, 'manager');
  const showCreate         = can(accessLevel, 'docs:create');
  const showApprovals      = can(accessLevel, 'docs:review_approvals');
  const showRecent         = can(accessLevel, 'docs:view_recent');
  const showOwners         = can(accessLevel, 'docs:view_owners');

  const ctaLinks = [
    ...(showCreate    ? [{ href: "/documentos/nuevo",        label: "Nuevo documento",      variant: "ghost" as const }] : []),
    ...(showApprovals ? [{ href: "/documentos/aprobaciones", label: "Revisar aprobaciones", variant: "solid" as const }] : []),
  ];

  return (
    <main
      className="min-h-screen w-full bg-[#f4f6f9] dark:bg-[#0d1117]"
      style={{ fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
    >
      <DepartmentHeroBanner
        breadcrumb="Departamentos · Documentación"
        title="Gestión Documental"
        subtitle="Repositorio corporativo, control de versiones, aprobaciones y cumplimiento documental."
        imageSrc="/images/documentos-banner.jpg"
        gradientFrom="from-slate-900/92"
        gradientVia="via-indigo-900/84"
        gradientTo="to-violet-950/80"
        dotPatternId="doc-grid"
        pills={[
          ...(showCreate ? [
            { type: "status" as const, text: `${authorizedDocs.length} documentos · ${authorizedDocs.filter(d => d.status !== 'archived').length} activos` },
            { type: "alert"  as const, text: `${authorizedDocs.filter(d => d.status === 'review').length} pendientes de aprobación` },
          ] : []),
          { type: "info" as const, text: "Actualizado hace 5 min" },
        ]}
        ctaLinks={ctaLinks}
      />

      <div className="px-4 pb-12 lg:px-14">
        <DocumentStatBar />

        {/* Repositorio */}
        <AnimatedCard delay={0} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg
                             bg-indigo-50 dark:bg-indigo-500/[0.12]">
              <FileText className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            </span>
            <h2 className="text-sm font-semibold text-slate-700 dark:text-[#cdd9e5]">
              Repositorio de documentos
            </h2>
            <span className="text-[11px] text-slate-400 dark:text-[#545d68]">
              — control y seguimiento de documentos corporativos
            </span>
          </div>
          <DocumentTable
            documents={authorizedDocs}
            showClassification={showClassification}
          />
        </AnimatedCard>

        {/* Recientes + Responsables */}
        {(showRecent || showOwners) && (
          <AnimatedSection
            className="grid grid-cols-1 gap-6 lg:grid-cols-12 mb-6"
            delay={0.1}
            stagger={0.1}
          >
            {showRecent && (
              <AnimatedCard delay={0} className="lg:col-span-7">
                <DocumentRecentCard />
              </AnimatedCard>
            )}
            {showOwners && (
              <AnimatedCard
                delay={0.1}
                className={showRecent ? "lg:col-span-5" : "lg:col-span-12"}
              >
                <DocumentOwnersCard />
              </AnimatedCard>
            )}
          </AnimatedSection>
        )}
      </div>
    </main>
  );
}
