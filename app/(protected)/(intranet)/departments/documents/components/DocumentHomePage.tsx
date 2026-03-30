// app/documents/components/DocumentHomePage.tsx
// SERVER COMPONENT
//
// El repositorio es visible para todos, pero cada fila se filtra
// según classification + ownerDepartment del documento.
//
// Flujo de seguridad:
//   1. Server Component → filtra DOCUMENTS con filterDocsByAccess()
//   2. Pasa solo los documentos autorizados a DocumentTable (Client Component)
//   3. El cliente nunca recibe documentos que el usuario no debería ver

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

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = { accessLevel: AccessLevel };

// ── Component ─────────────────────────────────────────────────────────────────

export default function DocumentHomePage({ accessLevel }: Props) {

  // Filtrar documentos en servidor — el cliente solo ve lo autorizado
  const authorizedDocs = filterDocsByAccess(DOCUMENTS, accessLevel);

  // Mostrar columna de clasificación solo a managers+ (para que sepan el nivel)
  const showClassification = atLeast(accessLevel, 'manager');

  // CTAs del hero
  const showCreate    = can(accessLevel, 'docs:create');
  const showApprovals = can(accessLevel, 'docs:review_approvals');
  const showRecent    = can(accessLevel, 'docs:view_recent');
  const showOwners    = can(accessLevel, 'docs:view_owners');

  const ctaLinks = [
    ...(showCreate    ? [{ href: "/documentos/nuevo",        label: "Nuevo documento",      variant: "ghost" as const }] : []),
    ...(showApprovals ? [{ href: "/documentos/aprobaciones", label: "Revisar aprobaciones", variant: "solid" as const }] : []),
  ];

  return (
    <main
      className="min-h-screen w-full bg-[#f4f6f9]"
      style={{
        fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {/* ── HERO — todos ──────────────────────────────────────────── */}
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
          // Datos de documentos solo para manager+ — revelan info confidencial
          ...(showCreate ? [
            { type: "status" as const, text: `${authorizedDocs.length} documentos · ${authorizedDocs.filter(d => d.status !== 'archived').length} activos` },
            { type: "alert"  as const, text: `${authorizedDocs.filter(d => d.status === 'review').length} pendientes de aprobación` },
          ] : []),
          { type: "info" as const, text: "Actualizado hace 5 min" },
        ]}
        ctaLinks={ctaLinks}
      />

      <div className="px-4 pb-12 lg:px-14">

        {/* ── STAT BAR — todos ──────────────────────────────────────── */}
        <DocumentStatBar />

        {/* ── REPOSITORIO — todos (filtrado por clasificación) ──────── */}
        <AnimatedCard delay={0} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50">
              <FileText className="h-3.5 w-3.5 text-indigo-600" />
            </span>
            <h2 className="text-sm font-semibold text-slate-700">
              Repositorio de documentos
            </h2>
            <span className="text-[11px] text-slate-400">
              — control y seguimiento de documentos corporativos
            </span>
          </div>
          {/* Los docs ya vienen filtrados del servidor */}
          <DocumentTable
            documents={authorizedDocs}
            showClassification={showClassification}
          />
        </AnimatedCard>

        {/* ── RECIENTES + RESPONSABLES — manager+ ───────────────────── */}
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