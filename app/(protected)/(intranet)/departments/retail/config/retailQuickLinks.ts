import type { QuickLinkConfig } from "@/lib/quickLinksAccess";

export const retailQuickLinks: QuickLinkConfig[] = [

  // ── Públicos — todos pueden ver ───────────────────────────────
  { label: "Analítica retail",    href: "/retail/analitica",              icon: "BarChart2",      color: "purple",
    requiredPermission: "retail:view_kpis",
    enabledPermission:  "retail:view_analytics",
    disabledMsg: "Solo el equipo Retail puede ver analítica detallada" },

  // ── Comercial — retail + admin ────────────────────────────────
  { label: "Nueva oportunidad",  href: "/comercial/oportunidades/nueva", icon: "PlusCircle",     color: "blue",
    requiredPermission: "retail:view_commercial",
    disabledMsg: "Acceso restringido al equipo Retail" },
  { label: "Pipeline comercial", href: "/comercial/pipeline",            icon: "TrendingUp",     color: "purple",
    requiredPermission: "retail:view_commercial",
    disabledMsg: "Acceso restringido al equipo Retail" },
  { label: "Crear pedido B2B",   href: "/comercial/pedidos/nuevo",       icon: "ClipboardList",  color: "teal",
    requiredPermission: "retail:view_commercial",
    disabledMsg: "Acceso restringido al equipo Retail" },
  { label: "Informe de ventas",  href: "/comercial/informes/ventas",     icon: "FileText",       color: "amber",
    requiredPermission: "retail:view_kpis",
    enabledPermission:  "retail:view_commercial",
    disabledMsg: "Solo el equipo Retail puede ver informes de ventas" },

  // ── E-Commerce — retail + admin ───────────────────────────────
  { label: "Nuevo producto",     href: "/ecommerce/productos/nuevo",     icon: "FilePlus",       color: "green",
    requiredPermission: "retail:view_ecommerce",
    disabledMsg: "Acceso restringido al equipo Retail" },
  { label: "Ver órdenes online", href: "/ecommerce/ordenes",             icon: "Receipt",        color: "blue",
    requiredPermission: "retail:view_ecommerce",
    disabledMsg: "Acceso restringido al equipo Retail" },
  { label: "Gestionar catálogo", href: "/ecommerce/catalogo",            icon: "LayoutDashboard", color: "purple",
    requiredPermission: "retail:view_ecommerce",
    disabledMsg: "Acceso restringido al equipo Retail" },
  { label: "Reseñas pendientes", href: "/ecommerce/resenas",             icon: "MessageSquare",  color: "pink",
    requiredPermission: "retail:view_ecommerce",
    disabledMsg: "Acceso restringido al equipo Retail" },

  // ── Tiendas — retail + admin ──────────────────────────────────
  { label: "Mapa de tiendas",    href: "/tiendas/mapa",                  icon: "Globe",          color: "teal",
    requiredPermission: "retail:view_stores",
    disabledMsg: "Acceso restringido al equipo Retail" },
  { label: "Reportar incidencia", href: "/tiendas/incidencias/nueva",   icon: "Bell",           color: "coral",
    requiredPermission: "retail:view_stores",
    disabledMsg: "Acceso restringido al equipo Retail" },
  { label: "Reposición de stock", href: "/tiendas/reposicion",          icon: "Briefcase",      color: "amber",
    requiredPermission: "retail:view_stores",
    disabledMsg: "Acceso restringido al equipo Retail" },
];