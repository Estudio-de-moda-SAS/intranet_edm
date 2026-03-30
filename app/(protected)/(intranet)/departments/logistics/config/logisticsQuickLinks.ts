import type { QuickLinkConfig } from "@/lib/quickLinksAccess";

export const logisticsQuickLinks: QuickLinkConfig[] = [
  // Nuevo envío — manager+
  { label: "Nuevo envío",       href: "/logistica/envios/nuevo", icon: "Briefcase",   color: "blue",
    description: "Registrar un despacho",
    requiredPermission: "logistics:view_shipments" },
  // Gestión de stock — logistics + admin
  { label: "Gestión de stock",  href: "/logistica/inventario",   icon: "Package",     color: "teal",
    description: "Ver niveles por SKU",
    requiredPermission: "logistics:view_warehouses",
    disabledMsg: "Solo el equipo de Logística puede gestionar stock" },
  // Almacenes — logistics + admin
  { label: "Almacenes",         href: "/logistica/almacenes",    icon: "Briefcase",   color: "amber",
    description: "Estado y capacidad",
    requiredPermission: "logistics:view_warehouses",
    disabledMsg: "Acceso restringido al equipo de Logística" },
  // Órdenes de compra — manager+
  { label: "Órdenes de compra", href: "/logistica/compras",      icon: "ClipboardList", color: "purple",
    description: "Proveedores y recepciones",
    requiredPermission: "logistics:view_operations" },
  // Rutas — manager+
  { label: "Rutas activas",     href: "/logistica/rutas",        icon: "Globe",       color: "green",
    description: "Tracking en tiempo real",
    requiredPermission: "logistics:view_shipments" },
  // Incidencias — manager+
  { label: "Incidencias",       href: "/logistica/incidencias",  icon: "Bell",        color: "coral",
    description: "Reclamaciones y retrasos",
    requiredPermission: "logistics:view_operations" },
  // Reportes — logistics + admin
  { label: "Reportes",          href: "/logistica/reportes",     icon: "BarChart2",   color: "blue",
    description: "Exportar métricas",
    requiredPermission: "logistics:view_analytics",
    disabledMsg: "Acceso restringido al equipo de Logística" },
  // Configuración — logistics + admin
  { label: "Configuración",     href: "/logistica/config",       icon: "Settings",    color: "purple",
    description: "Parámetros del módulo",
    requiredPermission: "logistics:view_warehouses",
    disabledMsg: "Solo el equipo de Logística puede configurar el módulo" },
];