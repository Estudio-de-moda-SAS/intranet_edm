/**
 * @module config/dark
 * Variables semánticas del sistema de temas de la intranet EDM.
 *
 * @remarks
 * Documenta como constantes tipadas los tokens de diseño definidos
 * en `config/dark.css`. Sirve como referencia única para conocer
 * los nombres y valores de las variables CSS del sistema de temas
 * sin tener que abrir el CSS.
 *
 * **No importar en componentes de UI** — los valores reales en tiempo
 * de ejecución vienen de las variables CSS aplicadas por
 * `SettingsInitializer`. Este módulo es exclusivamente documentación
 * y referencia de tipos.
 *
 * @see `config/dark.css` — definición real de las variables CSS
* @see `SettingsInitializer` (`components/SettingsInitializer`) — aplica las variables al DOM
 * @see `useApplySettings` (`hooks/useApplySettings`) — actualiza las variables en tiempo real */

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Modo de tema de la intranet.
 *
 * | Valor    | Descripción                                        |
 * |----------|----------------------------------------------------|
 * | `light`  | Tema claro forzado independientemente del sistema  |
 * | `dark`   | Tema oscuro forzado independientemente del sistema |
 * | `system` | Sigue la preferencia `prefers-color-scheme` del SO |
 */
export type ThemeMode = "light" | "dark" | "system";

/**
 * Nivel de densidad visual de la UI.
 *
 * | Valor      | Descripción                   |
 * |------------|-------------------------------|
 * | `compact`  | Padding y espaciado reducidos |
 * | `default`  | Espaciado estándar            |
 * | `spacious` | Padding y espaciado ampliados |
 */
export type DensityMode = "compact" | "default" | "spacious";

/**
 * Tamaño de fuente base de la intranet.
 *
 * | Valor | Tamaño CSS | Uso                         |
 * |-------|------------|-----------------------------|
 * | `sm`  | `14px`     | Pantallas pequeñas o densas |
 * | `md`  | `16px`     | Tamaño por defecto          |
 * | `lg`  | `18px`     | Mayor legibilidad           |
 * | `xl`  | `20px`     | Accesibilidad o 4K          |
 */
export type FontSizeMode = "sm" | "md" | "lg" | "xl";

/**
 * Nombres de las variables CSS semánticas definidas en `dark.css`.
 * Úsalas como referencia al crear nuevos componentes.
 */
export type CSSVariable =
  | "--bg-base"
  | "--bg-card"
  | "--bg-subtle"
  | "--bg-muted"
  | "--border"
  | "--border-subtle"
  | "--text-primary"
  | "--text-secondary"
  | "--text-body"
  | "--text-muted"
  | "--text-faint"
  | "--shadow-card"
  | "--header-bg"
  | "--header-border"
  | "--nav-bg"
  | "--accent-h"
  | "--accent-500"
  | "--accent-600"
  | "--accent-700"
  | "--accent-50"
  | "--accent-100"
  | "--accent-200"
  | "--accent-foreground";

// ── Tokens ────────────────────────────────────────────────────────────────────

/**
 * Valores de las variables CSS en tema claro (`:root`).
 */
export const LIGHT_TOKENS: Record<CSSVariable, string> = {
  "--bg-base":           "#f4f6f9",
  "--bg-card":           "#ffffff",
  "--bg-subtle":         "#f8fafc",
  "--bg-muted":          "#f1f5f9",
  "--border":            "#e2e8f0",
  "--border-subtle":     "#f1f5f9",
  "--text-primary":      "#0f172a",
  "--text-secondary":    "#1e293b",
  "--text-body":         "#334155",
  "--text-muted":        "#64748b",
  "--text-faint":        "#94a3b8",
  "--shadow-card":       "0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)",
  "--header-bg":         "rgba(255, 255, 255, 0.97)",
  "--header-border":     "#e2e8f0",
  "--nav-bg":            "#f8fafc",
  "--accent-h":          "258",
  "--accent-500":        "hsl(258, 70%, 55%)",
  "--accent-600":        "hsl(258, 68%, 48%)",
  "--accent-700":        "hsl(258, 65%, 40%)",
  "--accent-50":         "hsl(258, 80%, 97%)",
  "--accent-100":        "hsl(258, 75%, 93%)",
  "--accent-200":        "hsl(258, 70%, 86%)",
  "--accent-foreground": "#ffffff",
};

/**
 * Valores de las variables CSS en tema oscuro (`html.dark`).
 *
 * @remarks
 * Paleta basada en los tonos de GitHub Dark para maximizar la
 * legibilidad y reducir la fatiga visual en sesiones prolongadas.
 */
export const DARK_TOKENS: Record<CSSVariable, string> = {
  "--bg-base":           "#0d1117",
  "--bg-card":           "#161b22",
  "--bg-subtle":         "#1c2128",
  "--bg-muted":          "#21262d",
  "--border":            "#30363d",
  "--border-subtle":     "#21262d",
  "--text-primary":      "#e6edf3",
  "--text-secondary":    "#cdd9e5",
  "--text-body":         "#adbac7",
  "--text-muted":        "#768390",
  "--text-faint":        "#545d68",
  "--shadow-card":       "0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)",
  "--header-bg":         "rgba(22, 27, 34, 0.97)",
  "--header-border":     "#30363d",
  "--nav-bg":            "#161b22",
  "--accent-h":          "258",
  "--accent-500":        "hsl(258, 65%, 62%)",
  "--accent-600":        "hsl(258, 60%, 55%)",
  "--accent-700":        "hsl(258, 55%, 48%)",
  "--accent-50":         "hsl(258, 40%, 14%)",
  "--accent-100":        "hsl(258, 35%, 18%)",
  "--accent-200":        "hsl(258, 40%, 25%)",
  "--accent-foreground": "#ffffff",
};

/**
 * Matiz HSH por defecto del color de acento corporativo de EDM (violeta).
 */
export const DEFAULT_ACCENT_HUE = 258;

/**
 * Rango válido de matices HSH para el selector de color de acento.
 */
export const ACCENT_HUE_RANGE = { min: 0, max: 360 } as const;