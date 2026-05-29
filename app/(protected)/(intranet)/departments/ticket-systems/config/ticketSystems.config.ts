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
  details: string;
  useCases?: string[];
  url: string;
  icon: LucideIcon;
  accent: string;
  external?: boolean;
};

export const TICKET_SYSTEMS: TicketSystem[] = [
  {
    id: "it-support",
    name: "Solvi",
    description:
      "Plataforma de soporte y seguimiento de incidencias.",
    details:
      "Solvi es la plataforma principal utilizada para gestionar incidencias, solicitudes técnicas y requerimientos relacionados con sistemas internos, accesos y soporte operativo de LISTO.",
    useCases: [
      "Reportar fallas técnicas",
      "Solicitar accesos a plataformas",
      "Gestionar incidencias operativas",
      "Hacer seguimiento a tickets abiertos",
    ],
    url: "https://blue-river-03def860f.2.azurestaticapps.net/",
    icon: MonitorCog,
    accent: "violet",
    external: true,
  },

  {
    id: "hr-support",
    name: "Capital Humano",
    description:
      "Plataforma de gestión documental EDM.",
    details:
      "La aplicación de Capital Humano permite gestionar procesos y documentación relacionada con talento humano, solicitudes internas y recursos corporativos asociados al colaborador.",
    useCases: [
      "Gestionar solicitudes de RRHH",
      "Acceder a recursos del colaborador",
      "Centralizar procesos administrativos",
    ],
    url: "https://lively-coast-08111f510.3.azurestaticapps.net/",
    icon: Users,
    accent: "emerald",
    external: true,
  },

  {
  id: "general-support",
  name: "Servicios Administrativos",
  description:
    "Gestión de accesos, visitantes y solicitudes operativas de recepción.",
  details:
    "Servicios Administrativos permite gestionar procesos relacionados con recepción, control de acceso, visitantes y administración de tarjetas para ingreso a las instalaciones.",
  useCases: [
    "Registrar visitantes",
    "Gestionar tarjetas de acceso",
    "Controlar ingresos y accesos",
    "Realizar solicitudes operativas de recepción",
  ],
  url: "https://victorious-field-074e1b00f.7.azurestaticapps.net/",
  icon: Mail,
  accent: "sky",
  external: true,
  },
  {
    id: "parking",
    name: "Parking",
    description:
      "Gestión de solicitudes relacionadas con parqueaderos y espacios asignados.",
    details:
      "Parking permite administrar solicitudes relacionadas con espacios de parqueadero, asignaciones y control de disponibilidad para colaboradores.",
    useCases: [
      "Solicitar espacio de parqueadero",
      "Consultar disponibilidad",
      "Gestionar asignaciones",
      "Realizar novedades relacionadas con parking",
    ],
    url: "https://proud-mushroom-00b1ea00f.1.azurestaticapps.net/",
    icon: Car,
    accent: "amber",
    external: true,
  },
];