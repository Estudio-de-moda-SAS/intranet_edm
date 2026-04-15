/**
 * @module AdminTeamConfig
 * Configuración del equipo del módulo de Servicios Administrativos.
 *
 * Define la estructura y la información base de los miembros del equipo
 * mostrados en la intranet para esta área.
 *
 * @remarks
 * Esta configuración es consumida por componentes como la sección de equipo
 * del departamento para renderizar información de contacto, cargo y área
 * funcional de cada integrante.
 */

// app/(protected)/(intranet)/departments/administrative/config/adminTeam.ts

/**
 * Representa a un integrante del equipo de Servicios Administrativos.
 *
 * @property id Identificador único del miembro.
 * @property name Nombre completo del integrante.
 * @property role Cargo o rol dentro del área.
 * @property email Correo de contacto corporativo.
 * @property phone Extensión o teléfono interno de contacto.
 * @property avatarUrl URL opcional del avatar o imagen de perfil.
 * @property area Área funcional a la que pertenece dentro del departamento.
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
 * Lista de integrantes del equipo de Servicios Administrativos.
 *
 * @remarks
 * Esta colección se utiliza para mostrar al usuario final quiénes conforman
 * el equipo del área, facilitando la identificación de responsables y
 * puntos de contacto según la necesidad o trámite requerido.
 */
export const adminTeam: TeamMember[] = [
  {
    id: "adm-1",
    name: "Mariana Solís",
    role: "Directora Administrativa",
    email: "m.solis@empresa.com",
    phone: "Ext. 1100",
    area: "Dirección",
  },
  {
    id: "adm-2",
    name: "Ricardo Fuentes",
    role: "Coordinador de Compras",
    email: "r.fuentes@empresa.com",
    phone: "Ext. 1105",
    area: "Compras",
  },
  {
    id: "adm-3",
    name: "Valeria Campos",
    role: "Analista de Servicios Generales",
    email: "v.campos@empresa.com",
    phone: "Ext. 1108",
    area: "Servicios Generales",
  },
  {
    id: "adm-4",
    name: "Jorge Espinoza",
    role: "Coordinador de Archivo y Documentación",
    email: "j.espinoza@empresa.com",
    phone: "Ext. 1110",
    area: "Documentación",
  },
  {
    id: "adm-5",
    name: "Daniela Reyes",
    role: "Asistente Administrativa",
    email: "d.reyes@empresa.com",
    phone: "Ext. 1112",
    area: "Dirección",
  },
  {
    id: "adm-6",
    name: "Esteban Vargas",
    role: "Analista de Viáticos y Gastos",
    email: "e.vargas@empresa.com",
    phone: "Ext. 1115",
    area: "Finanzas Admin.",
  },
];