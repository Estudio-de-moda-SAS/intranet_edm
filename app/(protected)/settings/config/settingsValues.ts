/**
 * @module lib/mock/configuracion
 * Valores por defecto y datos mock para el módulo de configuración
 * personal de la intranet EDM.
 *
 * @remarks
 * Provee los valores iniciales de las preferencias del colaborador
 * cuando no hay configuración guardada en `localStorage`, y el
 * catálogo de integraciones disponibles para la pestaña de
 * integraciones.
 *
 * **En producción**, reemplazar las constantes de este módulo con
 * llamadas a la API o base de datos correspondiente:
 * - `DEFAULT_*` → endpoint de perfil del colaborador en el sistema HRIS
 * - `INTEGRATIONS` → endpoint de integraciones disponibles en la organización
 *
 * Los valores por defecto están diseñados para ser seguros y no
 * intrusivos — notificaciones esenciales activas, sin alto contraste,
 * sin reducción de movimiento, tema claro.
 */

import type {
  NotificationSettings,
  AppearanceSettings,
  AccessibilitySettings,
  Integration,
} from "@/config/settings";

// ── Valores por defecto ───────────────────────────────────────────────────────

/**
 * Preferencias de notificaciones por defecto para colaboradores nuevos
 * o sin configuración guardada.
 *
 * @remarks
 * Activa las notificaciones más relevantes para el día a día
 * (`emailAlerts`, `pushBrowser`, `taskAssigned`, `taskDue`,
 * `mentions`, `announcements`, `weeklyReport`) y desactiva las
 * más intrusivas (`pushMobile`, `soundDesktop`, `systemAlerts`,
 * `emailDigest`) para reducir la carga cognitiva inicial.
 */
export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  emailAlerts:   true,
  emailDigest:   false,
  pushBrowser:   true,
  pushMobile:    false,
  soundDesktop:  true,
  taskAssigned:  true,
  taskDue:       true,
  mentions:      true,
  announcements: true,
  systemAlerts:  false,
  weeklyReport:  true,
};

/**
 * Preferencias de apariencia por defecto para colaboradores nuevos
 * o sin configuración guardada.
 *
 * @remarks
 * Usa el tema claro, el violeta corporativo de EDM como acento
 * (`accentHue: 258`), densidad normal y animaciones activas.
 * El sidebar no está colapsado por defecto para facilitar la
 * navegación a nuevos colaboradores.
 */
export const DEFAULT_APPEARANCE: AppearanceSettings = {
  theme:            "light",
  accentHue:        258,
  density:          "default",
  sidebarCollapsed: false,
  animations:       true,
};

/**
 * Preferencias de accesibilidad por defecto para colaboradores nuevos
 * o sin configuración guardada.
 *
 * @remarks
 * Solo `focusIndicators` está activo por defecto para mejorar la
 * navegación por teclado sin afectar la experiencia visual estándar.
 * El resto de opciones de accesibilidad están desactivadas para no
 * alterar la apariencia base de la intranet sin que el colaborador
 * lo haya solicitado explícitamente.
 */
export const DEFAULT_ACCESSIBILITY: AccessibilitySettings = {
  highContrast:    false,
  largeText:       false,
  reduceMotion:    false,
  focusIndicators: true,
  screenReader:    false,
  fontSize:        "md",
};

// ── Catálogo de integraciones ─────────────────────────────────────────────────

/**
 * Catálogo de integraciones con servicios externos disponibles en
 * la intranet EDM.
 *
 * @remarks
 * El campo `connected` refleja el estado inicial de conexión para
 * los datos mock. En producción, este valor debe venir del perfil
 * del colaborador en la base de datos — diferentes colaboradores
 * pueden tener distintas integraciones conectadas.
 *
 * El campo `icon` usa emojis como fallback hasta que se implementen
 * los logos SVG de cada servicio. El campo `color` define las clases
 * de Tailwind para el contenedor del ícono en la tarjeta.
 *
 * **Integraciones disponibles:**
 * | Servicio           | Estado mock  | Descripción                               |
 * |--------------------|--------------|-------------------------------------------|
 * | Slack              | Conectado    | Alertas a canales corporativos            |
 * | Microsoft Teams    | Desconectado | Notificaciones y accesos desde Teams      |
 * | Google Workspace   | Conectado    | Sincronización de calendarios y docs      |
 * | Jira               | Desconectado | Gestión de tareas y tickets               |
 * | GitHub             | Desconectado | Pull requests y deploy logs               |
 * | Power BI           | Conectado    | Reportes embebidos en la intranet         |
 */
export const INTEGRATIONS: Integration[] = [
  {
    id:        "slack",
    name:      "Slack",
    desc:      "Envía alertas a canales de Slack corporativo.",
    connected: true,
    icon:      "💬",
    color:     "bg-[#4A154B]/10 text-[#4A154B]",
  },
  {
    id:        "teams",
    name:      "Microsoft Teams",
    desc:      "Notificaciones y accesos directos desde Teams.",
    connected: false,
    icon:      "🟦",
    color:     "bg-blue-50 text-blue-700",
  },
  {
    id:        "gsuite",
    name:      "Google Workspace",
    desc:      "Sincroniza calendarios y documentos.",
    connected: true,
    icon:      "📁",
    color:     "bg-amber-50 text-amber-700",
  },
  {
    id:        "jira",
    name:      "Jira",
    desc:      "Gestión de tareas y tickets desde la intranet.",
    connected: false,
    icon:      "🔵",
    color:     "bg-blue-50 text-blue-800",
  },
  {
    id:        "github",
    name:      "GitHub",
    desc:      "Pull requests y deploy logs en tu dashboard.",
    connected: false,
    icon:      "⬛",
    color:     "bg-slate-100 text-slate-800",
  },
  {
    id:        "powerbi",
    name:      "Power BI",
    desc:      "Embebe reportes directamente en la intranet.",
    connected: true,
    icon:      "📊",
    color:     "bg-yellow-50 text-yellow-700",
  },
];