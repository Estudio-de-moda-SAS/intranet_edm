/**
 * @module types/configuracion
 * Tipos para el módulo de configuración personal de la intranet EDM.
 *
 * @remarks
 * Define las interfaces de todas las preferencias configurables por
 * el colaborador desde `/configuracion`. Los valores de estas interfaces
 * se persisten en `localStorage` bajo la clave `"edm_intranet_settings"`
 * y se aplican al DOM mediante:
 *
* - `SettingsInitializer` (`components/SettingsInitializer`) — en cada carga de página
 * - `useApplySettings` (`hooks/useApplySettings`) — en tiempo real al cambiar valores *
 * **Estructura en `localStorage`:**
 * ```json
 * {
 *   "notifications":  { ...NotificationSettings  },
 *   "appearance":     { ...AppearanceSettings     },
 *   "accessibility":  { ...AccessibilitySettings  },
 *   "integrations":   { ...Integration[]          }
 * }
 * ```
 *
 * **Relación con `config/settings.css` y `config/dark.css`:**
 * Los valores de {@link AppearanceSettings} y {@link AccessibilitySettings}
 * se traducen a atributos, clases CSS y variables inline en `<html>`:
 *
 * | Campo                        | Efecto en el DOM                              |
 * |------------------------------|-----------------------------------------------|
 * | `theme: "dark"`              | `class="dark"` en `<html>`                    |
 * | `theme: "system"`            | `dark` según `prefers-color-scheme`           |
 * | `accentHue`                  | Variables `--accent-*` inline en `<html>`     |
 * | `density: "compact"`         | `data-density="compact"` en `<html>`          |
 * | `animations: false`          | `class="reduce-motion"` en `<html>`           |
 * | `highContrast: true`         | `class="high-contrast"` en `<html>`           |
 * | `reduceMotion: true`         | `class="reduce-motion"` en `<html>`           |
 * | `focusIndicators: true`      | `class="focus-indicators"` en `<html>`        |
 * | `fontSize: "lg"`             | `data-fontsize="lg"` + `font-size: 18px`      |
 *
 * @see `config/settings.css` — reglas CSS activadas por estos valores
 * @see `config/dark.css` — variables semánticas del sistema de temas
 */

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Pestañas disponibles en la página de configuración personal.
 *
 * | Valor            | Sección                                      |
 * |------------------|----------------------------------------------|
 * | `notifications`  | Preferencias de notificaciones               |
 * | `appearance`     | Tema, color de acento, densidad y animaciones|
 * | `accessibility`  | Contraste, movimiento, foco y fuente         |
 * | `integrations`   | Conexiones con servicios externos            |
 */
export type ConfigTab =
  | "notifications"
  | "appearance"
  | "accessibility"
  | "integrations";

/**
 * Preferencias de notificaciones del colaborador.
 *
 * @remarks
 * Controla qué canales y tipos de notificación recibe el colaborador.
 * Los canales (`email*`, `push*`, `sound*`) son independientes de los
 * tipos de evento (`taskAssigned`, `mentions`, etc.) — un evento solo
 * notifica si el canal correspondiente está habilitado.
 */
export interface NotificationSettings {
  /** Recibir alertas puntuales por correo electrónico. */
  emailAlerts: boolean;

  /** Recibir resumen semanal de actividad por correo. */
  emailDigest: boolean;

  /** Recibir notificaciones push en el navegador. */
  pushBrowser: boolean;

  /** Recibir notificaciones push en el dispositivo móvil. */
  pushMobile: boolean;

  /** Reproducir sonido al recibir notificaciones en escritorio. */
  soundDesktop: boolean;

  /** Notificar cuando se asigna una tarea al colaborador. */
  taskAssigned: boolean;

  /** Notificar cuando una tarea está próxima a vencer. */
  taskDue: boolean;

  /** Notificar cuando alguien menciona al colaborador. */
  mentions: boolean;

  /** Notificar nuevos anuncios corporativos publicados. */
  announcements: boolean;

  /** Notificar alertas del sistema (mantenimientos, incidencias). */
  systemAlerts: boolean;

  /** Recibir reporte semanal de actividad y productividad. */
  weeklyReport: boolean;
}

/**
 * Preferencias de apariencia visual de la intranet.
 *
 * @remarks
* Todos los cambios en esta interfaz se aplican al DOM en tiempo real
 * por `useApplySettings` (`hooks/useApplySettings`) y se persisten en
 * `localStorage` para restaurarse en la siguiente sesión mediante
 * `SettingsInitializer` (`components/SettingsInitializer`). */
export interface AppearanceSettings {
  /**
   * Modo de tema de la interfaz.
   *
   * | Valor    | Comportamiento                                   |
   * |----------|--------------------------------------------------|
   * | `light`  | Tema claro forzado                               |
   * | `dark`   | Tema oscuro forzado                              |
   * | `system` | Sigue `prefers-color-scheme` del sistema operativo|
   */
  theme: "light" | "dark" | "system";

  /**
   * Matiz HSH del color de acento (0–360).
   * Valor por defecto: `258` (violeta corporativo de EDM).
   * Cuando es `258`, se usan las variables de `settings.css` en lugar
   * de variables inline para evitar duplicación.
   */
  accentHue: number;

  /**
   * Densidad visual de la interfaz.
   * Controla el padding y espaciado de los componentes mediante
   * el atributo `data-density` en `<html>` y las reglas de
   * `settings.css`.
   */
  density: "compact" | "default" | "spacious";

  /**
   * Si es `true`, el sidebar de navegación lateral está colapsado
   * mostrando solo íconos sin etiquetas.
   */
  sidebarCollapsed: boolean;

  /**
   * Si es `false`, desactiva todas las animaciones y transiciones
   * de Framer Motion y CSS en toda la intranet añadiendo la clase
   * `reduce-motion` a `<html>`.
   */
  animations: boolean;
}

/**
 * Preferencias de accesibilidad del colaborador.
 *
 * @remarks
 * Cada preferencia se traduce a una clase CSS en `<html>` o a un
 * atributo `data-*` que activa las reglas correspondientes en
 * `settings.css` y `dark.css`. Los cambios se aplican globalmente
 * a toda la intranet sin recargar la página.
 */
export interface AccessibilitySettings {
  /**
   * Si es `true`, aumenta el contraste global de la interfaz
   * mediante `filter: contrast(1.3)` en `<html>`.
   */
  highContrast: boolean;

  /**
   * Si es `true`, fuerza `font-size: 18px` en todo el documento
   * mediante la clase `large-text` en `<html>`.
   * @deprecated Usar `fontSize: "lg"` en su lugar para mayor control.
   */
  largeText: boolean;

  /**
   * Si es `true`, desactiva todas las animaciones y transiciones CSS
   * estableciendo duraciones de `0.01ms` mediante la clase
   * `reduce-motion` en `<html>`.
   */
  reduceMotion: boolean;

  /**
   * Si es `true`, muestra un outline visible en todos los elementos
   * interactivos al recibir foco mediante la clase `focus-indicators`
   * en `<html>`.
   */
  focusIndicators: boolean;

  /**
   * Si es `true`, optimiza la interfaz para lectores de pantalla
   * (ARIA labels, roles semánticos, skip links).
   * @remarks Actualmente reservado para implementación futura.
   */
  screenReader: boolean;

  /**
   * Tamaño de fuente base de la interfaz.
   * Valor `"md"` (16px) es el default y no aplica atributo en `<html>`.
   *
   * | Valor | CSS    |
   * |-------|--------|
   * | `sm`  | `14px` |
   * | `md`  | `16px` |
   * | `lg`  | `18px` |
   * | `xl`  | `20px` |
   */
  fontSize: "sm" | "md" | "lg" | "xl";
}

/**
 * Integración con un servicio externo configurable desde la intranet.
 *
 * @remarks
 * Las integraciones permiten al colaborador conectar herramientas
 * externas (ej. Slack, Google Calendar, Jira) para recibir
 * notificaciones o sincronizar datos directamente en la intranet.
 */
export interface Integration {
  /** Identificador único de la integración (ej. `"slack"`, `"gcal"`). */
  id: string;

  /** Nombre display de la integración (ej. `"Slack"`, `"Google Calendar"`). */
  name: string;

  /** Descripción corta de la funcionalidad de la integración. */
  desc: string;

  /** `true` si el colaborador tiene la integración actualmente conectada. */
  connected: boolean;

  /** Nombre del ícono o URL del logo del servicio externo. */
  icon: string;

  /** Color representativo del servicio para el badge en la UI. */
  color: string;
}