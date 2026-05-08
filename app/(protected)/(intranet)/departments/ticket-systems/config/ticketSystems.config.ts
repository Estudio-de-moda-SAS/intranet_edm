import {
  MonitorCog,
  Users,
  LucideIcon,
  Car,
  Mail,
} from "lucide-react";

export type TicketSystem = {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: LucideIcon;
  accent: string;
  external?: boolean;
};

export const TICKET_SYSTEMS: TicketSystem[] = [
  {
    id: "it-support",
    name: "Solvi",
    description: "Plataforma de soporte y seguimiento de incidencias. Eficiencia, trazabilidad y foco en el usuario.",
    url: "https://blue-river-03def860f.2.azurestaticapps.net/",
    icon: MonitorCog,
    accent: "violet",
    external: true,
  },
  {
    id: "hr-support",
    name: "Capital Humano",
    description: "Plataforma de gestion documental EDM",
    url: "https://lively-coast-08111f510.3.azurestaticapps.net/",
    icon: Users,
    accent: "emerald",
    external: true,
  },
  {
    id: "general-support",
    name: "Mailing",
    description: "Gestión y envío de comunicaciones masivas por correo electrónico",
    url: "https://calm-island-0950bd80f.4.azurestaticapps.net",
    icon: Mail,
    accent: "amber",
    external: true,
  },
  {
    id: "parking",
    name: "Parking",
    description: "Gestión de solicitudes relacionadas con parqueaderos y espacios asignados.",
    url: "https://proud-mushroom-00b1ea00f.1.azurestaticapps.net/",
    icon: Car,
    accent: "amber",
    external: true,
  },
];