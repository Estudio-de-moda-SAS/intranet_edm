/**
 * @module hrTeam
 * Dataset de ejemplo para el equipo del departamento de Recursos Humanos.
 *
 * @remarks
 * Este archivo define un conjunto estático de miembros del equipo de RRHH,
 * utilizado principalmente para:
 * - Desarrollo local
 * - Mock de datos en UI
 * - Pruebas de componentes
 *
 * En un entorno productivo, esta información debería ser obtenida desde una API.
 *
 * @example
 * ```ts
 * const res = await fetch("/api/departments/hr/team");
 * const team = await res.json();
 * ```
 */

import type { DepartmentMember } from "@/types/DepartmentMember";

/**
 * Lista de miembros del equipo de Recursos Humanos.
 *
 * @remarks
 * Cada elemento representa un integrante del departamento con información básica:
 * - Identificación
 * - Nombre y rol
 * - Descripción profesional
 * - Información de contacto
 *
 * La propiedad `image` puede ser `null`, en cuyo caso la UI debe manejar
 * un fallback visual (ej: iniciales o avatar por defecto).
 */
export const hrTeam: DepartmentMember[] = [
  {
    id: "1",
    name: "Natalia Gómez",
    role: "Directora de RRHH",
    image: null,
    description: "Lidera la estrategia de talento y cultura organizacional.",
    linkedin: "https://linkedin.com",
    email: "natalia@empresa.com",
  },
  {
    id: "2",
    name: "Felipe Arango",
    role: "Coordinador de Nómina",
    image: null,
    description: "Gestión de nómina, beneficios y cumplimiento laboral.",
    linkedin: "https://linkedin.com",
    email: "felipe@empresa.com",
  },
  {
    id: "3",
    name: "Isabela Mora",
    role: "Analista de Reclutamiento",
    image: null,
    description:
      "Selección de talento y gestión del proceso de onboarding.",
    linkedin: "https://linkedin.com",
    email: "isabela@empresa.com",
  },
  {
    id: "4",
    name: "Ricardo Pinto",
    role: "Especialista en Bienestar",
    image: null,
    description:
      "Programas de bienestar, capacitación y clima organizacional.",
    linkedin: "https://linkedin.com",
    email: "ricardo@empresa.com",
  },
];