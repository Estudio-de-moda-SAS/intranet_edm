// ✅ SERVER COMPONENT — sin "use client"
//
// Guards aplicados por sección:
//   Hero + Equipo            → todos           (employee+)
//   Stat Bar                 → todos           (logistics:view_statbar)
//   Quick Links              → todos           (logistics:view_quicklinks)
//   Centro de Operaciones    → manager+        (logistics:view_operations)
//   Envíos + Rutas           → manager+        (logistics:view_shipments)
//   Mini KPI rendimiento     → manager+        (logistics:view_kpi_performance)
//   Almacenes e inventario   → logistics+admin (logistics:view_warehouses)
//   Analítica histórica      → logistics+admin (logistics:view_analytics)

import { Package, BarChart2 }         from "lucide-react";
import LogisticaOperationsCenter       from "./LogisticsOperationsCenter";
import LogisticaShipmentsCard          from "./LogisticsShipmentCard";
import LogisticaWarehouseCard          from "./LogisticsWarehouseCard";
import { LogisticaRoutesCard }         from "./LogisticsSidebarCards";
import LogisticaDashboard              from "./LogisticsDashboard";
import { DepartmentTeamSection }       from "@/app/components/team/DepartmentTeamSection";
import { logisticsTeam }               from "../config/logisticsTeam";
import type { LogisticsData }          from "@/lib/graph/departments/logistics.service";
import { logisticsQuickLinks }        from "../config/logisticsQuickLinks";
import { processQuickLinks }          from "@/lib/quickLinksAccess";

import { DepartmentHeroBanner }        from "@/app/components/ui/animated/DepartmentHeroBanner";
import { AnimatedCard }                from "@/app/components/ui/animated/AnimatedCard";
import { AnimatedSection }             from "@/app/components/ui/animated/AnimatedSection";
import { AnimatedViewCard }            from "@/app/components/ui/animated/AnimatedViewCard";

import { LogisticsStatBar }            from "./LogisticsStatbar";
import { LogisticsQuickLinksStrip }    from "./LogisticsQuickLinksStrip";

import { can, type AccessLevel }       from "@/lib/roles";

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  data:        LogisticsData;
  accessLevel: AccessLevel;
};

// ── Team accent ───────────────────────────────────────────────────────────────

const TEAM_ACCENT = {
  sectionBg:       "bg-white",
  sectionBorder:   "border-sky-100",
  iconBg:          "bg-sky-50",
  iconColor:       "text-sky-600",
  iconBorder:      "border-sky-100",
  barGradient:     "from-slate-700 to-sky-600",
  pillBg:          "bg-sky-50",
  pillBorder:      "border-sky-100",
  pillText:        "text-sky-600",
  hoverBorder:     "hover:border-sky-200",
  dividerHover:    "group-hover:bg-sky-100",
  avatarFrom:      "from-slate-700",
  avatarTo:        "to-sky-700",
  avatarRing:      "ring-sky-100",
  avatarRingHover: "group-hover:ring-sky-200",
  lineColor:       "bg-sky-200",
  titleColor:      "text-slate-900",
  subtitleColor:   "text-slate-400",
  topAccent:       "from-slate-600 via-sky-500 to-cyan-500",
} as const;

// ── Component ─────────────────────────────────────────────────────────────────

export default function LogisticsPageContent({ accessLevel }: Props) {

  const processedLogisticsLinks = processQuickLinks(logisticsQuickLinks, accessLevel);
  const showStatBar     = can(accessLevel, 'logistics:view_statbar');
  const showQuickLinks  = can(accessLevel, 'logistics:view_quicklinks') && processedLogisticsLinks.length > 0;
  const showOperations  = can(accessLevel, 'logistics:view_operations');
  const showShipments   = can(accessLevel, 'logistics:view_shipments');
  const showKPIPerf     = can(accessLevel, 'logistics:view_kpi_performance');
  const showWarehouses  = can(accessLevel, 'logistics:view_warehouses');
  const showAnalytics   = can(accessLevel, 'logistics:view_analytics');

  // ¿Hay contenido en el grid operacional?
  const showGrid = showShipments;

  return (
    <main
      className="min-h-screen w-full bg-[#f4f6f9]"
      style={{ fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
    >

      {/* ── HERO — todos ──────────────────────────────────────────── */}
      <DepartmentHeroBanner
        breadcrumb="Departamentos · Logística"
        title="Logística"
        subtitle="Control de envíos, rutas, almacenes e incidencias en tiempo real."
        imageSrc="/images/logistica-banner.jpg"
        gradientFrom="from-slate-900/92"
        gradientVia="via-sky-900/82"
        gradientTo="to-cyan-800/78"
        dotPatternId="log-dots"
        pills={[
          // Datos operativos solo para manager+ — revelan estado interno
          ...(showOperations ? [
            { type: "status" as const, text: "341 envíos activos · 18 con incidencia" },
            { type: "alert"  as const, text: "3 alertas críticas activas" },
          ] : []),
          { type: "info" as const, text: "Actualizado hace 1 min" },
        ]}
        ctaLinks={[
          // CTAs operativos solo para manager+
          ...(showShipments ? [
            { href: "/logistica/envios/nuevo", label: "Nuevo envío",   variant: "ghost" as const },
            { href: "/logistica/rutas",        label: "Mapa de rutas", variant: "solid" as const },
          ] : []),
        ]}
      />

      <div className="px-4 pb-12 lg:px-14">

        {/* ── STAT BAR — todos ──────────────────────────────────────── */}
        {showStatBar && <LogisticsStatBar />}

        {/* ── QUICK LINKS — todos ───────────────────────────────────── */}
        {showQuickLinks && (
          <AnimatedCard delay={0} className="mb-6">
            <LogisticsQuickLinksStrip quickLinks={processedLogisticsLinks} />
          </AnimatedCard>
        )}

        {/* ── CENTRO DE OPERACIONES — manager+ ─────────────────────── */}
        {showOperations && (
          <AnimatedCard delay={0} className="mb-6">
            <LogisticaOperationsCenter />
          </AnimatedCard>
        )}

        {/* ── GRID OPERACIONAL: Envíos + Rutas — manager+ ──────────── */}
        {showGrid && (
          <AnimatedSection
            className="grid grid-cols-1 gap-6 lg:grid-cols-12 mb-6"
            delay={0.1}
            stagger={0.1}
          >
            <AnimatedCard delay={0} className="lg:col-span-8">
              <LogisticaShipmentsCard />
            </AnimatedCard>

            <div className="lg:col-span-4 flex flex-col gap-5">
              <AnimatedCard delay={0.1}>
                <LogisticaRoutesCard />
              </AnimatedCard>

              {/* Mini KPI rendimiento — manager+ */}
              {showKPIPerf && (
                <AnimatedCard delay={0.18} className="hidden lg:block rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
                    Rendimiento hoy
                  </p>
                  <div className="flex flex-col gap-3.5">
                    {[
                      { label: "Tasa puntualidad",  value: "97.2%", bar: 97, color: "bg-emerald-500" },
                      { label: "Coste medio envío", value: "€8.40", bar: 64, color: "bg-sky-500"     },
                      { label: "Ocupación flota",   value: "81%",   bar: 81, color: "bg-violet-500"  },
                    ].map((m) => (
                      <div key={m.label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[11px] font-semibold text-slate-600">{m.label}</p>
                          <p className="text-[12px] font-bold text-slate-800">{m.value}</p>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${m.color} transition-all`}
                            style={{ width: `${m.bar}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </AnimatedCard>
              )}
            </div>
          </AnimatedSection>
        )}

        {/* ── ALMACENES — logistics + admin ─────────────────────────── */}
        {showWarehouses && (
          <AnimatedCard delay={0} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50">
                <Package className="h-3.5 w-3.5 text-indigo-600" />
              </span>
              <h2 className="text-sm font-semibold text-slate-700">Almacenes e inventario</h2>
              <span className="text-[11px] text-slate-400">— capacidad y stock crítico</span>
            </div>
            <LogisticaWarehouseCard />
          </AnimatedCard>
        )}

        {/* ── ANALÍTICA HISTÓRICA — logistics + admin ───────────────── */}
        {showAnalytics && (
          <AnimatedViewCard className="border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50">
                  <BarChart2 className="h-3.5 w-3.5 text-sky-600" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">Analítica Logística</h2>
                  <p className="text-[11px] text-slate-400">
                    Envíos diarios · tiempos de entrega · rendimiento por transportista
                  </p>
                </div>
              </div>
              <span className="hidden md:inline-flex items-center rounded-full bg-sky-50 border border-sky-100 px-3 py-1 text-[11px] font-semibold text-sky-600">
                Actualizado hoy
              </span>
            </div>
            <LogisticaDashboard />
          </AnimatedViewCard>
        )}

        {/* ── EQUIPO — todos ────────────────────────────────────────── */}
        <AnimatedViewCard className="mt-6">
          <DepartmentTeamSection
            members={logisticsTeam}
            title="Conoce al equipo de Logística"
            subtitle="Las personas que coordinan cada envío y mantienen la operación en movimiento."
            accent={TEAM_ACCENT}
          />
        </AnimatedViewCard>

      </div>
    </main>
  );
}