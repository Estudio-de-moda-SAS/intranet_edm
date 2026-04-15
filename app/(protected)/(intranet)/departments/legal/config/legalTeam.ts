/**
 * @module legalTeam
 * Configuración del equipo del departamento jurídico.
 *
 * @remarks
 * Este módulo define la estructura de los miembros del equipo legal
 * y provee un listado estático utilizado en la intranet.
 *
 * La información aquí contenida es consumida por componentes como:
 * - Secciones de equipo
 * - Tarjetas de contacto
 * - Directorios internos
 *
 * Puede evolucionar a una fuente dinámica en el futuro (API o servicio).
 */

// app/(protected)/(intranet)/departments/legal/config/legalTeam.ts

/**
 * Representa un miembro del equipo jurídico.
 *
 * @property id Identificador único del miembro.
 * @property name Nombre completo del colaborador.
 * @property role Cargo o rol dentro del área legal.
 * @property email Correo corporativo.
 * @property phone Extensión telefónica o contacto interno (opcional).
 * @property avatarUrl URL de la imagen de perfil (opcional).
 * @property area Área funcional dentro del departamento jurídico.
 *
 * @remarks
 * El campo `area` permite agrupar miembros por especialidad:
 * - Dirección
 * - Contratos
 * - Compliance
 * - Laboral
 * - Litigios
 */
export type TeamMember = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  area: string;
};

/**
 * Listado de miembros del equipo jurídico.
 *
 * @remarks
 * Este arreglo contiene los datos estáticos del equipo legal
 * que se muestran en la intranet.
 *
 * Está organizado por áreas funcionales para facilitar
 * su visualización y categorización.
 *
 * @example
 * ```ts
 * legalTeam.map(member => member.name);
 * ```
 */
export const legalTeam: TeamMember[] = [
  {
    id: "leg-1",
    name: "Alejandro Peña",
    role: "Director Jurídico",
    email: "a.pena@empresa.com",
    phone: "Ext. 1200",
    area: "Dirección",
  },
  {
    id: "leg-2",
    name: "Valentina Cruz",
    role: "Abogada Senior — Contratos",
    email: "v.cruz@empresa.com",
    phone: "Ext. 1202",
    area: "Contratos",
  },
  {
    id: "leg-3",
    name: "Rodrigo Ibáñez",
    role: "Abogado — Compliance y Privacidad",
    email: "r.ibanez@empresa.com",
    phone: "Ext. 1204",
    area: "Compliance",
  },
  {
    id: "leg-4",
    name: "Camila Fuentes",
    role: "Abogada — Laboral",
    email: "c.fuentes@empresa.com",
    phone: "Ext. 1206",
    area: "Laboral",
  },
  {
    id: "leg-5",
    name: "Tomás Herrera",
    role: "Abogado — Litigios",
    email: "t.herrera@empresa.com",
    phone: "Ext. 1208",
    area: "Litigios",
  },
  {
    id: "leg-6",
    name: "Isabela Montoya",
    role: "Asistente Jurídica",
    email: "i.montoya@empresa.com",
    phone: "Ext. 1201",
    area: "Dirección",
  },
];