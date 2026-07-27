/**
 * @module DocumentHomePage
 * Página principal del módulo de Gestión Documental.
 *
 * Orquesta la vista general del sistema documental corporativo.
 *
 * @remarks
 * Este componente actúa como contenedor principal de la experiencia del
 * módulo documental y concentra la composición de sus bloques funcionales.
 *
 * Su responsabilidad principal es:
 * - determinar qué bloques de interfaz deben mostrarse según permisos,
 * - y ensamblar la vista completa usando componentes especializados.
 *
 * Los permisos de interfaz se evalúan con {@link can}.
 */
import { DocumentsExplorer } from "./DocumentsExplorer";
import { DocumentWorkspace } from "./DocumentWorkspace/DocumentWorkspace";

import { DocumentOwnersCard } from "./DocumentSidebarCards";
import { AnimatedCard } from "@/app/components/ui/animated/AnimatedCard";
import { AnimatedSection } from "@/app/components/ui/animated/AnimatedSection";
import { can, type AccessLevel } from "@/lib/roles";

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
 * 1. Evalúa permisos específicos para paneles secundarios.
 * 2. Renderiza:
 *    - workspace y explorador documental,
 *    - tarjeta de responsables (si aplica).
 *
 * Este componente constituye el punto de entrada funcional al sistema
 * documental para el usuario final.
 */
export default function DocumentHomePage({ accessLevel }: Props) {
  const SHOW_EXPLORER = false;
  const SHOW_OWNERS = false;

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

        {SHOW_EXPLORER && (
          <AnimatedCard delay={0} className="mb-6">
            <DocumentsExplorer />
          </AnimatedCard>
        )}

        {/* Responsables */}
        {showOwners && (
          <AnimatedSection
            className="grid grid-cols-1 gap-6 lg:grid-cols-12 mb-6"
            delay={0.1}
            stagger={0.1}
          >
            {SHOW_OWNERS && (
              <AnimatedCard delay={0.1} className="lg:col-span-12">
                <DocumentOwnersCard />
              </AnimatedCard>
            )}
          </AnimatedSection>
        )}
      </div>
    </main>
  );
}