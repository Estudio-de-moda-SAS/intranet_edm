/**
 * @module AdminHomePage
 * Vista principal del módulo de Servicios Administrativos dentro de la intranet.
 *
 * Este componente organiza la experiencia principal del área administrativa,
 * incluyendo:
 * - banner principal del departamento,
 * - indicadores clave,
 * - accesos rápidos,
 * - calendario y anuncios,
 * - solicitudes y documentos,
 * - funcionalidades sensibles como visitantes y tarjetas de acceso,
 * - sección del equipo del área.
 *
 * @remarks
 * Es un componente de servidor que compone la página a partir de múltiples
 * tarjetas y secciones reutilizables. La visibilidad de algunos bloques
 * depende del {@link AccessLevel} del usuario mediante la función {@link can}.
 *
 * Reglas de acceso aplicadas:
 * - Hero, equipo, KPI strip, quick links, calendario, anuncios, solicitudes y documentos:
 *   disponibles para todos los usuarios con acceso al módulo.
 * - Visitantes y tarjetas de acceso:
 *   disponibles únicamente para perfiles con permisos
 *   `admin_services:view_visitors` y `admin_services:view_access_cards`.
 */

// app/(protected)/(intranet)/departments/administrative/components/AdminHomePage.tsx
// SERVER COMPONENT

import AdminMyRequestsCard             from "./AdminMyRequestsCard";
import AdminDocumentsCenterCard        from "./AdminDocumentsCenterCard";
import AdminCalendarCard               from "./AdminCalendarCard";
import AdminAnnouncementsPanel         from "./AdminAnnouncementsPanel";
import AdminVisitorLogCard             from "./AdminVisitorLogCard";
import AdminAccessCardsCard            from "./AdminAccessCardsCard";
import AdminHeroActions                from "./AdminHeroActions";
import { AdminQuickLinksSection }      from "./AdminQuickLinksSection";

import { adminQuickLinks }             from "../config/adminQuickLinks";
import { processQuickLinks }           from "@/lib/quickLinksAccess";
import { DepartmentTeamSection }       from "@/app/components/team/DepartmentTeamSection";
import { adminTeam }                   from "../config/adminTeam";
import type { AdminData }              from "@/lib/graph/departments/administrative.service";

import { DepartmentHeroBanner }        from "@/app/components/ui/animated/DepartmentHeroBanner";
import { AnimatedCard }                from "@/app/components/ui/animated/AnimatedCard";
import { AnimatedSection }             from "@/app/components/ui/animated/AnimatedSection";
import { AnimatedViewCard }            from "@/app/components/ui/animated/AnimatedViewCard";
import { AdminKPIStrip }               from "./AdminKPIStrip";

import { can, type AccessLevel }       from "@/lib/roles";

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Propiedades requeridas por {@link AdminHomePage}.
 *
 * @property data Datos consolidados del módulo de Servicios Administrativos.
 * @property accessLevel Nivel de acceso del usuario autenticado.
 */
type Props = {
  data:        AdminData;
  accessLevel: AccessLevel;
};

// ── Team accent ───────────────────────────────────────────────────────────────

/**
 * Configuración visual utilizada por la sección del equipo del departamento.
 *
 * Define colores, gradientes, bordes, estados hover y estilos de avatar
 * aplicados en {@link DepartmentTeamSection}.
 *
 * @remarks
 * Este objeto centraliza la identidad visual del módulo de Servicios
 * Administrativos para mantener consistencia de estilo en la sección del equipo.
 */
const TEAM_ACCENT = {
  sectionBg:       "bg-white",
  sectionBorder:   "border-rose-300",
  iconBg:          "bg-rose-50",
  iconColor:       "text-rose-800",
  iconBorder:      "border-rose-300",
  barGradient:     "from-rose-900 to-rose-700",
  pillBg:          "bg-purple-50",
  pillBorder:      "border-rose-300",
  pillText:        "text-rose-800",
  hoverBorder:     "hover:border-rose-300",
  dividerHover:    "group-hover:bg-rose-100",
  avatarFrom:      "from-rose-900",
  avatarTo:        "to-rose-600",
  avatarRing:      "ring-rose-100",
  avatarRingHover: "group-hover:ring-rose-200",
  lineColor:       "bg-rose-200",
  titleColor:      "text-slate-900",
  subtitleColor:   "text-slate-400",
  topAccent:       "from-rose-950 via-rose-800 to-rose-600",
} as const;

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Renderiza la página principal del módulo de Servicios Administrativos.
 *
 * @param props Propiedades del componente.
 * @param props.data Datos del módulo obtenidos desde la capa de servicios.
 * @param props.accessLevel Nivel de acceso del usuario actual.
 * @returns La interfaz principal del área administrativa.
 *
 * @remarks
 * Este componente:
 * 1. Evalúa permisos para mostrar bloques sensibles.
 * 2. Filtra enlaces rápidos según el nivel de acceso.
 * 3. Organiza el contenido en una grilla principal con columna de contenido y sidebar.
 * 4. Renderiza una sección final con el equipo del departamento.
 *
 * La función {@link can} controla la exposición de funcionalidades sensibles
 * para asegurar que solo usuarios autorizados visualicen información
 * operativa específica.
 */
export default function AdminHomePage({ data, accessLevel }: Props) {

  /**
   * Indica si el usuario puede visualizar el registro de visitantes.
   */
  const showVisitors = can(accessLevel, "admin_services:view_visitors");

  /**
   * Indica si el usuario puede visualizar la gestión de tarjetas de acceso.
   */
  const showAccessCards = can(accessLevel, "admin_services:view_access_cards");

  /**
   * Indica si existe al menos un bloque sensible visible en la columna principal.
   *
   * Se usa para ajustar los delays de animación del resto de tarjetas.
   */
  const showSensitiveMain = showVisitors || showAccessCards;

  /**
   * Determina si hay accesos rápidos disponibles para el usuario actual
   * después de aplicar el filtrado por permisos.
   */
  const showQuickLinks = processQuickLinks(adminQuickLinks, accessLevel).length > 0;

  return (
    <main
      className="min-h-screen w-full bg-[#f4f6f9]"
      style={{
        fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {/* ── HERO — todos ──────────────────────────────────────────── */}
      <DepartmentHeroBanner
        title="Servicios Administrativos"
        subtitle="Recepción, control de accesos, registro de visitantes y reserva de espacios."
        imageSrc="/images/admin-banner.jpg"
        gradientFrom="from-rose-950/82"
        gradientVia="via-rose-800/72"
        gradientTo="to-rose-700/58"
        dotPatternId="admin-dots"
        pills={[
          { type: "status", text: "Recepción activa" },
          { type: "info",   text: "Atención: lun–vie 7:30–18:00" },
        ]}
        actions={<AdminHeroActions />}
      />

<div className="px-6 pb-10">

        {/* ── KPI STRIP — todos ─────────────────────────────────────── */}
        <AdminKPIStrip />

        {/* ── GRID PRINCIPAL ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          {/* ── Columna principal — 8 cols ── */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {showVisitors && (
              <AnimatedCard delay={0}>
                <AdminVisitorLogCard data={data} />
              </AnimatedCard>
            )}

            {showAccessCards && (
              <AnimatedCard delay={0.06}>
                <AdminAccessCardsCard data={data} />
              </AnimatedCard>
            )}

            <AnimatedCard delay={showSensitiveMain ? 0.1 : 0}>
              <AdminMyRequestsCard data={data} />
            </AnimatedCard>

            <AnimatedCard delay={showSensitiveMain ? 0.14 : 0.06}>
              <AdminDocumentsCenterCard data={data} />
            </AnimatedCard>

          </div>

          {/* ── Sidebar — todos ── */}
          <AnimatedSection
            delay={0.08}
            stagger={0.07}
            className="lg:col-span-4 flex flex-col gap-5"
          >
            {showQuickLinks && (
              <AnimatedCard delay={0.15}>
                {/* 
                  AdminQuickLinksSection encapsula la lógica cliente para
                  rendering de accesos rápidos y acciones de modal internas.
                */}
                <AdminQuickLinksSection accessLevel={accessLevel} />
              </AnimatedCard>
            )}

            <AnimatedCard delay={0.05}>
              <AdminCalendarCard data={data} />
            </AnimatedCard>

            <AnimatedCard delay={0.1}>
              <AdminAnnouncementsPanel data={data} />
            </AnimatedCard>
          </AnimatedSection>

        </div>

        {/* ── EQUIPO — todos ────────────────────────────────────────── */}
        <AnimatedViewCard className="mt-6">
          <DepartmentTeamSection
            members={adminTeam}
            title="Equipo de Servicios Administrativos"
            subtitle="¿Quién puede ayudarte? Contacta directamente a la persona indicada para cada trámite."
            accent={TEAM_ACCENT}
          />
        </AnimatedViewCard>

      </div>
    </main>
  );
}