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
 * - equipo directivo
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
 * 3. Grid de valores y liderazgo
 * 4. Sección de marcas
 * 5. Sección de canales
 * 6. Footer institucional
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AnimatedCard delay={0.08}>
            <CompanyValuesSection />
          </AnimatedCard>

          <AnimatedCard delay={0.14}>
            <CompanyLeadersSection />
          </AnimatedCard>
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