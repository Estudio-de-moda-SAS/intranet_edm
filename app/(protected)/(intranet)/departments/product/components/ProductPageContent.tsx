// app/product/components/ProductPageContent.tsx
// SERVER COMPONENT — sin "use client"
//
// Guards aplicados por sección:
//   Hero                      → todos                    (employee+)
//   AnnouncementBanner        → todos                    (employee+)
//   KPI Strip                 → product:view_kpis         (product + manager + admin)
//   Colecciones               → product:view_collections  (product + manager + admin)
//   Fichas técnicas           → product:view_techsheets   (product + admin)
//   Muestras / Aprobaciones   → product:view_samples      (product + manager + admin)
//   Alertas                   → product:view_alerts       (product + manager + admin)
//   Quick Links               → product:view_quicklinks   (product + manager + admin)
//   Tools                     → product:view_tools        (product + admin)
//   Calendario de temporadas  → product:view_calendar     (product + manager + admin)
//   Panel de lanzamientos     → product:view_dashboard    (product + manager + admin)
//   Distribución por tiendas  → product:view_stores       (product + retail + manager + admin)
//   Activity Feed             → product:view_dashboard    (product + manager + admin)
//   ExportToolbar             → product:create_report     (product + admin)
//   Equipo                    → todos                    (employee+)

import { Layers2 }                          from "lucide-react";
import { QuickLinksSection }                from "@/app/components/ui/QuickLinksSection";
import { DepartmentTeamSection }            from "@/app/components/team/DepartmentTeamSection";
import { DepartmentHeroBanner }             from "@/app/components/ui/animated/DepartmentHeroBanner";
import { AnimatedCard }                     from "@/app/components/ui/animated/AnimatedCard";
import { AnimatedSection }                  from "@/app/components/ui/animated/AnimatedSection";
import { AnimatedViewCard }                 from "@/app/components/ui/animated/AnimatedViewCard";
import { can, type AccessLevel }            from "@/lib/roles";

import { productQuickLinks }                from "../config/productQuickLinks";
import { productTeam }                      from "../config/productTeam";
import type { ProductData }                 from "@/lib/graph/departments/product.service";

// Componente propio de esta carpeta
import { ProductKPIStrip }                  from "./ProductKPIStrip";
import ProductCollectionsSection            from "./ProductCollectionsSection";
import ProductSamplesCard                   from "./ProductSamplesCard";

// ── Componentes agrupados en ProductComponents.tsx ────────────────────────────
import {
  ProductAnnouncementBanner,
  ProductBlockersCard,   // exportado como ProductBlockersCard, no ProductAlertsCard
  ProductToolsCard,
  ProductCalendarCard,
  ProductActivityFeed,
  ProductExportToolbar,
} from "./ProductComponents";

// ── Componentes agrupados en ProductPanelComponents.tsx ───────────────────────
import {
  ProductLaunchPanel,
  ProductStoreDistributionCard,
} from "./ProductPanelComponents";

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  data:        ProductData;
  accessLevel: AccessLevel;
};

// ── Acento del equipo — paleta cálida (arena / terracota) ─────────────────────

const TEAM_ACCENT = {
  sectionBg:       "bg-white",
  sectionBorder:   "border-stone-100",
  iconBg:          "bg-stone-50",
  iconColor:       "text-stone-600",
  iconBorder:      "border-stone-100",
  barGradient:     "from-stone-500 to-amber-600",
  pillBg:          "bg-stone-50",
  pillBorder:      "border-stone-200",
  pillText:        "text-stone-600",
  hoverBorder:     "hover:border-stone-300",
  dividerHover:    "group-hover:bg-stone-100",
  avatarFrom:      "from-stone-500",
  avatarTo:        "to-amber-600",
  avatarRing:      "ring-stone-100",
  avatarRingHover: "group-hover:ring-stone-200",
  lineColor:       "bg-stone-200",
  titleColor:      "text-slate-900",
  subtitleColor:   "text-slate-400",
  topAccent:       "from-stone-500 via-amber-500 to-orange-400",
} as const;

// ── CTAs según nivel ──────────────────────────────────────────────────────────

function buildCtaLinks(accessLevel: AccessLevel) {
  const links: { href: string; label: string; variant: "ghost" | "solid" }[] = [];
  if (can(accessLevel, "product:view_collections"))
    links.push({ href: "/product/collections",    label: "Ver colecciones",     variant: "ghost" });
  if (can(accessLevel, "product:create_techsheet"))
    links.push({ href: "/product/techsheets/new", label: "Nueva ficha técnica", variant: "solid" });
  return links;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProductPageContent({ accessLevel }: Props) {

  const ctaLinks = buildCtaLinks(accessLevel);

  // Guards — todos existen en PERMISSION_MAP de roles.ts
  const showKPIs        = can(accessLevel, "product:view_kpis");
  const showCollections = can(accessLevel, "product:view_collections");
  const showTechSheets  = can(accessLevel, "product:view_techsheets");
  const showSamples     = can(accessLevel, "product:view_samples");
  const showAlerts      = can(accessLevel, "product:view_alerts");
  const showQuickLinks  = can(accessLevel, "product:view_quicklinks");
  const showTools       = can(accessLevel, "product:view_tools");
  const showCalendar    = can(accessLevel, "product:view_calendar");
  const showPanel       = can(accessLevel, "product:view_dashboard");
  const showStores      = can(accessLevel, "product:view_stores");
  const showActivity    = can(accessLevel, "product:view_dashboard");
  const showExport      = can(accessLevel, "product:create_report");

  // Layout dinámico
  const showMain  = showCollections || showSamples;
  const showAside = showAlerts || showQuickLinks || showTools || showCalendar;
  const showGrid  = showMain || showAside;

  const mainColClass    = showAside ? "lg:col-span-8"  : "lg:col-span-12";
  const asideColClass   = showMain  ? "lg:col-span-4"  : "lg:col-span-12";
  const asideInnerClass = (!showMain && showAside)
    ? "flex flex-col lg:flex-row gap-5"
    : "flex flex-col gap-5";

  return (
    <main
      className="min-h-screen w-full bg-[#f5f4f2]"
      style={{ fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
    >

      {/* ── Hero — todos ──────────────────────────────────────────── */}
      <DepartmentHeroBanner
        breadcrumb="Departamentos · Producto"
        title="Desarrollo de Producto"
        subtitle="Colecciones, fichas técnicas y seguimiento de muestras en tiempo real."
        imageSrc="/images/product-banner.jpg"
        gradientFrom="from-stone-900/85"
        gradientVia="via-stone-800/70"
        gradientTo="to-amber-900/65"
        dotPatternId="prod-dots"
        pills={[
          { type: "status", text: "Temporada SS-25 activa" },
          { type: "info",   text: "8 muestras pendientes de aprobación" },
        ]}
        ctaLinks={ctaLinks}
      />

      <div className="px-4 pb-10 lg:px-14">

        {/* ── Comunicados — todos ───────────────────────────────────── */}
        <ProductAnnouncementBanner className="-mt-2" />

        {/* ── KPI Strip — product + manager + admin ─────────────────── */}
        {showKPIs && <ProductKPIStrip />}

        {/* ── Grid principal ────────────────────────────────────────── */}
        {showGrid && (
          <AnimatedSection className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">

            {/* Columna principal */}
            {showMain && (
              <div className={`${mainColClass} space-y-6`}>

                {/* Colecciones activas — product + manager + admin */}
                {showCollections && (
                  <AnimatedCard delay={0}>
                    <ProductCollectionsSection showTechSheets={showTechSheets} />
                  </AnimatedCard>
                )}

                {/* Estado de muestras — product + manager + admin */}
                {showSamples && (
                  <AnimatedCard delay={0.08}>
                    <ProductSamplesCard
                      canApprove={can(accessLevel, "product:approve_sample")}
                    />
                  </AnimatedCard>
                )}

                {/* Activity Feed — product + manager + admin */}
                {showActivity && (
                  <AnimatedCard delay={0.14}>
                    <ProductActivityFeed limit={7} />
                  </AnimatedCard>
                )}
              </div>
            )}

            {/* Aside */}
            {showAside && (
              <AnimatedSection
                delay={0.1}
                stagger={0.08}
                className={`${asideColClass} ${asideInnerClass}`}
              >
                {showAlerts && (
                  <AnimatedCard delay={0.05}>
                    <ProductBlockersCard />
                  </AnimatedCard>
                )}
                {showQuickLinks && (
                  <AnimatedCard delay={0.13}>
                    <QuickLinksSection
                      title="Accesos rápidos · Producto"
                      quickLinks={productQuickLinks}
                    />
                  </AnimatedCard>
                )}
                {showTools && (
                  <AnimatedCard delay={0.21}>
                    <ProductToolsCard />
                  </AnimatedCard>
                )}
                {showCalendar && (
                  <AnimatedCard delay={0.29}>
                    <ProductCalendarCard />
                  </AnimatedCard>
                )}
              </AnimatedSection>
            )}

          </AnimatedSection>
        )}

        {/* ── Panel de lanzamientos — product + manager + admin ────── */}
        {showPanel && (
          <AnimatedViewCard className="mt-6 border-t border-stone-200 pt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50">
                  <Layers2 className="h-3.5 w-3.5 text-amber-600" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">Panel de lanzamientos</h2>
                  <p className="text-[11px] text-slate-400">
                    Estado de referencias por colección y punto de venta
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden md:inline-flex items-center rounded-full bg-amber-50 border border-amber-100 px-3 py-1 text-[11px] font-semibold text-amber-700">
                  SS-25 en curso
                </span>
                {showExport && (
                  <ProductExportToolbar periodLabel="SS-25" />
                )}
              </div>
            </div>
            <ProductLaunchPanel />
          </AnimatedViewCard>
        )}

        {/* ── Distribución por tiendas — product + retail + manager + admin */}
        {showStores && (
          <AnimatedViewCard className="mt-6">
            <ProductStoreDistributionCard />
          </AnimatedViewCard>
        )}

        {/* ── Equipo — todos ────────────────────────────────────────── */}
        <AnimatedViewCard className="mt-6">
          <DepartmentTeamSection
            members={productTeam}
            title="Conoce al equipo de Producto"
            subtitle="Las personas que dan vida a cada colección de Estudio de Moda SAS."
            accent={TEAM_ACCENT}
          />
        </AnimatedViewCard>

      </div>
    </main>
  );
}