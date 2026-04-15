/**
 * @module types/perfil
 * Tipos para la página de perfil del colaborador de la intranet EDM.
 *
 * @remarks
 * Extiende {@link DepartmentMember} con los campos adicionales del
 * perfil personal del colaborador autenticado, y define la estructura
 * para el historial de sesiones activas.
 */

import type { DepartmentMember } from "../types/DepartmentMember";

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Datos completos del perfil personal del colaborador autenticado.
 *
 * @remarks
 * Extiende {@link DepartmentMember} añadiendo los campos de contacto,
 * ubicación y preferencias personales que se muestran en la página de
 * perfil. Los campos opcionales pueden no estar configurados en Entra ID
 * o no haber sido proporcionados por el colaborador.
 *
 * Los campos `phone`, `location`, `joined` y `employeeId` se obtienen
 * desde Microsoft Graph y se propagan a través del JWT de NextAuth —
 * ver `types/next-auth.d.ts` para la declaración correspondiente.
 */
export interface ProfileData extends DepartmentMember {
  /**
   * Teléfono de contacto del colaborador.
   * `undefined` si no está configurado en Entra ID.
   */
  phone?: string;

  /** Nombre del departamento u área organizacional del colaborador. */
  department: string;

  /**
   * Ciudad o sede donde trabaja el colaborador
   * (ej. `"Bogotá"`, `"Medellín"`).
   * `undefined` si no está configurada en Entra ID.
   */
  location?: string;

  /**
   * Zona horaria del colaborador en formato IANA
   * (ej. `"America/Bogota"`).
   */
  timezone: string;

  /**
   * Idioma preferido del colaborador en formato BCP 47
   * (ej. `"es-CO"`, `"en-US"`).
   */
  language: string;

  /**
   * Fecha de ingreso del colaborador a la empresa, formateada mediante
   * `formatHireDate` (ej. `"marzo de 2024"`).
   * `undefined` si no está disponible en el perfil de Entra ID.
   */
  joined?: string;

  /**
   * Número de identificación del empleado en el sistema de RRHH.
   * `undefined` si no está configurado en Entra ID.
   */
  employeeId?: string;
}

/**
 * Entrada del historial de sesiones activas del colaborador.
 *
 * @remarks
 * Representa cada dispositivo o navegador desde el que el colaborador
 * tiene una sesión de NextAuth activa. Se usa en la página de perfil
 * para mostrar el panel de sesiones y permitir cerrar sesiones remotas.
 *
 * El campo `current` identifica la sesión desde la que el colaborador
 * está visualizando la página — esta sesión no puede cerrarse desde
 * el panel.
 */
export interface SessionEntry {
  /** Identificador único de la sesión. */
  id: string;

  /**
   * Nombre descriptivo del dispositivo o navegador
   * (ej. `"Chrome en Windows"`, `"Safari en iPhone"`).
   */
  device: string;

  /**
   * Ubicación aproximada desde donde se inició la sesión
   * (ej. `"Bogotá, Colombia"`).
   */
  location: string;

  /**
   * Fecha y hora de la última actividad de la sesión en formato
   * ISO 8601 o string legible (ej. `"Hace 2 horas"`).
   */
  lastSeen: string;

  /**
   * `true` si esta entrada corresponde a la sesión activa actual
   * desde la que el colaborador está visualizando la página.
   * La sesión actual no puede cerrarse remotamente.
   */
  current: boolean;

  /**
   * Tipo de dispositivo para mostrar el ícono correspondiente en la UI.
   *
   * | Valor     | Ícono mostrado    |
   * |-----------|-------------------|
   * | `desktop` | Monitor o laptop  |
   * | `mobile`  | Teléfono móvil    |
   */
  icon: "desktop" | "mobile";
}