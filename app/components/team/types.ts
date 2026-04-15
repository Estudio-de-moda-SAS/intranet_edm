/**
 * @module TeamMember
 * Definición del modelo de datos para representar a un integrante del equipo.
 */

/**
 * Representa la información básica y opcional de un miembro del equipo.
 *
 * @remarks
 * Esta interfaz es utilizada principalmente por componentes de UI como
 * tarjetas de perfil, listados de equipo o directorios internos.
 */
export interface TeamMember {
  /**
   * Identificador único del miembro.
   */
  id: string;

  /**
   * Nombre completo del integrante.
   */
  name: string;

  /**
   * Cargo o rol dentro de la organización.
   */
  role: string;

  /**
   * Departamento o área a la que pertenece.
   */
  department: string;

  /**
   * URL de la imagen de perfil.
   *
   * @remarks
   * Debe ser una ruta válida o absoluta. Se usa para renderizar el avatar.
   */
  image: string;

  /**
   * Correo electrónico de contacto (opcional).
   */
  email?: string;

  /**
   * URL del perfil de LinkedIn (opcional).
   */
  linkedin?: string;

  /**
   * Breve descripción personal, lema o bio (opcional).
   */
  bio?: string;
}