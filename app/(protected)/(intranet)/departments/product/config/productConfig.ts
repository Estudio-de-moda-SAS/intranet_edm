// app/product/config/productConfig.ts

/**
 * @module productConfig
 * Configuración del módulo de Producto.
 *
 * @remarks
 * Este módulo centraliza configuraciones utilizadas en la intranet
 * para el área de Producto, incluyendo:
 *
 * - Enlaces rápidos a herramientas y secciones clave
 * - Información del equipo del departamento
 *
 * La información aquí contenida es consumida por componentes como:
 * - Secciones de accesos rápidos
 * - Tarjetas de equipo
 * - Directorios internos
 *
 * Puede evolucionar a una fuente dinámica en el futuro (API o servicio).
 */

/**
 * Representa un enlace rápido dentro del módulo de Producto.
 *
 * @property label Texto visible del enlace.
 * @property href Ruta interna o URL externa.
 * @property icon Nombre del ícono (Lucide) como string.
 * @property external Indica si el enlace es externo (opcional).
 */
export type QuickLink = {
  label:     string;
  href:      string;
  icon:      string;
  external?: boolean;
};

/**
 * Listado de enlaces rápidos del módulo de Producto.
 *
 * @remarks
 * Este arreglo contiene accesos directos a herramientas y secciones
 * clave del flujo de trabajo del área.
 *
 * Incluye tanto rutas internas como enlaces a plataformas externas.
 *
 * @example
 * ```ts
 * productQuickLinks.map(link => link.label);
 * ```
 */
export const productQuickLinks: QuickLink[] = [
  { label: "Fichas técnicas",           href: "/product/techsheets",              icon: "FileText"     },
  { label: "Colecciones",               href: "/product/collections",             icon: "Shirt"        },
  { label: "Estado de muestras",        href: "/product/samples",                 icon: "Scissors"     },
  { label: "Centric PLM",               href: "https://centric.acme.com",         icon: "Layers2",     external: true },
  { label: "Repositorio en SharePoint", href: "https://acme.sharepoint.com/prod", icon: "FolderOpen",  external: true },
  { label: "Proveedores",               href: "/product/suppliers",               icon: "Building2"    },
  { label: "Calendario de temporada",   href: "/product/calendar",                icon: "CalendarDays" },
  { label: "Reportes de colección",     href: "/product/reports",                 icon: "BarChart2"    },
];


// app/product/config/productTeam.ts

import type { DepartmentMember } from "@/types/DepartmentMember";

/**
 * Listado de miembros del equipo de Producto.
 *
 * @remarks
 * Este arreglo contiene los datos estáticos del equipo del área
 * que se muestran en la intranet.
 *
 * Es consumido por componentes de visualización como:
 * - Secciones de equipo
 * - Tarjetas de perfil
 * - Directorios internos
 *
 * @example
 * ```ts
 * productTeam.map(member => member.name);
 * ```
 */
export const productTeam: DepartmentMember[] = [
  {
    id:          "prod-001",
    name:        "Valentina Mendoza",
    role:        "Directora de Producto",
    email:       "v.mendoza@estudiomoda.com.co",
    linkedin:    "https://linkedin.com/in/vmendoza",
    description: "Lidera la visión de colecciones y el ciclo de desarrollo de producto.",
  },
  {
    id:          "prod-002",
    name:        "Carlos Restrepo",
    role:        "Jefe de Desarrollo de Producto",
    email:       "c.restrepo@estudiomoda.com.co",
    description: "Diseño y patronaje · Colecciones principales.",
  },
  {
    id:          "prod-003",
    name:        "Laura Pineda",
    role:        "Diseñadora de Producto",
    email:       "l.pineda@estudiomoda.com.co",
    description: "Colecciones principales SS y FW.",
  },
  {
    id:          "prod-004",
    name:        "Daniela Ospina",
    role:        "Técnica de Calidad",
    email:       "d.ospina@estudiomoda.com.co",
    description: "Muestras, aprobaciones y control de calidad.",
  },
  {
    id:          "prod-005",
    name:        "Sebastián Gómez",
    role:        "Coordinador de Proveedores",
    email:       "s.gomez@estudiomoda.com.co",
    description: "Materias primas, textiles y relación con talleres.",
  },
  {
    id:          "prod-006",
    name:        "María Camila Torres",
    role:        "Analista de Producto",
    email:       "mc.torres@estudiomoda.com.co",
    description: "Reportes, KPIs y seguimiento de colecciones.",
  },
];