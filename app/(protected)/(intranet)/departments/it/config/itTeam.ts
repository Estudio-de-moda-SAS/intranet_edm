/**
 * @module itTeam
 * Configuración del equipo del área de Tecnología (TI).
 *
 * @remarks
 * Este archivo define una colección estática de miembros del departamento de TI,
 * utilizada para renderizar secciones como:
 * - Directorio del equipo
 * - Tarjetas de colaboradores
 * - Secciones informativas del área
 *
 * Actualmente funciona como mock de datos, pero está preparado para ser reemplazado
 * por una integración con API real.
 */

// app/it/config/itTeam.ts

import type { DepartmentMember } from "@/types/DepartmentMember";

/**
 * Lista de integrantes del equipo de TI.
 *
 * @remarks
 * Cada elemento representa un colaborador del área tecnológica, incluyendo:
 * - Información básica (nombre, rol)
 * - Descripción profesional
 * - Canales de contacto (email, LinkedIn)
 *
 * ⚠️ Nota:
 * Este dataset es estático y debe ser reemplazado en producción por un fetch:
 *
 * @example
 * ```ts
 * const res = await fetch("/api/departments/it/team");
 * const team = await res.json();
 * ```
 *
 * Posibles fuentes reales:
 * - Microsoft Graph API
 * - Backend interno
 * - CMS corporativo
 */
export const itTeam: DepartmentMember[] = [
  {
    id: "1",
    name: "Andrés Mejía",
    role: "Director de TI",
    image: null,
    description:
      "Lidera la estrategia tecnológica, gobernanza de TI y transformación digital de la organización.",
    linkedin: "https://linkedin.com",
    email: "andres@empresa.com",
  },
  {
    id: "2",
    name: "Luisa Fernanda Cano",
    role: "Ingeniera de Sistemas",
    image: null,
    description:
      "Desarrollo, integración y mantenimiento de sistemas internos y APIs corporativas.",
    linkedin: "https://linkedin.com",
    email: "luisa@empresa.com",
  },
  {
    id: "3",
    name: "Camilo Ospina",
    role: "Especialista en Ciberseguridad",
    image: null,
    description:
      "Gestión de amenazas, monitoreo SIEM, aplicación de parches y cumplimiento ISO 27001.",
    linkedin: "https://linkedin.com",
    email: "camilo@empresa.com",
  },
  {
    id: "4",
    name: "Tatiana Reyes",
    role: "Técnica de Soporte",
    image: null,
    description:
      "Atención de tickets, soporte a usuarios, gestión de equipos y onboarding tecnológico.",
    linkedin: "https://linkedin.com",
    email: "tatiana@empresa.com",
  },
];