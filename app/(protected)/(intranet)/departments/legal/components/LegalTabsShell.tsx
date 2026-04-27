"use client";
/**
 * @module LegalTabsShell
 * Shell de tabs que alterna entre el módulo Jurídico y el de Compliance.
 *
 * @remarks
 * CLIENT COMPONENT — maneja el estado del tab activo y controla
 * el acceso a cada tab según el nivel del usuario.
 *
 * Los datos de documentos se reciben como props desde LegalHomePage (Server),
 * que los carga en paralelo antes de renderizar este componente.
 * Este componente nunca importa Server Components async directamente.
 */

import { useState }        from "react";
import { Scale, ShieldCheck, ChevronRight, Lock } from "lucide-react";
import { AnimatedCard }    from "@/app/components/ui/animated/AnimatedCard";
import { AnimatedSection } from "@/app/components/ui/animated/AnimatedSection";
import { CumplimientoKPIStrip }     from "./ComplianceKPIStrip";
import { CumplimientoAlertasPanel } from "./ComplianceAlertsPanel";
import { CumplimientoCalendario }   from "./ComplianceCalendar";
import { DocuSignPanel }            from "./DocuSignPanel";
import { SharePointFolderViewer }   from "./SharepointFolderViewer";

import { can, type AccessLevel } from "@/lib/roles";
import { JURIDICO_FOLDERS, CUMPLIMIENTO_FOLDERS } from "../config/legalSharepointFolders";
import type { SharePointDocument }  from "@/types/sharepoint";
import { FolderOpen, ShieldAlert }  from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Tab = "juridico" | "compliance";

interface Props {
  accessLevel:       AccessLevel;
  /** Documentos de las 4 carpetas jurídicas, en el mismo orden que JURIDICO_FOLDERS */
  juridicoFolderDocs: SharePointDocument[][];
  /** Documentos de la carpeta SARLAFT */
  complianceDocs:    SharePointDocument[];
}

// ─── Configuración de tabs ────────────────────────────────────────────────────

const TABS: {
  id:         Tab;
  label:      string;
  icon:       React.FC<{ size?: number; className?: string }>;
  permission: Parameters<typeof can>[1];
}[] = [
  { id: "juridico",   label: "Jurídico",   icon: Scale,       permission: "legal:view_documents"  },
  { id: "compliance", label: "Cumplimiento", icon: ShieldCheck, permission: "legal:view_regulatory" },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export function LegalTabsShell({ accessLevel, juridicoFolderDocs, complianceDocs }: Props) {
  const visibleTabs = TABS.filter((tab) => can(accessLevel, tab.permission));

  const [activeTab, setActiveTab] = useState<Tab>(
    visibleTabs[0]?.id ?? "juridico"
  );

  if (visibleTabs.length === 0) {
    return (
      <div className="mt-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col items-center gap-2">
          <Lock size={20} className="text-slate-300" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Sin acceso a los repositorios documentales
          </p>
          <p className="text-[12px] text-slate-400">
            Contacta al área jurídica para solicitar acceso.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-6">
      {/* ── Selector de tabs ── */}
      <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-800 w-fit">
        {visibleTabs.map((tab) => {
          const Icon   = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-all duration-200
                ${active
                  ? tab.id === "juridico"
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-violet-700 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"
                }
              `}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Contenido del tab activo ── */}
      {activeTab === "juridico" && can(accessLevel, "legal:view_documents") && (
        <JuridicoTab
          accessLevel={accessLevel}
          folderDocs={juridicoFolderDocs}
        />
      )}

      {activeTab === "compliance" && can(accessLevel, "legal:view_regulatory") && (
        <ComplianceTab
          accessLevel={accessLevel}
          complianceDocs={complianceDocs}
        />
      )}
    </div>
  );
}

// ─── Tab: Jurídico ────────────────────────────────────────────────────────────

function JuridicoTab({
  accessLevel,
  folderDocs,
}: {
  accessLevel: AccessLevel;
  folderDocs:  SharePointDocument[][];
}) {
  return (
    <AnimatedSection delay={0.05} stagger={0.08} className="flex flex-col gap-6">
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
        <Scale size={11} />
        <span>Jurídico</span>
        <ChevronRight size={10} />
        <span className="text-emerald-600 font-medium">Repositorios documentales</span>
      </div>

      {/* Encabezado sección */}
      <AnimatedCard delay={0.05}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-200">
              <FolderOpen size={14} className="text-emerald-700" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                Repositorios Documentales
              </h2>
              <p className="text-[11px] text-slate-400 leading-tight">
                Carpetas de SharePoint · Área Jurídica
              </p>
            </div>
            <div className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400">
              4 carpetas
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {JURIDICO_FOLDERS.map((folder, idx) => {
              const docs = folderDocs[idx] ?? [];
              return (
                <SharePointFolderViewer
                  key={folder.id}
                  folder={folder}
                  documents={docs}
                  accessLevel={accessLevel}
                />
              );
            })}
          </div>
        </div>
      </AnimatedCard>

      <AnimatedCard delay={0.15}>
        <DocuSignPanel />
      </AnimatedCard>
    </AnimatedSection>
  );
}

// ─── Tab: Compliance ─────────────────────────────────────────────────────────

function ComplianceTab({
  accessLevel,
  complianceDocs,
}: {
  accessLevel:   AccessLevel;
  complianceDocs: SharePointDocument[];
}) {
  const folder = CUMPLIMIENTO_FOLDERS[0];

  return (
    <AnimatedSection delay={0.05} stagger={0.08} className="flex flex-col gap-6">
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
        <ShieldCheck size={11} />
        <span>Compliance</span>
        <ChevronRight size={10} />
        <span className="text-violet-600 font-medium">SARLAFT · Antilavado</span>
      </div>

      <AnimatedCard delay={0.05}>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <CumplimientoKPIStrip />
        </div>
      </AnimatedCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <AnimatedCard delay={0.1} className="lg:col-span-7">
          <CumplimientoAlertasPanel />
        </AnimatedCard>
        <AnimatedCard delay={0.15} className="lg:col-span-5">
          <CumplimientoCalendario />
        </AnimatedCard>
      </div>

      {folder && (
        <AnimatedCard delay={0.2}>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 border border-violet-200">
                  <ShieldAlert size={14} className="text-violet-700" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                    Documentos SARLAFT
                  </h2>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Carpetas de SharePoint · Compliance
                  </p>
                </div>
              </div>
              <SharePointFolderViewer
                folder={folder}
                documents={complianceDocs}
                accessLevel={accessLevel}
              />
            </div>
          </div>
        </AnimatedCard>
      )}
    </AnimatedSection>
  );
}