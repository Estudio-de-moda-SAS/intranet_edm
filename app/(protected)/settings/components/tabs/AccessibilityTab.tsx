/**
 * @module app/settings/tabs/AccessibilityTab
 * Pestaña de configuración de accesibilidad de la intranet EDM.
 *
 * @remarks
 * Permite al colaborador ajustar las opciones de accesibilidad visual
 * de la intranet desde la página de configuración personal. Todos los
 * cambios se aplican al DOM en tiempo real mediante
 * `useApplySettings` sin necesidad de guardar primero.
 *
 * **Secciones:**
 * 1. **Opciones de accesibilidad** — toggles para alto contraste,
 *    reducción de movimiento e indicadores de foco.
 * 2. **Tamaño base de fuente** — selector de 4 opciones con preview
 *    en vivo del texto a la escala seleccionada.
 */

"use client";

import {
  Accessibility, Type, Zap, Contrast, MousePointer,
} from "lucide-react";
import {
  SectionCard, SectionHeader, RowSetting, Toggle,
} from "@/app/components/ui/IntranetUI";
import type { AccessibilitySettings } from "@/config/settings";

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Props del componente {@link AccessibilityTab}.
 */
interface Props {
  /** Preferencias de accesibilidad actuales del colaborador. */
  settings: AccessibilitySettings;

  /**
   * Callback invocado cuando el colaborador cambia cualquier preferencia.
   * El padre actualiza el estado y `useApplySettings` aplica el cambio
   * al DOM inmediatamente.
   *
   * @param key   - Campo de `AccessibilitySettings` que cambió.
   * @param value - Nuevo valor del campo.
   */
  onChange: (
    key:   keyof AccessibilitySettings,
    value: AccessibilitySettings[keyof AccessibilitySettings],
  ) => void;
}

// ── Constantes ────────────────────────────────────────────────────────────────

/**
 * Configuración de los toggles de opciones de accesibilidad.
 *
 * @remarks
 * Excluye `fontSize` de las claves porque ese campo se gestiona con
 * un selector de botones independiente, no con un toggle.
 * El campo `liveHint` se muestra bajo el toggle cuando está activo
 * para informar al colaborador del efecto inmediato.
 */
const TOGGLE_ROWS: {
  /** Campo de `AccessibilitySettings` que controla este toggle. */
  key:         Exclude<keyof AccessibilitySettings, "fontSize">;
  /** Ícono de Lucide React para el toggle. */
  Icon:        React.ElementType;
  /** Etiqueta principal del toggle. */
  label:       string;
  /** Descripción del efecto de la opción. */
  description: string;
  /** Texto de confirmación mostrado cuando el toggle está activo. */
  liveHint:    string;
}[] = [
  {
    key:         "highContrast",
    Icon:        Contrast,
    label:       "Alto contraste",
    description: "Aumenta el contraste entre texto y fondo.",
    liveHint:    "Aplica filtro de contraste al instante",
  },
  {
    key:         "reduceMotion",
    Icon:        Zap,
    label:       "Reducir movimiento",
    description: "Minimiza animaciones y transiciones.",
    liveHint:    "Desactiva todas las animaciones CSS",
  },
  {
    key:         "focusIndicators",
    Icon:        MousePointer,
    label:       "Indicadores de foco visibles",
    description: "Muestra bordes claros al navegar con teclado.",
    liveHint:    "Pulsa Tab para ver el efecto",
  },
];

/**
 * Opciones del selector de tamaño base de fuente.
 *
 * @remarks
 * Cada opción incluye el valor del campo `fontSize`, la etiqueta
 * visible, la clase de Tailwind para el preview "Aa" en el botón
 * y el tamaño CSS exacto aplicado al documento.
 */
const FONT_SIZES: {
  /** Valor del campo `fontSize` en `AccessibilitySettings`. */
  value:   AccessibilitySettings["fontSize"];
  /** Etiqueta visible en el botón del selector. */
  label:   string;
  /** Clase de Tailwind para el texto de preview "Aa" en el botón. */
  preview: string;
  /** Tamaño CSS exacto aplicado al documento (ej. `"16px"`). */
  px:      string;
}[] = [
  { value: "sm", label: "Pequeño", preview: "text-[11px]", px: "14px" },
  { value: "md", label: "Normal",  preview: "text-[13px]", px: "16px" },
  { value: "lg", label: "Grande",  preview: "text-[15px]", px: "18px" },
  { value: "xl", label: "Extra",   preview: "text-[17px]", px: "20px" },
];

// ── Componente ────────────────────────────────────────────────────────────────

/**
 * Pestaña de accesibilidad de la página de configuración personal.
 *
 * @remarks
 * Componente controlado — no gestiona estado propio. Todos los cambios
 * se propagan al padre mediante `onChange` y se aplican al DOM
 * en tiempo real por `useApplySettings` en `ConfigShell`.
 *
 * El selector de tamaño de fuente incluye un preview en vivo que
 * muestra el texto de ejemplo a la escala exacta seleccionada,
 * incluyendo un subtítulo a escala proporcional (×0.75) para dar
 * contexto visual completo antes de guardar.
 *
 * @param props - Ver {@link Props}.
 *
 * @example
 * ```tsx
 * <AccessibilityTab
 *   settings={settings.accessibility}
 *   onChange={(key, value) => updateAccessibility(key, value)}
 * />
 * ```
 */
export function AccessibilityTab({ settings: s, onChange }: Props) {
  return (
    <div className="space-y-6">

      {/* ── Opciones de accesibilidad ─────────────────────────────── */}
      <SectionCard>
        <SectionHeader
          icon={Accessibility}
          title="Opciones de accesibilidad"
          subtitle="Todos los cambios se aplican al instante"
        />
        {TOGGLE_ROWS.map(({ key, Icon, label, description, liveHint }, i) => (
          <RowSetting
            key={key}
            label={label}
            description={description}
            border={i < TOGGLE_ROWS.length - 1}
          >
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 transition-colors ${
                  s[key] ? "text-[var(--accent-500)]" : "text-slate-300"
                }`} />
                <Toggle value={s[key] as boolean} onChange={(v) => onChange(key, v)} />
              </div>
              {s[key] && (
                <span className="text-[9px] text-[var(--accent-500)] font-medium animate-in fade-in duration-200">
                  ✓ {liveHint}
                </span>
              )}
            </div>
          </RowSetting>
        ))}
      </SectionCard>

      {/* ── Tamaño de fuente ──────────────────────────────────────── */}
      <SectionCard>
        <SectionHeader
          icon={Type}
          title="Tamaño base de fuente"
          subtitle="Afecta el tamaño de rem en toda la interfaz"
        />
        <div className="px-6 py-5">
          <div className="grid grid-cols-4 gap-2">
            {FONT_SIZES.map(({ value, label, preview, px }) => {
              const active = s.fontSize === value;
              return (
                <button
                  key={value}
                  onClick={() => onChange("fontSize", value)}
                  aria-pressed={active}
                  className={`rounded-xl border py-3 transition-all ${
                    active
                      ? "border-[var(--accent-200)] bg-[var(--accent-50)] text-[var(--accent-700)]"
                      : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className={`block font-semibold mb-0.5 ${preview}`}>Aa</span>
                  <span className="text-[10px] block">{label}</span>
                  <span className="text-[9px] text-slate-400 block">{px}</span>
                </button>
              );
            })}
          </div>

          {/* Preview en vivo de la fuente seleccionada */}
          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Vista previa
            </p>
            <p
              className="text-slate-700 font-medium leading-relaxed transition-all"
              style={{ fontSize: FONT_SIZES.find((f) => f.value === s.fontSize)?.px }}
            >
              Bienvenido a la intranet de EDM
            </p>
            <p
              className="text-slate-400 mt-0.5"
              style={{
                fontSize: `calc(${FONT_SIZES.find((f) => f.value === s.fontSize)?.px} * 0.75)`,
              }}
            >
              Subtítulo de ejemplo en escala proporcional
            </p>
          </div>
        </div>
      </SectionCard>

    </div>
  );
}