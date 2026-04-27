/**
 * @module financeQuickLinks
 * Configuración de accesos rápidos (Quick Links) para el módulo financiero.
 *
 * @remarks
 * Este archivo define los accesos directos visibles en la interfaz
 * del área de Finanzas.
 *
 * Cada enlace incluye:
 *
 * - información visual (label, icono, color)
 * - ruta de navegación
 * - control de acceso basado en permisos
 *
 * Permite centralizar la lógica de visibilidad y habilitación
 * de módulos dentro del sistema.
 */

import type { QuickLinkConfig } from "@/lib/quickLinksAccess";

/* -------------------------------------------------------------------------- */
/* Configuración de accesos                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Lista de accesos rápidos del módulo financiero.
 *
 * @remarks
 * Cada objeto define un acceso directo a un submódulo,
 * junto con las reglas de permisos asociadas.
 *
 * Tipos de permisos:
 *
 * - `requiredPermission`:
 *   Determina si el enlace es visible para el usuario.
 *
 * - `enabledPermission` (opcional):
 *   Determina si el enlace está habilitado (clickeable).
 *
 *   Si el usuario no tiene este permiso:
 *   - el link se muestra deshabilitado
 *   - se presenta un mensaje (`disabledMsg`)
 *
 * Esto permite distinguir entre:
 * - visibilidad del módulo
 * - capacidad real de interacción
 *
 * @example
 * ```ts
 * financeQuickLinks.map(link => (
 *   <QuickLinkCard key={link.href} config={link} />
 * ));
 * ```
 */
export const financeQuickLinks: QuickLinkConfig[] = [
  {
    label: "Presupuesto",
    href: "/finance/budget",
    icon: "PieChart",
    color: "purple",
    requiredPermission: "finance:view_kpis",
    enabledPermission: "finance:view_modules",
    disabledMsg: "Solo el equipo de Finanzas puede acceder al presupuesto",
  },
  {
    label: "Gastos",
    href: "/finance/expenses",
    icon: "Receipt",
    color: "amber",
    requiredPermission: "finance:view_kpis",
    enabledPermission: "finance:view_modules",
    disabledMsg: "Solo el equipo de Finanzas puede gestionar gastos",
  },
  {
    label: "Tesorería",
    href: "/finance/treasury",
    icon: "Landmark",
    color: "teal",
    requiredPermission: "finance:view_kpis",
    enabledPermission: "finance:view_modules",
    disabledMsg: "Acceso restringido al equipo de Finanzas",
  },
  {
    label: "Reportes",
    href: "/finance/reports",
    icon: "BarChart2",
    color: "blue",
    requiredPermission: "finance:view_reports",
  },
  {
    label: "Pagos",
    href: "/finance/payments",
    icon: "CreditCard",
    color: "green",
    requiredPermission: "finance:view_kpis",
    enabledPermission: "finance:view_modules",
    disabledMsg: "Solo el equipo de Finanzas puede gestionar pagos",
  },
  {
    label: "Proveedores",
    href: "/finance/vendors",
    icon: "Users",
    color: "coral",
    requiredPermission: "finance:view_kpis",
    enabledPermission: "finance:view_modules",
    disabledMsg: "Acceso restringido al equipo de Finanzas",
  },
  {
    label: "Facturas",
    href: "/finance/invoices",
    icon: "FileText",
    color: "purple",
    requiredPermission: "finance:view_kpis",
    enabledPermission: "finance:view_modules",
    disabledMsg: "Solo el equipo de Finanzas puede ver facturas",
  },
  {
    label: "Proyecciones",
    href: "/finance/forecast",
    icon: "TrendingUp",
    color: "blue",
    requiredPermission: "finance:view_dashboard",
    enabledPermission: "finance:view_modules",
    disabledMsg: "Acceso restringido al equipo de Finanzas",
  },
];