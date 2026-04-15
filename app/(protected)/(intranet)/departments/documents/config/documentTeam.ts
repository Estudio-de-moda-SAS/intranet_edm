/**
 * @module documentTeam
 * Configuración del equipo asociado al módulo de Gestión Documental.
 *
 * Define los miembros responsables de distintas áreas que participan en
 * la administración, revisión y control de documentos corporativos.
 *
 * @remarks
 * Este archivo se utiliza principalmente en componentes de UI como:
 * - secciones de equipo (`DepartmentTeamSection`),
 * - vistas informativas del módulo documental,
 * - y posibles flujos de contacto o responsables por área.
 */

/**
 * Representa un miembro del equipo documental.
 *
 * @interface DocumentTeamMember
 * @property id Identificador único del miembro.
 * @property name Nombre completo del colaborador.
 * @property role Rol o área dentro del proceso documental.
 */
export type DocumentTeamMember = {
  id: string;
  name: string;
  role: string;
};

/**
 * Lista de miembros del equipo de Gestión Documental.
 *
 * @remarks
 * Cada elemento representa un responsable dentro de un área clave del
 * ciclo de vida documental:
 * - Gestión documental (control y archivo),
 * - Legal (cumplimiento y normativas),
 * - Recursos Humanos (documentación de personal),
 * - Finanzas (documentos contables y financieros).
 */
export const documentTeam: DocumentTeamMember[] = [
  {
    id: "doc-1",
    name: "Laura Méndez",
    role: "Gestión documental",
  },
  {
    id: "doc-2",
    name: "Andrés Vargas",
    role: "Legal",
  },
  {
    id: "doc-3",
    name: "Natalia Gómez",
    role: "Recursos Humanos",
  },
  {
    id: "doc-4",
    name: "Carlos Torres",
    role: "Finanzas",
  },
];