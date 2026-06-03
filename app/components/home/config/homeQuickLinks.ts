import type { QuickLinkItem } from "@/app/components/ui/QuickLinksSection";

export const homeQuickLinks: QuickLinkItem[] = [
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
    label: "Documentos",
    href: "/departments/documents",
    icon: "FolderOpen",
    description: "Documentación corporativa",
    color: "purple",
  },
  {
    label: "Tickets",
    href: "/departments/ticket-systems",
    icon: "Wrench",
    description: "Plataformas de soporte",
    color: "purple",
  },
  {
    label: "Aplicaciones",
    href: "/departments/applications",
    icon: "Grid3X3",
    description: "Herramientas corporativas",
    color: "purple",
  },
  {
    label: "Tableros",
    href: "/departments/boards",
    icon: "BarChart2",
    description: "Indicadores y seguimiento",
    color: "purple",
  },
];