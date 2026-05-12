/**
 * @module HelpPageContent
 * Composición principal del Help Center dentro de la intranet.
 *
 * @remarks
 * Este componente actúa como contenedor de alto nivel para todo el módulo
 * de ayuda, organizando las distintas secciones funcionales y visuales de la página.
 *
 * Su estructura incluye:
 *
 * - hero principal del módulo
 * - KPI strip
 * - asistente conversacional Stilo
 * - banner de creación de tickets
 * - grid principal con contenido y sidebar
 * - bloque de información de plataforma
 *
 * Es un **Server Component**, por lo que no maneja estado local directamente.
 * Sin embargo, envuelve parte de la página con {@link HelpTicketsProvider}
 * para habilitar acceso a contexto en componentes cliente descendientes.
 */

// app/(protected)/(intranet)/help/components/HelpPageContent.tsx

import { DepartmentHeroBanner } from "@/app/components/ui/animated/DepartmentHeroBanner";
import { AnimatedCard } from "@/app/components/ui/animated/AnimatedCard";
import { AnimatedSection } from "@/app/components/ui/animated/AnimatedSection";
import { AnimatedViewCard } from "@/app/components/ui/animated/AnimatedViewCard";

import { HelpTicketsProvider } from "../context/HelpTicketsContext";

import HelpNewTicketButton from "./HelpNewTicketButton";
import HelpHeroActions from "./HelpHeroActions";
import HelpKPIStrip from "./HelpKPIStrip";
import HelpTicketsCard from "./HelpTicketsCard";
import HelpContactSection from "./HelpContactSection";
import HelpQuickGuides from "./HelpQuickGuides";
import HelpFAQ from "./HelpFAQ";
import HelpQuickLinks from "./HelpQuickLinks";
import HelpSystemStatus from "./HelpSystemStatus";
import HelpAlertsPanel from "./HelpAlertsPanel";
import HelpDocumentation from "./HelpDocumentation";
import HelpStiloSection from "./HelpPlatformSection";

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Contenido principal del Help Center.
 *
 * @returns Layout completo del módulo de ayuda.
 *
 * @remarks
 * Este componente funciona como capa de composición y distribución visual
 * del Help Center.
 *
 * Responsabilidades principales:
 *
 * - estructurar la página completa
 * - envolver la vista con el provider de tickets
 * - distribuir contenido principal y sidebar
 * - coordinar bloques estáticos e interactivos
 *
 * Estructura general de la página:
 *
 * 1. Provider de tickets
 * 2. Hero del módulo
 * 3. KPI strip
 * 4. Asistente Stilo
 * 5. Banner para creación de ticket
 * 6. Grid principal:
 *    - columna principal: tickets, contacto, guías, FAQ
 *    - sidebar: accesos, estado, alertas, documentación
 * 7. Información de plataforma
 *
 * @example
 * ```tsx
 * <HelpPageContent />
 * ```
 */
export default function HelpPageContent() {
  return (
    <HelpTicketsProvider>
      <main
        className="min-h-screen w-full bg-[#F5F6FA]"
        style={{
          fontFamily:
            "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
        }}
      >
        {/* ============================================================ */}
        {/* Hero                                                         */}
        {/* ============================================================ */}
        <DepartmentHeroBanner
          title="Centro de Ayuda"
          subtitle="Soporte técnico, guías rápidas, estado de sistemas y gestión de tickets."
          imageSrc="/images/help-banner.jpg"
          gradientFrom="from-[#0F2C6B]/95"
          gradientVia="via-[#1A4DB8]/90"
          gradientTo="to-[#0E7FC0]/85"
          dotPatternId="help-dots"
          pills={[
            { type: "status", text: "Soporte disponible" },
            { type: "info", text: "Atención: lun–vie 8:00–18:00" },
          ]}
          actions={<HelpHeroActions />}
        />

        {/* ============================================================ */}
        {/* Body principal superpuesto al hero                           */}
        {/* ============================================================ */}
        <div className="relative z-10 -mt-16 px-4 pb-10 lg:px-10">

          {/* ---------------------------------------------------------- */}
          {/* KPI strip                                                  */}
          {/* ---------------------------------------------------------- */}
          <HelpKPIStrip />

          {/* ---------------------------------------------------------- */}
          {/* Asistente Stilo                                            */}
          {/* ---------------------------------------------------------- */}
          <AnimatedViewCard className="mb-6">
            <HelpStiloSection />
          </AnimatedViewCard>

          {/* ---------------------------------------------------------- */}
          {/* Banner de creación de ticket                               */}
          {/* ---------------------------------------------------------- */}
          <div className="mb-6 rounded-xl bg-gradient-to-r from-[#0F2C6B] to-[#1A4DB8] px-6 py-5 flex items-center justify-between shadow-md shadow-blue-900/20">
            <div>
              <p className="text-sm font-bold text-white">
                ¿Necesitas ayuda?
              </p>
              <p className="text-xs text-white/75 mt-0.5">
                Crea un ticket y el equipo IT te responderá en menos de 2 horas.
              </p>
            </div>
            <HelpNewTicketButton />
          </div>

          {/* ---------------------------------------------------------- */}
          {/* Grid principal                                             */}
          {/* ---------------------------------------------------------- */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">

            {/* -------------------------------------------------------- */}
            {/* Columna principal                                        */}
            {/* -------------------------------------------------------- */}
            <div className="flex flex-col gap-5">

              <AnimatedCard delay={0}>
                <HelpTicketsCard />
              </AnimatedCard>

              <AnimatedCard delay={0.06}>
                <HelpContactSection />
              </AnimatedCard>

              <AnimatedCard delay={0.1}>
                <HelpQuickGuides />
              </AnimatedCard>

              <AnimatedCard delay={0.14}>
                <HelpFAQ />
              </AnimatedCard>

            </div>

            {/* -------------------------------------------------------- */}
            {/* Sidebar                                                  */}
            {/* -------------------------------------------------------- */}
            <AnimatedSection
              delay={0.08}
              stagger={0.07}
              className="flex flex-col gap-4"
            >
              <AnimatedCard delay={0.1}>
                <HelpQuickLinks />
              </AnimatedCard>

              <AnimatedCard delay={0.14}>
                <HelpSystemStatus />
              </AnimatedCard>

              <AnimatedCard delay={0.18}>
                <HelpAlertsPanel />
              </AnimatedCard>

              <AnimatedCard delay={0.22}>
                <HelpDocumentation />
              </AnimatedCard>
            </AnimatedSection>

          </div>

          {/* ========================================================== */}
          {/* Información de plataforma                                  */}
          {/* ========================================================== */}
          <AnimatedViewCard className="mt-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Información de la plataforma
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Datos técnicos de la intranet corporativa
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                En línea
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { label: "Versión", value: "v1.0.0" },
                { label: "Última actualización", value: "Hoy" },
                { label: "Mantenido por", value: "IT Department" },
                { label: "Uptime", value: "99.9%", green: true },
              ].map(({ label, value, green }) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                    {label}
                  </p>
                  <p
                    className={`text-sm font-bold mt-1.5 ${
                      green ? "text-emerald-600" : "text-slate-800"
                    }`}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </AnimatedViewCard>

        </div>
      </main>
    </HelpTicketsProvider>
  );
}