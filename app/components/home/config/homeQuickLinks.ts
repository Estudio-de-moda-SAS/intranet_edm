import type { QuickLinkItem } from "@/app/components/ui/QuickLinksSection";

export const microsoft365QuickLinks: QuickLinkItem[] = [
  {
    label: "Outlook",
    href: "https://outlook.office.com",
    icon: "Mail",
    description: "Correo corporativo",
    color: "purple",
    external: true,
  },
  {
    label: "Teams",
    href: "https://teams.microsoft.com",
    icon: "Users",
    description: "Chat y reuniones",
    color: "purple",
    external: true,
  },
  {
    label: "Calendario",
    href: "https://outlook.office.com/calendar",
    icon: "Calendar",
    description: "Agenda corporativa",
    color: "purple",
    external: true,
  },
  {
    label: "OneDrive",
    href: "https://www.office.com/launch/onedrive",
    icon: "Cloud",
    description: "Archivos personales",
    color: "purple",
    external: true,
  },
  {
  label: "SharePoint",
  href: "https://www.office.com/launch/sharepoint",
  icon: "FolderOpen",
  description: "Sitios y documentos",
  color: "purple",
  external: true,
},
{
  label: "Power BI",
  href: "https://app.powerbi.com",
  icon: "BarChart2",
  description: "Reportes y métricas",
  color: "purple",
  external: true,
},
{
  label: "Forms",
  href: "https://forms.office.com",
  icon: "FileText",
  description: "Formularios y encuestas",
  color: "purple",
  external: true,
},
{
  label: "Excel",
  href: "https://excel.cloud.microsoft/",
  icon: "ClipboardList",
  description: "Hojas de cálculo",
  color: "purple",
  external: true,
},
];

export const homeWorkspaceLinks: QuickLinkItem[] = [
  {
    label: "Documentos",
    href: "/departments/documents",
    icon: "FolderOpen",
    description: "",
    color: "teal",
  },
  {
    label: "Tickets",
    href: "/departments/ticket-systems",
    icon: "Wrench",
    description: "",
    color: "blue",
  },
  {
    label: "Aplicaciones",
    href: "/departments/applications",
    icon: "LayoutDashboard",
    description: "",
    color: "purple",
  },
  {
    label: "Tableros",
    href: "/departments/boards",
    icon: "BarChart2",
    description: "",
    color: "pink",
  },
];