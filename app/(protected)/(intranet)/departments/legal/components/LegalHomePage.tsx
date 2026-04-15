/**
 * @module LegalHomePage
 * Página principal del módulo jurídico dentro de la intranet.
 *
 * @remarks
 * Este componente compone la vista principal del área legal,
 * organizando secciones del dashboard según el nivel de acceso del usuario.
 *
 * Incluye:
 * - Hero principal del departamento
 * - Franja de KPIs
 * - Paneles de contratos, solicitudes, litigios y documentos
 * - Sección lateral con calendario, alertas regulatorias y accesos rápidos
 * - Sección del equipo jurídico
 *
 * El contenido visible se controla mediante permisos evaluados con
 * la función {@link can}, permitiendo adaptar la experiencia según rol.
 */

// app/(protected)/(intranet)/departments/legal/components/LegalHomePage.tsx
// SERVER COMPONENT

import { QuickLinksSection } from "@/app/components/ui/QuickLinksSection";
import LegalContractsPanel from "./LegalContractsPanel";
import LegalRequestsCard from "./LegalRequestPanel";
import LegalLitigationPanel from "./LegalLitigationPanel";
import LegalRegulatoryAlerts from "./LegalRegulatoryAlerts";
import LegalCalendarCard from "./LegalCalendarCard";
import LegalDocumentsPanel from "./LegalDocumentsPanel";
import LegalHeroActions from "./LegalHeroActions";

import { legalQuickLinks } from "../config/legalQuickLinks";
import { DepartmentTeamSection } from "@/app/components/team/DepartmentTeamSection";
import { legalTeam } from "../config/legalTeam";
import type { LegalData } from "@/lib/graph/departments/legal.service";

import { DepartmentHeroBanner } from "@/app/components/ui/animated/DepartmentHeroBanner";
import { AnimatedCard } from "@/app/components/ui/animated/AnimatedCard";
import { AnimatedSection } from "@/app/components/ui/animated/AnimatedSection";
import { AnimatedViewCard } from "@/app/components/ui/animated/AnimatedViewCard";
import { LegalKPIStrip } from "./LegalKPIStrip";

import { can, type AccessLevel } from "@/lib/roles";
import { processQuickLinks } from "@/lib/quickLinksAccess";

/**
 * Props del componente {@link LegalHomePage}.
 *
 * @property data Datos consolidados del módulo jurídico.
 * @property accessLevel Nivel de acceso actual del usuario.
 */
type Props = {
  data: LegalData;
  accessLevel: AccessLevel;
};

/**
 * Configuración visual de acento para la sección del equipo jurídico.
 *
 * @remarks
 * Centraliza la identidad visual aplicada al bloque del equipo legal,
 * incluyendo colores, gradientes, bordes, pills y estilos de avatar.
 */
const TEAM_ACCENT = {
  sectionBg: "bg-white",
  sectionBorder: "border-emerald-200",
  iconBg: "bg-emerald-50",
  iconColor: "text-emerald-700",
  iconBorder: "border-emerald-200",
  barGradient: "from-emerald-800 to-emerald-600",
  pillBg: "bg-emerald-50",
  pillBorder: "border-emerald-200",
  pillText: "text-emerald-700",
  hoverBorder: "hover:border-emerald-200",
  dividerHover: "group-hover:bg-emerald-50",
  avatarFrom: "from-emerald-800",
  avatarTo: "to-emerald-500",
  avatarRing: "ring-emerald-100",
  avatarRingHover: "group-hover:ring-emerald-200",
  lineColor: "bg-emerald-200",
  titleColor: "text-slate-900",
  subtitleColor: "text-slate-400",
  topAccent: "from-emerald-800 via-emerald-600 to-teal-500",
} as const;

/**
 * Página principal del área jurídica.
 *
 * @param props Propiedades del componente.
 * @returns Vista principal del módulo legal con renderizado condicional por permisos.
 *
 * @remarks
 * Este componente:
 * - Evalúa permisos del usuario según `accessLevel`
 * - Construye pills y acciones del hero según acceso
 * - Procesa quick links con control de permisos
 * - Determina si debe existir columna principal, aside o ambos
 * - Compone dinámicamente el layout del dashboard legal
 *
 * Reglas generales:
 * - Los KPIs solo se muestran a usuarios con `legal:view_kpis`
 * - Las acciones del hero se restringen al mismo nivel
 * - Los accesos rápidos se procesan y filtran por permisos
 * - El layout se adapta según exista contenido en columnas principales o laterales
 *
 * @example
 * ```tsx
 * <LegalHomePage data={data} accessLevel={accessLevel} />
 * ```
 */
export default function LegalHomePage({ data, accessLevel }: Props) {
  const showKPIs = can(accessLevel, "legal:view_kpis");
  const showCalendar = can(accessLevel, "legal:view_calendar");
  const showRegulatory = can(accessLevel, "legal:view_regulatory");
  const showQuickLinks = can(accessLevel, "legal:view_quicklinks");
  const showContracts = can(accessLevel, "legal:view_contracts");
  const showRequests = can(accessLevel, "legal:view_requests");
  const showLitigation = can(accessLevel, "legal:view_litigation");
  const showDocuments = can(accessLevel, "legal:view_documents");

  /**
   * Pills mostradas en el hero principal.
   *
   * @remarks
   * Si el usuario puede ver KPIs, se muestran datos sensibles del área.
   * En caso contrario, se presenta una pill genérica sin información operativa.
   */
  const heroPills = [
    ...(showKPIs
      ? [
          { type: "status" as const, text: `${data.kpis.contractsActive} contratos vigentes` },
          { type: "info" as const, text: `Compliance: ${data.kpis.complianceScore}%` },
        ]
      : [{ type: "info" as const, text: "Asesoría legal corporativa" }]),
  ];

  /**
   * Acciones del hero.
   *
   * @remarks
   * Se renderizan únicamente para usuarios autorizados a ver KPIs,
   * ya que incluyen accesos directos a funcionalidades sensibles del módulo.
   */
  const heroActions = showKPIs ? <LegalHeroActions /> : undefined;

  /**
   * Accesos rápidos procesados según el nivel de acceso.
   *
   * @remarks
   * El arreglo resultante puede contener enlaces visibles, deshabilitados
   * u ocultos según la lógica de permisos definida en `processQuickLinks`.
   */
  const processedLinks = processQuickLinks(legalQuickLinks, accessLevel);

  /**
   * Indica si debe mostrarse la sección de quick links.
   *
   * @remarks
   * Solo se muestra si el usuario tiene permiso para ver quick links
   * y además existen enlaces procesados disponibles.
   */
  const showQuickLinksSection = showQuickLinks && processedLinks.length > 0;

  /**
   * Indica si existe contenido para la columna principal.
   *
   * @remarks
   * La columna principal agrupa contratos, solicitudes, litigios y documentos.
   */
  const showMainCol = showContracts || showRequests || showLitigation || showDocuments;

  /**
   * Indica si existe contenido para el aside.
   *
   * @remarks
   * El aside agrupa calendario, alertas regulatorias y accesos rápidos.
   */
  const showAside = showCalendar || showRegulatory || showQuickLinksSection;

  /**
   * Clase dinámica para la columna principal.
   *
   * @remarks
   * Si existe contenido en el aside, la columna principal se reduce;
   * de lo contrario, ocupa el ancho completo.
   */
  const mainColClass = showAside ? "lg:col-span-8" : "lg:col-span-12";

  /**
   * Clase dinámica para la columna lateral.
   *
   * @remarks
   * Si existe contenido en la columna principal, el aside ocupa menos ancho;
   * en caso contrario, puede expandirse.
   */
  const asideColClass = showMainCol ? "lg:col-span-4" : "lg:col-span-12";

  /**
   * Clase interna de layout del aside.
   *
   * @remarks
   * Cuando no existe columna principal, el aside puede redistribuirse
   * en orientación horizontal en pantallas grandes.
   */
  const asideInnerClass =
    !showMainCol && showAside
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