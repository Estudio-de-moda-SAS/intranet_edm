/**
 * @module productTeam
 * Configuración del equipo del módulo de Producto.
 *
 * @remarks
 * Este módulo define el listado de integrantes del departamento de Producto
 * y provee un dataset estático utilizado en la intranet.
 *
 * La información aquí contenida es consumida por componentes como:
 * - Secciones de equipo
 * - Tarjetas de perfil
 * - Directorios internos
 *
 * Puede evolucionar a una fuente dinámica en el futuro (API o servicio).
 */

import type { DepartmentMember } from "@/types/DepartmentMember";

/**
 * Listado de miembros del equipo de Producto.
 *
 * @remarks
 * Este arreglo contiene los datos del equipo del área que se muestran
 * en la intranet.
 *
 * Cada elemento representa un colaborador con su información básica
 * (identificación, rol y contacto).
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