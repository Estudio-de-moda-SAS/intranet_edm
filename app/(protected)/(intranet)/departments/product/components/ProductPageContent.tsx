/**
 * @module ProductPageContent
 * Contenido principal de la página del módulo de Producto.
 *
 * @remarks
 * Este archivo define el componente contenedor principal de la vista
 * de Producto dentro de la intranet.
 *
 * Su responsabilidad no es obtener datos ni manejar autenticación,
 * sino organizar la composición visual de la página a partir del nivel
 * de acceso del usuario.
 *
 * A nivel funcional, este componente:
 * - Evalúa permisos por sección mediante {@link can}
 * - Determina qué bloques deben renderizarse
 * - Construye el layout principal de forma dinámica
 * - Configura llamadas a la acción del hero según privilegios
 * - Ensambla componentes visuales del dashboard de Producto
 *
 * La vista está organizada en secciones funcionales como:
 * - Hero institucional del área
 * - Comunicados
 * - KPIs
 * - Colecciones y fichas técnicas
 * - Seguimiento de muestras
 * - Alertas y herramientas
 * - Calendario de temporadas
 * - Panel ejecutivo de lanzamientos
 * - Distribución por tiendas
 * - Equipo del departamento
 *
 * Este componente funciona como capa de composición de UI y control
 * de visibilidad basada en permisos, por lo que representa uno de los
 * puntos centrales de la experiencia del módulo de Producto.
 */

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
} from "./product-components";

// ── Componentes agrupados en ProductPanelComponents.tsx ───────────────────────
import {
  ProductLaunchPanel,
  ProductStoreDistributionCard,
} from "./ProductPanelComponents";

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Propiedades del componente {@link ProductPageContent}.
 *
 * @property data Datos agregados del módulo de Producto.
 * @property accessLevel Nivel de acceso del usuario autenticado.
 *
 * @remarks
 * `data` representa la carga principal del módulo proveniente del servicio
 * de Producto. Aunque en la implementación actual no se consume directamente
 * dentro de este componente, se mantiene como parte del contrato del módulo
 * para soportar integración futura o delegación hacia componentes hijos.
 *
 * `accessLevel` es el valor determinante para evaluar permisos y decidir
 * qué secciones del dashboard pueden mostrarse.
 */
type Props = {
  data:        ProductData;
  accessLevel: AccessLevel;
};

// ── Acento del equipo — paleta cálida (arena / terracota) ─────────────────────

/**
 * Configuración visual del bloque de equipo del área de Producto.
 *
 * @remarks
 * Este objeto centraliza la paleta cromática y estilos semánticos utilizados
 * por el componente {@link DepartmentTeamSection} para representar la identidad
 * visual del departamento.
 *
 * La intención de esta configuración es ofrecer una apariencia cálida y sobria,
 * alineada con el contexto del área de Producto mediante tonos arena, piedra
 * y ámbar.
 *
 * Al concentrar esta configuración en una constante:
 * - se evita duplicar estilos
 * - se facilita la consistencia entre vistas
 * - se simplifica la personalización visual por departamento
 */
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

/**
 * Construye el listado de llamadas a la acción del hero según el nivel de acceso.
 *
 * @param accessLevel Nivel de acceso del usuario actual.
 * @returns Arreglo de enlaces CTA compatibles con el hero del departamento.
 *
 * @remarks
 * Esta función encapsula la lógica de construcción de acciones rápidas
 * visibles en el banner principal de la página.
 *
 * El objetivo es que las CTAs del hero no sean estáticas, sino sensibles
 * al perfil del usuario y a sus permisos efectivos.
 *
 * Reglas actuales:
 * - Si el usuario puede ver colecciones, se muestra el acceso a colecciones
 * - Si el usuario puede crear fichas técnicas, se muestra la acción de creación
 *
 * Esto permite que el hero actúe como una capa de navegación contextual
 * y no únicamente como un elemento visual.
 *
 * @example
 * ```ts
 * const links = buildCtaLinks(accessLevel);
 * ```
 */
function buildCtaLinks(accessLevel: AccessLevel) {
  const links: { href: string; label: string; variant: "ghost" | "solid" }[] = [];

  if (can(accessLevel, "product:view_collections"))
    links.push({ href: "/product/collections",    label: "Ver colecciones",     variant: "ghost" });

  if (can(accessLevel, "product:create_techsheet"))
    links.push({ href: "/product/techsheets/new", label: "Nueva ficha técnica", variant: "solid" });

  return links;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Contenido principal del dashboard del módulo de Producto.
 *
 * @param props Propiedades del componente.
 * @param props.data Datos estructurados del módulo de Producto.
 * @param props.accessLevel Nivel de acceso del usuario autenticado.
 * @returns Estructura principal renderizada de la página de Producto.
 *
 * @remarks
 * Este componente actúa como coordinador principal de la vista y concentra
 * la lógica de composición basada en permisos.
 *
 * Su flujo interno puede resumirse en cuatro etapas:
 *
 * 1. **Construcción de CTAs**
 *    Genera los enlaces de acción del hero según privilegios del usuario.
 *
 * 2. **Evaluación de guards**
 *    Determina qué secciones deben renderizarse usando la función {@link can}
 *    y el mapa de permisos del sistema.
 *
 * 3. **Resolución de layout**
 *    Calcula si deben mostrarse columnas principales, aside lateral o ambas,
 *    y ajusta dinámicamente las clases responsivas del grid.
 *
 * 4. **Composición de la página**
 *    Ensambla hero, bloques principales, paneles operativos y sección de equipo.
 *
 * La página se comporta como una interfaz adaptable al rol, donde cada usuario
 * ve una combinación distinta de secciones según sus permisos.
 *
 * ### Secciones principales renderizadas
 *
 * - Hero institucional del área
 * - Banner de anuncios
 * - KPIs del área
 * - Colecciones activas
 * - Seguimiento de muestras
 * - Activity feed
 * - Alertas o bloqueos
 * - Accesos rápidos
 * - Herramientas del área
 * - Calendario de temporadas
 * - Panel de lanzamientos
 * - Distribución por tiendas
 * - Equipo del departamento
 *
 * ### Consideraciones de diseño
 *
 * - El componente se mantiene como **Server Component**
 * - La lógica de permisos está explícitamente separada en variables booleanas
 * - El layout es adaptable según la presencia de contenido principal y lateral
 * - La composición usa wrappers animados para mantener consistencia visual
 *
 * @example
 * ```tsx
 * <ProductPageContent data={data} accessLevel={accessLevel} />
 * ```
 */
export default function ProductPageContent({ accessLevel }: Props) {

  /**
   * Llamadas a la acción del banner principal.
   *
   * @remarks
   * Se construyen dinámicamente en función del nivel de acceso del usuario.
   * Estas acciones permiten ofrecer navegación contextual desde el hero.
   */
  const ctaLinks = buildCtaLinks(accessLevel);

  // Guards — todos existen en PERMISSION_MAP de roles.ts

  /**
   * Controla la visibilidad del strip de KPIs del módulo.
   */
  const showKPIs        = can(accessLevel, "product:view_kpis");

  /**
   * Controla la visibilidad de la sección de colecciones activas.
   */
  const showCollections = can(accessLevel, "product:view_collections");

  /**
   * Controla la disponibilidad de funcionalidades relacionadas con fichas técnicas.
   *
   * @remarks
   * Este permiso no renderiza una sección independiente en esta vista,
   * pero sí se delega hacia componentes hijos para habilitar acciones
   * o rutas relacionadas con fichas técnicas.
   */
  const showTechSheets  = can(accessLevel, "product:view_techsheets");

  /**
   * Controla la visibilidad del bloque de muestras y aprobaciones.
   */
  const showSamples     = can(accessLevel, "product:view_samples");

  /**
   * Controla la visibilidad del bloque de alertas o bloqueos.
   */
  const showAlerts      = can(accessLevel, "product:view_alerts");

  /**
   * Controla la visibilidad de la sección de accesos rápidos.
   */
  const showQuickLinks  = can(accessLevel, "product:view_quicklinks");

  /**
   * Controla la visibilidad de herramientas especializadas del módulo.
   */
  const showTools       = can(accessLevel, "product:view_tools");

  /**
   * Controla la visibilidad del calendario de temporadas.
   */
  const showCalendar    = can(accessLevel, "product:view_calendar");

  /**
   * Controla la visibilidad del panel ejecutivo de dashboard.
   *
   * @remarks
   * Este permiso habilita la sección de panel de lanzamientos.
   */
  const showPanel       = can(accessLevel, "product:view_dashboard");

  /**
   * Controla la visibilidad del bloque de distribución por tiendas.
   */
  const showStores      = can(accessLevel, "product:view_stores");

  /**
   * Controla la visibilidad del feed de actividad.
   *
   * @remarks
   * Actualmente reutiliza el mismo permiso asociado al dashboard general.
   */
  const showActivity    = can(accessLevel, "product:view_dashboard");

  /**
   * Controla la disponibilidad de exportación de reportes.
   */
  const showExport      = can(accessLevel, "product:create_report");

  // Layout dinámico

  /**
   * Indica si la columna principal del grid debe existir.
   *
   * @remarks
   * La columna principal agrupa el contenido nuclear del módulo,
   * como colecciones y muestras.
   */
  const showMain  = showCollections || showSamples;

  /**
   * Indica si la columna lateral del grid debe existir.
   *
   * @remarks
   * La columna lateral reúne contenido complementario:
   * alertas, quick links, herramientas y calendario.
   */
  const showAside = showAlerts || showQuickLinks || showTools || showCalendar;

  /**
   * Determina si el grid principal debe renderizarse.
   *
   * @remarks
   * Solo se renderiza si existe contenido en la columna principal,
   * en la lateral o en ambas.
   */
  const showGrid  = showMain || showAside;

  /**
   * Clase responsiva aplicada a la columna principal.
   *
   * @remarks
   * Si existe una columna lateral, la principal ocupa 8 columnas;
   * en ausencia de aside, se expande a 12 columnas.
   */
  const mainColClass    = showAside ? "lg:col-span-8"  : "lg:col-span-12";

  /**
   * Clase responsiva aplicada a la columna lateral.
   *
   * @remarks
   * Si existe contenido principal, el aside ocupa 4 columnas;
   * en caso contrario, se expande a ancho completo.
   */
  const asideColClass   = showMain  ? "lg:col-span-4"  : "lg:col-span-12";

  /**
   * Clase de layout interno para la columna lateral.
   *
   * @remarks
   * Cuando solo existe el aside y no hay columna principal,
   * sus elementos se redistribuyen horizontalmente en pantallas grandes
   * para evitar una columna excesivamente estrecha o vertical.
   */
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

<div className="px-6 pb-10">

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