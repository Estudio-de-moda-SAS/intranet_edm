/**
 * @module retailQuickLinks
 * Configuración de accesos rápidos del módulo de Retail.
 *
 * @remarks
 * Este módulo define el listado de accesos rápidos (quick links)
 * disponibles dentro de la sección de Retail en la intranet.
 *
 * Cada acceso rápido representa una acción o navegación relevante
 * dentro de alguno de los frentes operativos:
 * - Analítica
 * - Canal Comercial (B2B)
 * - E-Commerce
 * - Tiendas físicas
 *
 * A diferencia de un listado estático de enlaces, este dataset
 * incorpora lógica de control de acceso basada en permisos,
 * permitiendo:
 * - mostrar u ocultar enlaces según el rol del usuario
 * - habilitar o deshabilitar acciones específicas
 * - comunicar restricciones mediante mensajes contextualizados
 *
 * Este módulo es consumido por componentes como:
 * - {@link QuickLinksSection}
 * - paneles de navegación contextual
 *
 * ⚠️ La lógica de permisos se basa en claves definidas en el sistema
 * de roles (`roles.ts`) y evaluadas en tiempo de render.
 */

import type { QuickLinkConfig } from "@/lib/quickLinksAccess";

/**
 * Listado de accesos rápidos del módulo de Retail.
 *
 * @remarks
 * Cada elemento define una acción disponible en la interfaz,
 * junto con sus condiciones de acceso y comportamiento visual.
 *
 * Campos relevantes:
 * - `label`: texto visible del acceso
 * - `href`: ruta de navegación
 * - `icon`: nombre del ícono (resuelto dinámicamente)
 * - `color`: color visual del acceso
 * - `requiredPermission`: permiso mínimo para visualizar el enlace
 * - `enabledPermission`: permiso adicional requerido para habilitar interacción (opcional)
 * - `disabledMsg`: mensaje mostrado cuando el acceso está deshabilitado
 *
 * 🔐 Modelo de permisos:
 *
 * 1. `requiredPermission`
 *    - Determina si el acceso se renderiza o no
 *
 * 2. `enabledPermission` (opcional)
 *    - Si existe, el enlace puede mostrarse pero no ser interactivo
 *    - Permite diferenciar entre visibilidad y acción
 *
 * Esto permite escenarios como:
 * - usuarios que ven información pero no pueden ejecutar acciones
 * - control granular por tipo de operación
 *
 * 📌 Organización:
 *
 * Los accesos están agrupados por dominio funcional:
 * - Públicos
 * - Comercial
 * - E-Commerce
 * - Tiendas
 *
 * @example
 * ```ts
 * retailQuickLinks.filter(link => link.requiredPermission === "retail:view_ecommerce");
 * ```
 */
export const retailQuickLinks: QuickLinkConfig[] = [

  // ── Públicos — todos pueden ver ───────────────────────────────
  {
    label: "Analítica retail",
    href: "/retail/analitica",
    icon: "BarChart2",
    color: "purple",
    requiredPermission: "retail:view_kpis",
    enabledPermission:  "retail:view_analytics",
    disabledMsg: "Solo el equipo Retail puede ver analítica detallada"
  },

  // ── Comercial — retail + admin ────────────────────────────────
  {
    label: "Nueva oportunidad",
    href: "/comercial/oportunidades/nueva",
    icon: "PlusCircle",
    color: "blue",
    requiredPermission: "retail:view_commercial",
    disabledMsg: "Acceso restringido al equipo Retail"
  },
  {
    label: "Pipeline comercial",
    href: "/comercial/pipeline",
    icon: "TrendingUp",
    color: "purple",
    requiredPermission: "retail:view_commercial",
    disabledMsg: "Acceso restringido al equipo Retail"
  },
  {
    label: "Crear pedido B2B",
    href: "/comercial/pedidos/nuevo",
    icon: "ClipboardList",
    color: "teal",
    requiredPermission: "retail:view_commercial",
    disabledMsg: "Acceso restringido al equipo Retail"
  },
  {
    label: "Informe de ventas",
    href: "/comercial/informes/ventas",
    icon: "FileText",
    color: "amber",
    requiredPermission: "retail:view_kpis",
    enabledPermission:  "retail:view_commercial",
    disabledMsg: "Solo el equipo Retail puede ver informes de ventas"
  },

  // ── E-Commerce — retail + admin ───────────────────────────────
  {
    label: "Nuevo producto",
    href: "/ecommerce/productos/nuevo",
    icon: "FilePlus",
    color: "green",
    requiredPermission: "retail:view_ecommerce",
    disabledMsg: "Acceso restringido al equipo Retail"
  },
  {
    label: "Ver órdenes online",
    href: "/ecommerce/ordenes",
    icon: "Receipt",
    color: "blue",
    requiredPermission: "retail:view_ecommerce",
    disabledMsg: "Acceso restringido al equipo Retail"
  },
  {
    label: "Gestionar catálogo",
    href: "/ecommerce/catalogo",
    icon: "LayoutDashboard",
    color: "purple",
    requiredPermission: "retail:view_ecommerce",
    disabledMsg: "Acceso restringido al equipo Retail"
  },
  {
    label: "Reseñas pendientes",
    href: "/ecommerce/resenas",
    icon: "MessageSquare",
    color: "pink",
    requiredPermission: "retail:view_ecommerce",
    disabledMsg: "Acceso restringido al equipo Retail"
  },

  // ── Tiendas — retail + admin ──────────────────────────────────
  {
    label: "Mapa de tiendas",
    href: "/tiendas/mapa",
    icon: "Globe",
    color: "teal",
    requiredPermission: "retail:view_stores",
    disabledMsg: "Acceso restringido al equipo Retail"
  },
  {
    label: "Reportar incidencia",
    href: "/tiendas/incidencias/nueva",
    icon: "Bell",
    color: "coral",
    requiredPermission: "retail:view_stores",
    disabledMsg: "Acceso restringido al equipo Retail"
  },
  {
    label: "Reposición de stock",
    href: "/tiendas/reposicion",
    icon: "Briefcase",
    color: "amber",
    requiredPermission: "retail:view_stores",
    disabledMsg: "Acceso restringido al equipo Retail"
  },
];