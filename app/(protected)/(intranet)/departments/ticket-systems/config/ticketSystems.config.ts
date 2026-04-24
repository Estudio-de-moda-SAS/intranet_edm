import {
  Headphones,
  MonitorCog,
  Users,
  Building2,
  LucideIcon,
  Car,
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
    description: "Soporte técnico, accesos, equipos y plataformas internas.",
    url: "#",
    icon: MonitorCog,
    accent: "violet",
    external: true,
  },
  {
    id: "hr-support",
    name: "Solicitudes RRHH",
    description: "Casos relacionados con talento humano y servicios al colaborador.",
    url: "#",
    icon: Users,
    accent: "emerald",
    external: true,
  },
  {
    id: "general-support",
    name: "Soporte General",
    description: "Canal para solicitudes internas y requerimientos administrativos.",
    url: "#",
    icon: Headphones,
    accent: "amber",
    external: true,
  },
  {
    id: "facilities-support",
    name: "Servicios Administrativos",
    description: "Solicitudes de infraestructura, espacios físicos y servicios generales.",
    url: "#",
    icon: Building2,
    accent: "sky",
    external: true,
  },
  {
    id: "parking",
    name: "Parking",
    description: "Gestión de solicitudes relacionadas con parqueaderos y espacios asignados.",
    url: "#",
    icon: Car,
    accent: "amber",
    external: true,
  },
];