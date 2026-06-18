import type { OrganizationUnit } from "../types/organization.types";

export const ORGANIZATION_STRUCTURE: OrganizationUnit = {
  id: "general-management",
  name: "Gerencia General",
  leader: "Dirección General",
  employeeCount: 1,
  contactEmail: "direccion.general@estudiodemoda.com",
  teamsUrl:
    "https://teams.microsoft.com/l/chat/0/0?users=direccion.general@estudiodemoda.com",
  location: "Sede administrativa",
  description:
    "Lidera la estrategia corporativa, la toma de decisiones principales y la articulación de las áreas de la compañía.",

  children: [
    {
      id: "technology",
      name: "Procesos y TI",
      leader: "Gerente de Procesos y TI",
      parentName: "Gerencia General",
      employeeCount: 8,
      contactEmail: "mballen@estudiodemoda.com",
      graphUserEmail: "mballen@estudiodemoda.com.co",
      teamsUrl:
        "https://teams.microsoft.com/l/chat/0/0?users=tecnologia@estudiodemoda.com",
      location: "Sede administrativa",
      description:
        "Soporte, desarrollo interno, infraestructura, automatización y soluciones digitales para la operación corporativa.",
      children: [
        {
          id: "development",
          name: "Desarrollo",
          leader: "Equipo de Desarrollo",
          parentName: "Tecnología",
          employeeCount: 4,
          contactEmail: "desarrollo@estudiodemoda.com",
          teamsUrl:
            "https://teams.microsoft.com/l/chat/0/0?users=desarrollo@estudiodemoda.com",
          location: "Sede administrativa",
          description:
            "Construcción, mantenimiento y mejora continua de soluciones digitales internas.",
        },
        {
          id: "support",
          name: "Mesa de Ayuda",
          leader: "Soporte TI",
          parentName: "Tecnología",
          employeeCount: 4,
          contactEmail: "soporte.ti@estudiodemoda.com",
          teamsUrl:
            "https://teams.microsoft.com/l/chat/0/0?users=soporte.ti@estudiodemoda.com",
          location: "Sede administrativa",
          description:
            "Atención de requerimientos, incidentes, accesos, soporte operativo y acompañamiento tecnológico.",
        },
      ],
    },
    {
      id: "human-talent",
      name: "Capital Humano",
      leader: "Gerente de Capital Humano",
      parentName: "Gerencia General",
      employeeCount: 12,
      contactEmail: "talento.humano@estudiodemoda.com",
      graphUserEmail: "larendon@estudiodemoda.com.co",
      teamsUrl:
        "https://teams.microsoft.com/l/chat/0/0?users=talento.humano@estudiodemoda.com",
      location: "Sede administrativa",
      description:
        "Gestión del talento, bienestar, selección, formación, acompañamiento y procesos internos asociados al ciclo de vida del colaborador.",
      children: [
        {
          id: "selection",
          name: "Selección",
          leader: "Equipo de Selección",
          parentName: "Talento Humano",
          employeeCount: 5,
          contactEmail: "seleccion@estudiodemoda.com",
          teamsUrl:
            "https://teams.microsoft.com/l/chat/0/0?users=seleccion@estudiodemoda.com",
          location: "Sede administrativa",
          description:
            "Procesos de atracción, evaluación, vinculación y acompañamiento inicial del talento.",
        },
        {
          id: "wellbeing",
          name: "Bienestar",
          leader: "Equipo de Bienestar",
          parentName: "Talento Humano",
          employeeCount: 7,
          contactEmail: "bienestar@estudiodemoda.com",
          teamsUrl:
            "https://teams.microsoft.com/l/chat/0/0?users=bienestar@estudiodemoda.com",
          location: "Sede administrativa",
          description:
            "Acompañamiento, beneficios, clima organizacional, cultura interna y bienestar laboral.",
        },
      ],
    },
    {
      id: "commercial",
      name: "Comercial",
      leader: "Dirección Comercial",
      parentName: "Gerencia General",
      employeeCount: 35,
      contactEmail: "comercial@estudiodemoda.com",
      teamsUrl:
        "https://teams.microsoft.com/l/chat/0/0?users=comercial@estudiodemoda.com",
      location: "Sede administrativa / tiendas",
      description:
        "Ventas, canales comerciales, tiendas, relacionamiento con clientes y operación comercial de marcas.",
      children: [
        {
          id: "stores",
          name: "Tiendas",
          leader: "Operación Retail",
          parentName: "Comercial",
          employeeCount: 25,
          contactEmail: "tiendas@estudiodemoda.com",
          teamsUrl:
            "https://teams.microsoft.com/l/chat/0/0?users=tiendas@estudiodemoda.com",
          location: "Puntos de venta",
          description:
            "Gestión comercial, atención al cliente y operación diaria de tiendas físicas.",
        },
        {
          id: "ecommerce",
          name: "E-commerce",
          leader: "Canal Digital",
          parentName: "Comercial",
          employeeCount: 10,
          contactEmail: "ecommerce@estudiodemoda.com",
          teamsUrl:
            "https://teams.microsoft.com/l/chat/0/0?users=ecommerce@estudiodemoda.com",
          location: "Sede administrativa",
          description:
            "Ventas digitales, experiencia de compra online, operación web y gestión de canales digitales.",
        },
      ],
    },
    {
      id: "logistics",
      name: "Logística",
      leader: "Coordinación Logística",
      parentName: "Gerencia General",
      employeeCount: 20,
      contactEmail: "logistica@estudiodemoda.com",
      teamsUrl:
        "https://teams.microsoft.com/l/chat/0/0?users=logistica@estudiodemoda.com",
      location: "Centro de distribución",
      description:
        "Distribución, inventario, abastecimiento, recepción, despacho y operación logística.",
    },
    {
      id: "finance",
      name: "Finanzas",
      leader: "Dirección Financiera",
      parentName: "Gerencia General",
      employeeCount: 10,
      contactEmail: "finanzas@estudiodemoda.com",
      teamsUrl:
        "https://teams.microsoft.com/l/chat/0/0?users=finanzas@estudiodemoda.com",
      location: "Sede administrativa",
      description:
        "Gestión financiera, presupuestos, cartera, pagos, control administrativo y acompañamiento contable.",
    },
    {
      id: "legal",
      name: "Jurídico",
      leader: "Área Jurídica",
      parentName: "Gerencia General",
      employeeCount: 4,
      contactEmail: "juridico@estudiodemoda.com",
      teamsUrl:
        "https://teams.microsoft.com/l/chat/0/0?users=juridico@estudiodemoda.com",
      location: "Sede administrativa",
      description:
        "Soporte legal, contratos, cumplimiento normativo, gestión documental y acompañamiento jurídico interno.",
    },
  ],
};