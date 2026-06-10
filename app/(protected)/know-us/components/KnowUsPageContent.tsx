/**
 * @module CompanyContent
 * Composición principal de la sección "Conoce la Empresa".
 *
 * @remarks
 * Este componente actúa como el contenedor de alto nivel de la página
 * corporativa dentro de la intranet, organizando las diferentes secciones
 * informativas relacionadas con la empresa.
 *
 * Su estructura incluye:
 *
 * - hero corporativo
 * - historia de la compañía
 * - valores organizacionales
 * - equipo directivo (opcional)
 * - marcas
 * - canales de distribución
 * - footer institucional
 *
 * Es un **Server Component**, por lo que:
 *
 * - no maneja estado local
 * - no utiliza hooks de cliente
 * - delega toda la interacción específica a componentes hijos cuando aplica
 *
 * Su responsabilidad principal es la composición visual y jerárquica
 * del contenido institucional.
 */

// ✅ SERVER COMPONENT — sin "use client"

import { CompanyHeroBanner } from "../components/KnowUsHeroBanner";
import { CompanyHistorySection } from "../components/EdmHistorySection";
import { CompanyValuesSection } from "../components/EdmValuesSection";
import { CompanyLeadersSection } from "../components/EdmLeadersSection";
import { CompanyBrandsSection } from "../components/EdmBrandsSection";
import { CompanyCanalesSection } from "../components/EdmCanalesSection";
import { AnimatedCard } from "@/app/components/ui/animated/AnimatedCard";
import { AnimatedViewCard } from "@/app/components/ui/animated/AnimatedViewCard";

/* -------------------------------------------------------------------------- */
/* Configuración de visibilidad                                                */
/* -------------------------------------------------------------------------- */

/**
 * Controla la visualización de la sección de directivos.
 *
 * @remarks
 * Mientras no se disponga de información definitiva o validada
 * para esta sección, puede mantenerse oculta.
 *
 * Cuando se habilite nuevamente:
 *
 * ```ts
 * const SHOW_LEADERS_SECTION = true;
 * ```
 */
const SHOW_LEADERS_SECTION = false;

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Contenido principal de la página "Conoce la Empresa".
 *
 * @returns Layout completo de la sección corporativa.
 *
 * @remarks
 * Este componente organiza el contenido institucional en una secuencia clara:
 *
 * 1. Hero principal de identidad corporativa
 * 2. Historia de la empresa
 * 3. Valores organizacionales
 * 4. Liderazgo corporativo (opcional)
 * 5. Sección de marcas
 * 6. Sección de canales
 * 7. Footer institucional
 *
 * También aplica contenedores animados para mantener consistencia visual
 * con el resto de la intranet.
 *
 * No contiene lógica de negocio directa; su función es exclusivamente
 * de composición y jerarquía visual.
 *
 * @example
 * ```tsx
 * <CompanyPageContent />
 * ```
 */
export function CompanyPageContent() {
  return (
    <main
      className="min-h-screen w-full bg-slate-50"
      style={{
        fontFamily:
          "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
        marginTop: "calc(-1 * var(--layout-pt, 0px))",
      }}
    >
      {/* ============================================================ */}
      {/* Hero corporativo                                             */}
      {/* ============================================================ */}
      <CompanyHeroBanner />

      <div className="flex flex-col gap-6 px-4 pb-12 pt-6 lg:px-14">
        {/* ---------------------------------------------------------- */}
        {/* Historia de la empresa                                     */}
        {/* ---------------------------------------------------------- */}
        <AnimatedCard delay={0}>
          <CompanyHistorySection />
        </AnimatedCard>

        {/* ---------------------------------------------------------- */}
        {/* Valores + liderazgo                                        */}
        {/* ---------------------------------------------------------- */}
        <div
          className={`grid grid-cols-1 gap-6 ${
            SHOW_LEADERS_SECTION ? "lg:grid-cols-2" : ""
          }`}
        >
          <AnimatedCard delay={0.08}>
            <CompanyValuesSection />
          </AnimatedCard>

          {SHOW_LEADERS_SECTION && (
            <AnimatedCard delay={0.14}>
              <CompanyLeadersSection />
            </AnimatedCard>
          )}
        </div>

        {/* ---------------------------------------------------------- */}
        {/* Marcas                                                     */}
        {/* ---------------------------------------------------------- */}
        <AnimatedViewCard>
          <CompanyBrandsSection />
        </AnimatedViewCard>

        {/* ---------------------------------------------------------- */}
        {/* Canales                                                    */}
        {/* ---------------------------------------------------------- */}
        <AnimatedViewCard>
          <CompanyCanalesSection />
        </AnimatedViewCard>

        {/* ---------------------------------------------------------- */}
        {/* Footer institucional                                       */}
        {/* ---------------------------------------------------------- */}
        <footer className="flex items-center justify-between rounded-2xl bg-violet-900 px-7 py-5">
          <p className="text-[12px] text-violet-300/70">
            Estudio de Moda S.A.S. · Medellín, Colombia · Fundada 1980
          </p>

          <p className="text-[13px] font-semibold tracking-wide text-violet-200">
            #EDMBeHappy
          </p>
        </footer>
      </div>
    </main>
  );
}