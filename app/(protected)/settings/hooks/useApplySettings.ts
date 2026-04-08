/**
 * @module hooks/useApplySettings
 * Hook para aplicar preferencias de apariencia y accesibilidad al DOM
 * en tiempo real desde la página de configuración de la intranet EDM.
 *
 * @remarks
 * A diferencia de {@link module:components/SettingsInitializer} que lee
 * desde `localStorage`, este hook recibe los valores directamente desde
 * el estado de React y los aplica al DOM inmediatamente cuando cambian,
 * sin necesidad de guardar primero ni recargar la página.
 *
 * Se usa exclusivamente en la página de configuración
 * (`/configuracion`) para proporcionar preview en tiempo real de los
 * cambios antes de que el colaborador los guarde.
 *
 * **Separación de responsabilidades:**
 * - {@link useApplySettings} → aplica desde estado React (tiempo real)
 * - {@link applyFromStorage} → aplica desde `localStorage` (inicialización)
 *
 * @example
 * ```tsx
 * // En la página de configuración:
 * const { appearance, accessibility } = useSettings();
 * useApplySettings(appearance, accessibility);
 * ```
 */

"use client";

import { useEffect }                                          from "react";
import type { AppearanceSettings, AccessibilitySettings }    from "@/config/settings";

// ── Constantes ────────────────────────────────────────────────────────────────

/**
 * Matiz HSH por defecto del color de acento corporativo de EDM.
 * Cuando el colaborador restaura el acento por defecto, se eliminan
 * las variables CSS inline para que `dark.css` tome el control.
 */
export const DEFAULT_HUE = 258;

// ── Helpers internos ──────────────────────────────────────────────────────────

/**
 * Aplica las preferencias de apariencia directamente al elemento
 * `<html>` del documento.
 *
 * @remarks
 * Gestiona cinco dimensiones de apariencia de forma independiente:
 * tema, color de acento, densidad, animaciones. Cada cambio es
 * atómico — solo modifica los atributos y variables CSS relacionados
 * con la preferencia que cambió.
 *
 * Cuando `accentHue` es igual a {@link DEFAULT_HUE}, elimina las
 * variables CSS inline para que `dark.css` use los valores por defecto,
 * evitando duplicar definiciones.
 *
 * @param s - Preferencias de apariencia del colaborador.
 */
export function applyAppearance(s: AppearanceSettings): void {
  const root = document.documentElement;

  // ── Tema ──────────────────────────────────────────────────────────────────
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = s.theme === "dark" || (s.theme === "system" && prefersDark);
  root.classList.toggle("dark", isDark);
  root.setAttribute("data-theme", s.theme);

  // ── Acento ────────────────────────────────────────────────────────────────
  if (s.accentHue !== DEFAULT_HUE) {
    const h = s.accentHue;
    root.style.setProperty("--accent-h",         String(h));
    root.style.setProperty("--accent-500",        `hsl(${h}, 70%, 55%)`);
    root.style.setProperty("--accent-600",        `hsl(${h}, 68%, 48%)`);
    root.style.setProperty("--accent-700",        `hsl(${h}, 65%, 40%)`);
    root.style.setProperty("--accent-50",         `hsl(${h}, 80%, 97%)`);
    root.style.setProperty("--accent-100",        `hsl(${h}, 75%, 93%)`);
    root.style.setProperty("--accent-200",        `hsl(${h}, 70%, 86%)`);
    root.style.setProperty("--accent-foreground", "#ffffff");
  } else {
    root.style.removeProperty("--accent-h");
    root.style.removeProperty("--accent-500");
    root.style.removeProperty("--accent-600");
    root.style.removeProperty("--accent-700");
    root.style.removeProperty("--accent-50");
    root.style.removeProperty("--accent-100");
    root.style.removeProperty("--accent-200");
    root.style.removeProperty("--accent-foreground");
  }

  // ── Densidad ──────────────────────────────────────────────────────────────
  if (s.density !== "default") {
    root.setAttribute("data-density", s.density);
  } else {
    root.removeAttribute("data-density");
  }

  // ── Animaciones ───────────────────────────────────────────────────────────
  root.classList.toggle("reduce-motion", !s.animations);
  window.dispatchEvent(
    new CustomEvent("edm:animations", { detail: { enabled: s.animations } }),
  );
}

/**
 * Aplica las preferencias de accesibilidad directamente al elemento
 * `<html>` del documento.
 *
 * @remarks
 * Cuando `fontSize === "md"` (valor por defecto), elimina el atributo
 * `data-fontsize` y la propiedad `font-size` inline para que el CSS
 * base tome el control, evitando sobreescrituras innecesarias.
 *
 * @param s - Preferencias de accesibilidad del colaborador.
 */
export function applyAccessibility(s: AccessibilitySettings): void {
  const root = document.documentElement;

  root.classList.toggle("high-contrast",    s.highContrast);
  root.classList.toggle("reduce-motion",    s.reduceMotion);
  root.classList.toggle("focus-indicators", s.focusIndicators);

  const fontSizeMap = { sm: "14px", md: "16px", lg: "18px", xl: "20px" } as const;
  const fs = s.fontSize as keyof typeof fontSizeMap;
  if (fs !== "md") {
    root.style.fontSize = fontSizeMap[fs] ?? "16px";
    root.setAttribute("data-fontsize", fs);
  } else {
    root.style.removeProperty("font-size");
    root.removeAttribute("data-fontsize");
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Hook que aplica las preferencias de apariencia y accesibilidad al DOM
 * en tiempo real cuando cualquiera de sus valores cambia.
 *
 * @remarks
 * Usa tres `useEffect` independientes para optimizar los re-renders:
 *
 * 1. **Apariencia** — se ejecuta cuando cambia `theme`, `accentHue`,
 *    `density`, `sidebarCollapsed` o `animations`.
 * 2. **Accesibilidad** — se ejecuta cuando cambia `highContrast`,
 *    `reduceMotion`, `focusIndicators` o `fontSize`.
 * 3. **System theme listener** — se ejecuta solo cuando `theme === "system"`,
 *    escuchando cambios en `prefers-color-scheme` del sistema operativo.
 *    Se limpia automáticamente cuando el tema deja de ser `"system"`.
 *
 * @param appearance    - Preferencias de apariencia del colaborador,
 *   obtenidas desde `useSettings`.
 * @param accessibility - Preferencias de accesibilidad del colaborador,
 *   obtenidas desde `useSettings`.
 *
 * @example
 * ```tsx
 * export default function ConfiguracionPage() {
 *   const { appearance, accessibility, update } = useSettings();
 *
 *   // Preview en tiempo real mientras el colaborador cambia valores
 *   useApplySettings(appearance, accessibility);
 *
 *   return <SettingsPanel onUpdate={update} />;
 * }
 * ```
 */
export function useApplySettings(
  appearance:    AppearanceSettings,
  accessibility: AccessibilitySettings,
): void {
  useEffect(() => {
    applyAppearance(appearance);
  }, [
    appearance.theme,
    appearance.accentHue,
    appearance.density,
    appearance.sidebarCollapsed,
    appearance.animations,
  ]);

  useEffect(() => {
    applyAccessibility(accessibility);
  }, [
    accessibility.highContrast,
    accessibility.reduceMotion,
    accessibility.focusIndicators,
    accessibility.fontSize,
  ]);

  useEffect(() => {
    if (appearance.theme !== "system") return;
    const mq      = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyAppearance(appearance);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [appearance]);
}