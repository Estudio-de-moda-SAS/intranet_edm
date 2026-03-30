import type { QuickLinkConfig } from "@/lib/quickLinksAccess";

export const itQuickLinks: QuickLinkConfig[] = [
  // Abrir ticket — todos (employee+)
  { label: "Abrir ticket",            href: "/it/tickets/nuevo",                   icon: "FilePlus",     color: "blue",
    description: "Soporte técnico" },
  // Activos — manager+, habilitado solo it+
  { label: "Portal de activos",       href: "/it/activos",                         icon: "LayoutDashboard", color: "teal",
    description: "Gestión de equipos",
    requiredPermission: "it:view_kpis",
    enabledPermission:  "it:view_dashboard",
    disabledMsg: "Solo el equipo de TI puede gestionar activos" },
  // Documentación — todos
  { label: "Documentación técnica",   href: "https://confluence.corp.internal/it", icon: "BookOpen",     color: "purple",
    description: "Confluence" },
  // Zabbix — solo it + admin
  { label: "Panel Zabbix",            href: "https://zabbix.corp.internal",        icon: "Activity",     color: "coral",
    description: "Monitoreo",
    requiredPermission: "it:view_server_monitor",
    disabledMsg: "Acceso restringido al equipo de TI" },
  // IAM — solo it + admin
  { label: "Gestión de accesos",      href: "/it/iam",                             icon: "KeyRound",     color: "amber",
    description: "IAM",
    requiredPermission: "it:view_service_status",
    disabledMsg: "Solo el equipo de TI puede gestionar accesos" },
  // GitLab — solo it + admin
  { label: "Repositorio GitLab",      href: "https://gitlab.corp.internal/it",     icon: "GitBranch",    color: "green",
    description: "Scripts y código",
    requiredPermission: "it:view_dashboard",
    disabledMsg: "Acceso restringido al equipo de TI" },
  // Políticas seguridad — manager+
  { label: "Políticas de seguridad",  href: "/it/politicas-seguridad",             icon: "ShieldCheck",  color: "teal",
    requiredPermission: "it:view_kpis" },
  // Hardware — todos
  { label: "Solicitud de equipos",    href: "/it/solicitud-hardware",              icon: "Package",      color: "blue",
    description: "Hardware" },
];