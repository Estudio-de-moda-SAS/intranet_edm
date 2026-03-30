import type { QuickLinkItem } from "@/app/components/ui/QuickLinksSection";

export const homeQuickLinks: QuickLinkItem[] = [
  {
    label: "Recursos Humanos",
    href: "/departments/human-resources",
    icon: 'FileText',
    description: "Gestión de personal",
    color: "purple",
  },
  {
    label: "Vacaciones",
    href: "/vacaciones",
    icon: 'Calendar',
    description: "Solicitudes y saldos",
    color: "teal",
  },
  {
    label: "Soporte TI",
    href: "/departments/it",
    icon: 'Wrench',
    description: "Mesa de ayuda técnica",
    color: "blue",
  },
  {
    label: "Empleados",
    href: "/directory",
    icon: 'Users',
    description: "Directorio corporativo",
    color: "pink",
  },
  {
    label: "Capacitaciones",
    href: "/capacitaciones",
    icon: 'BookOpen',
    description: "Cursos y formación",
    color: "amber",
  },
  {
    label: "Comunicados",
    href: "/noticias",
    icon: 'MessageSquare',
    description: "Noticias internas",
    color: "coral",
  },
  {
    label: "Reportes",
    href: "/reportes",
    icon: 'BarChart2',
    description: "Métricas y análisis",
    color: "green",
  },
  {
    label: "Inventario",
    href: "/inventario",
    icon: 'Package',
    description: "Control de activos",
    color: "amber",
  },
];