/**
 * @module DocumentHomePage
 * Página principal del módulo de Gestión Documental.
 *
 * Orquesta la vista general del sistema documental corporativo, integrando:
 * - métricas resumidas,
 * - repositorio documental filtrado por permisos,
 * - responsables documentales por área.
 *
 * @remarks
 * Este componente actúa como contenedor principal de la experiencia del módulo
 * documental y concentra la composición de sus bloques funcionales.
 *
 * Su responsabilidad principal es:
 * - resolver qué información documental puede visualizar el usuario,
 * - determinar qué bloques de interfaz deben mostrarse según permisos,
 * - y ensamblar la vista completa usando componentes especializados.
 *
 * La autorización de documentos se resuelve mediante {@link filterDocsByAccess},
 * mientras que los permisos de interfaz se evalúan con {@link can} y
 * {@link atLeast}.
 */
import { DocumentsExplorer } from "./DocumentsExplorer";
import { DocumentWorkspace } from "./DepartmentSidebar/DocumentWorkspace";

import { FileText } from "lucide-react";
import DocumentTable from "./DocumentTable";
import { DocumentOwnersCard } from "./DocumentSidebarCards";
import { AnimatedCard } from "@/app/components/ui/animated/AnimatedCard";
import { AnimatedSection } from "@/app/components/ui/animated/AnimatedSection";
import { can, atLeast, type AccessLevel } from "@/lib/roles";
import { DOCUMENTS } from "../config/documentData";
import { filterDocsByAccess } from "../config/documentClassification";

/**
 * Propiedades de {@link DocumentHomePage}.
 *
 * @property accessLevel Nivel de acceso del usuario actual dentro del sistema.
 */
type Props = { accessLevel: AccessLevel };

/**
 * Renderiza la página principal del módulo de Gestión Documental.
 *
 * @param props Propiedades del componente.
 * @param props.accessLevel Nivel de acceso del usuario autenticado.
 * @returns Vista principal del módulo documental adaptada a permisos.
 *
 * @remarks
 * Flujo general del componente:
 *
 * 1. Filtra los documentos autorizados según el nivel de acceso del usuario.
 * 2. Determina si deben mostrarse metadatos sensibles como clasificación.
 * 3. Evalúa permisos específicos para paneles secundarios.
 * 4. Renderiza:
 *    - workspace y explorador documental,
 *    - tabla documental,
 *    - tarjeta de responsables (si aplica).
 *
 * Este componente constituye el punto de entrada funcional al sistema
 * documental para el usuario final.
 */
export default function DocumentHomePage({ accessLevel }: Props) {
  /**
   * Documentos autorizados para el usuario actual.
   *
   * @remarks
   * La colección se filtra usando {@link filterDocsByAccess}, aplicando reglas
   * de clasificación y departamento propietario.
   */
  const authorizedDocs = filterDocsByAccess(DOCUMENTS, accessLevel);

  /**
   * Indica si debe mostrarse la columna de clasificación documental.
   *
   * @remarks
   * La clasificación solo se expone a perfiles con nivel `manager` o superior.
   */
  const showClassification = atLeast(accessLevel, "manager");

  /**
   * Permisos funcionales del módulo documental.
   */
  const showOwners = can(accessLevel, "docs:view_owners");

  return (
    <main
      className="min-h-screen w-full bg-[#f4f6f9] dark:bg-[#0d1117]"
      style={{ fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
    >
      <div className="px-4 pb-12 lg:px-14">
        <AnimatedCard delay={0} className="mb-6">
          <DocumentWorkspace />
        </AnimatedCard>

        <AnimatedCard delay={0} className="mb-6">
          <DocumentsExplorer />
        </AnimatedCard>

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

        {/* Responsables */}
        {showOwners && (
          <AnimatedSection
            className="grid grid-cols-1 gap-6 lg:grid-cols-12 mb-6"
            delay={0.1}
            stagger={0.1}
          >
            <AnimatedCard delay={0.1} className="lg:col-span-12">
              <DocumentOwnersCard />
            </AnimatedCard>
          </AnimatedSection>
        )}
      </div>
    </main>
  );
}