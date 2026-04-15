/**
 * @module team-member
 * Tipo base para los miembros del equipo mostrados en directorios, cards y
 * secciones de líderes de la intranet EDM.
 *
 * @packageDocumentation
 */

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Representa un colaborador de EDM con los datos necesarios para renderizar
 * su tarjeta en el directorio y secciones de equipo.
 */
export interface TeamMember {
  /** Identificador único del colaborador en el sistema. */
  id:          string;
  /** Nombre completo del colaborador. */
  name:        string;
  /** Cargo o título dentro de la organización (ej. `"Diseñadora Senior"`). */
  role:        string;
  /** Departamento al que pertenece (ej. `"Producto"`, `"Finanzas"`). */
  department:  string;
  /** URL de la foto de perfil del colaborador. */
  image:       string;
  /** Correo corporativo (opcional). */
  email?:      string;
  /** URL del perfil de LinkedIn (opcional). */
  linkedin?:   string;
  /** Pequeña frase o lema personal (opcional). */
  bio?:        string;
}