/**
 * @module companyLeaders
 * Configuración del equipo directivo de la compañía.
 *
 * @remarks
 * Este módulo define los líderes principales de la organización,
 * utilizados en la sección "Conoce la Empresa".
 *
 * Está preparado para integrarse con Microsoft Graph API,
 * permitiendo obtener dinámicamente la foto del usuario
 * a partir de su correo corporativo.
 *
 * ⚠️ Nota:
 * Actualmente algunos registros son placeholders y deben ser
 * reemplazados con información real del equipo directivo.
 */

/* -------------------------------------------------------------------------- */
/* Tipos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Representa un líder dentro de la organización.
 *
 * @remarks
 * Incluye información básica organizacional y soporte opcional
 * para integración con Microsoft Graph:
 *
 * - `name`: nombre completo del líder
 * - `role`: cargo dentro de la empresa
 * - `area`: área o dominio organizacional
 * - `initials`: fallback visual cuando no hay foto
 * - `email`: identificador para obtener foto desde Graph API
 *
 * @example
 * ```ts
 * {
 *   name: "Juan Pérez",
 *   role: "CEO",
 *   area: "Dirección General",
 *   email: "juan.perez@empresa.com"
 * }
 * ```
 */
export type Leader = {
  name: string;
  role: string;
  area: string;
  initials?: string;

  /**
   * Correo corporativo.
   *
   * @remarks
   * Utilizado para obtener la foto del usuario desde:
   *
   * `/v1.0/users/{email}/photo/$value`
   *
   * Si no está presente, la UI debe usar `initials` como fallback.
   */
  email?: string;
};

/* -------------------------------------------------------------------------- */
/* Datos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Lista del equipo directivo de la compañía.
 *
 * @remarks
 * - Ordenado por jerarquía lógica (fundadores → direcciones)
 * - Algunos registros son placeholders temporales
 * - Preparado para enriquecerse con datos reales (foto, nombre completo)
 *
 * En el futuro, este listado podría provenir de:
 *
 * - Microsoft Graph API (`/v1.0/users`)
 * - un servicio interno de RRHH
 * - un CMS corporativo
 */
export const companyLeaders: readonly Leader[] = [
  {
    name: "Maria Perez",
    role: "Co-Fundadora",
    area: "Dirección Estratégica",
    initials: "MP",
    email: "maria.perez@estudiodemoda.com.co",
  },
  {
    name: "Alberto Gomez",
    role: "Co-Fundador",
    area: "Dirección Estratégica",
    initials: "AG",
    email: "alberto.gomez@estudiodemoda.com.co",
  },
  {
    name: "Dir. Comercial",
    role: "Director(a) Comercial",
    area: "Retail & Wholesale",
    initials: "DC",
    email: "dircomercial@estudiodemoda.com.co",
  },
  {
    name: "Dir. Talento Humano",
    role: "Director(a) de Talento",
    area: "Cultura & Personas",
    initials: "TH",
    email: "dirtalentohumano@estudiodemoda.com.co",
  },
  {
    name: "Dir. Operaciones",
    role: "Director(a) de Operaciones",
    area: "Logística & Supply Chain",
    initials: "DO",
    email: "diroperaciones@estudiodemoda.com.co",
  },
  {
    name: "Dir. Marketing",
    role: "Director(a) de Marketing",
    area: "Marca & Comunicaciones",
    initials: "MK",
    email: "dirmarketing@estudiodemoda.com.co",
  },
  {
    name: "Dir. Tecnología",
    role: "Director(a) de Tecnología",
    area: "Transformación Digital",
    initials: "TI",
    email: "dirtecnologia@estudiodemoda.com.co",
  },
];