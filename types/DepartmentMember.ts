/**
 * @module types/department
 * Tipos para la representación de miembros de departamento en la
 * intranet EDM.
 *
 * @remarks
 * Define la estructura de los colaboradores que aparecen en las
 * secciones de equipo y liderazgo de cada página de departamento.
 */

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Miembro de un departamento mostrado en la sección de equipo o
 * liderazgo de la página del departamento.
 *
 * @remarks
 * Los campos `image`, `description`, `linkedin` y `email` son opcionales
 * porque no todos los colaboradores tienen foto de perfil configurada en
 * Entra ID ni perfil público completo. El componente consumidor debe
 * manejar los fallbacks correspondientes — iniciales para la foto,
 * y ocultar los links si no están disponibles.
 */
export type DepartmentMember = {
  /** Identificador único del miembro, equivalente al Object ID de Azure AD. */
  id: string;

  /** Nombre display del colaborador. */
  name: string;

  /** Cargo o título del colaborador en el departamento. */
  role: string;

  /**
   * URL de la foto de perfil del colaborador.
   * `null` o `undefined` si no tiene foto configurada en Entra ID —
   * el componente de avatar debe mostrar las iniciales como fallback.
   */
  image?: string | null;

  /**
   * Descripción breve del colaborador o su área de responsabilidad.
   * `undefined` si no está disponible.
   */
  description?: string;

  /**
   * URL del perfil de LinkedIn del colaborador.
   * `undefined` si el colaborador no ha configurado su perfil.
   */
  linkedin?: string;

  /**
   * Correo corporativo del colaborador.
   * `undefined` si no está disponible o no debe mostrarse públicamente.
   */
  email?: string;
};