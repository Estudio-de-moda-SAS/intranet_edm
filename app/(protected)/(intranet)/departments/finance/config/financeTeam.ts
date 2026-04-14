/**
 * @module financeTeam
 * Datos del equipo del departamento financiero.
 *
 * @remarks
 * Este archivo define una lista estática de miembros del equipo
 * financiero utilizada como fuente de datos temporal (mock).
 *
 * Su propósito es:
 *
 * - alimentar componentes de UI (cards, perfiles, listados)
 * - permitir desarrollo sin dependencia de backend
 * - servir como base para futuras integraciones con API
 *
 * ⚠️ En producción, este archivo debe ser reemplazado
 * por una fuente dinámica (API o base de datos).
 */

import type { DepartmentMember } from "@/types/DepartmentMember";

/* -------------------------------------------------------------------------- */
/* Nota de integración futura                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Ejemplo de integración con backend.
 *
 * @example
 * ```ts
 * const res = await fetch("/api/departments/finance/team");
 * const team = await res.json();
 * ```
 *
 * @remarks
 * Se recomienda migrar a un endpoint centralizado
 * para mantener sincronizados los datos del equipo.
 */

/* -------------------------------------------------------------------------- */
/* Datos mock                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Lista de miembros del equipo financiero.
 *
 * @remarks
 * Cada objeto representa un colaborador del área,
 * incluyendo información básica de perfil y contacto.
 *
 * Campos principales:
 *
 * - `id`: identificador único
 * - `name`: nombre completo del colaborador
 * - `role`: cargo dentro del departamento
 * - `image`: URL de imagen de perfil (puede ser null)
 * - `description`: breve resumen de responsabilidades
 * - `linkedin`: enlace al perfil profesional
 * - `email`: correo corporativo
 *
 * @example
 * ```ts
 * financeTeam.map(member => (
 *   <TeamCard key={member.id} member={member} />
 * ));
 * ```
 */
export const financeTeam: DepartmentMember[] = [
  {
    id: "1",
    name: "Carolina Jiménez",
    role: "Directora Financiera",
    image: null,
    description: "Lidera la estrategia financiera y el control presupuestario.",
    linkedin: "https://linkedin.com",
    email: "carolina@empresa.com",
  },
  {
    id: "2",
    name: "Sergio Mendoza",
    role: "Contador Senior",
    image: null,
    description: "Gestión contable, cierres mensuales y reportes fiscales.",
    linkedin: "https://linkedin.com",
    email: "sergio@empresa.com",
  },
  {
    id: "3",
    name: "Paola Ruiz",
    role: "Analista Financiera",
    image: null,
    description: "Análisis de presupuesto, proyecciones y métricas financieras.",
    linkedin: "https://linkedin.com",
    email: "paola@empresa.com",
  },
  {
    id: "4",
    name: "Hernán Castillo",
    role: "Coordinador de Tesorería",
    image: null,
    description: "Control de flujo de caja, pagos y cuentas por cobrar.",
    linkedin: "https://linkedin.com",
    email: "hernan@empresa.com",
  },
];