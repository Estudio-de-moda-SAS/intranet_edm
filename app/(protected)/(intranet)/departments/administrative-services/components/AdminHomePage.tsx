// app/(protected)/(intranet)/departments/administrative/components/AdminHomePage.tsx
// SERVER COMPONENT
//
// Guards aplicados:
//   Hero + Equipo + KPI Strip          → todos            (employee+)
//   Quick Links + Calendario           → todos            (employee+)
//   Anuncios + Solicitudes + Documentos→ todos            (employee+)
//   Visitantes + Tarjetas de Acceso    → admin_services + admin

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

type Props = {
  data:        AdminData;
  accessLevel: AccessLevel;
};

// ── Team accent ───────────────────────────────────────────────────────────────

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

export default function AdminHomePage({ data, accessLevel }: Props) {

  const showVisitors    = can(accessLevel, "admin_services:view_visitors");
  const showAccessCards = can(accessLevel, "admin_services:view_access_cards");
  const showSensitiveMain = showVisitors || showAccessCards;

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
        breadcrumb="Departamentos · Servicios Administrativos"
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

      <div className="px-4 pb-10 lg:px-14">

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
                {/* ↓ Reemplaza QuickLinksSection + processQuickLinks manual.
                    AdminQuickLinksSection es "use client" e inyecta las
                    acciones de modal internamente. */}
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