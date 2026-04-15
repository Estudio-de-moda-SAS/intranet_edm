/**
 * @module components/SettingsInitializer
 * Componente inicializador de preferencias de apariencia y accesibilidad
 * de la intranet EDM.
 *
 * @remarks
 * Se monta una sola vez en {@link module:providers} y corre en **todas**
 * las rutas de la intranet. Su única responsabilidad es leer las
 * preferencias guardadas en `localStorage` y aplicarlas al `<html>`
 * antes del primer render visible, evitando el flash de tema incorrecto
 * (FOUC — Flash Of Unstyled Content).
 *
 * A diferencia de {@link useApplySettings}, este componente no depende
 * del estado de React ni de ningún hook de settings — solo lee
 * `localStorage` directamente, lo que lo hace más ligero y seguro
 * para ejecutar en el montaje inicial.
 *
 * **Eventos escuchados:**
 * | Evento                  | Origen                                    |
 * |-------------------------|-------------------------------------------|
 * | `edm:settings-changed`  | Página de configuración al guardar cambios|
 * | `storage`               | Cambios en `localStorage` desde otras pestañas|
 * | `prefers-color-scheme`  | Cambio de tema del sistema operativo      |
 *
 * **Atributos y clases aplicadas al `<html>`:**
 * | Atributo / Clase         | Valor                                    |
 * |--------------------------|------------------------------------------|
 * | `class="dark"`           | Modo oscuro activo                       |
 * | `data-theme`             | `"light"` \| `"dark"` \| `"system"`     |
 * | `data-density`           | `"compact"` \| `"spacious"` (omitido si `"default"`) |
 * | `data-fontsize`          | `"sm"` \| `"lg"` \| `"xl"` (omitido si `"md"`) |
 * | `class="reduce-motion"`  | Animaciones desactivadas                 |
 * | `class="high-contrast"`  | Alto contraste activo                    |
 * | `class="focus-indicators"`| Indicadores de foco visibles            |
 */

"use client";

import { useEffect } from "react";

// ── Constantes ────────────────────────────────────────────────────────────────

/**
 * Clave de `localStorage` donde se persisten todas las preferencias
 * del colaborador. Debe coincidir con la usada en `useSettings`.
 */
export const STORAGE_KEY = "edm_intranet_settings";

/**
 * Matiz HSH por defecto del color de acento corporativo de EDM (violeta).
 * Cuando el colaborador no ha personalizado el acento, se usan las
 * variables CSS definidas en `dark.css` en lugar de setearlas inline.
 */
export const DEFAULT_HUE = 258;

// ── Helpers internos ──────────────────────────────────────────────────────────

/**
 * Lee las preferencias de apariencia y accesibilidad desde `localStorage`
 * y las aplica al elemento `<html>` del documento.
 *
 * @remarks
 * Opera directamente sobre el DOM sin pasar por React — esto es
 * intencional para que los cambios sean síncronos y no causen
 * re-renders innecesarios. Se ejecuta de forma segura en SSR
 * comprobando `typeof window === "undefined"` antes de acceder al DOM.
 *
 * Si el JSON de `localStorage` está corrupto o no existe, usa los
 * valores por defecto sin lanzar excepciones — la app nunca debe
 * crashear por preferencias inválidas.
 *
 * **Orden de aplicación:**
 * 1. Tema (dark/light/system) → clase `dark` en `<html>`
 * 2. Color de acento → variables CSS `--accent-*` inline
 * 3. Densidad → atributo `data-density`
 * 4. Animaciones → clase `reduce-motion` + evento `edm:animations`
 * 5. Accesibilidad → clases `high-contrast`, `reduce-motion`, `focus-indicators`
 * 6. Tamaño de fuente → `font-size` inline + atributo `data-fontsize`
 */
export function applyFromStorage(): void {
  if (typeof window === "undefined") return;

  let appearance = {
    theme:      "light" as string,
    accentHue:  DEFAULT_HUE,
    density:    "default" as string,
    animations: true,
  };
  let accessibility = {
    highContrast:    false,
    reduceMotion:    false,
    focusIndicators: false,
    fontSize:        "md" as string,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.appearance)    appearance    = { ...appearance,    ...parsed.appearance };
      if (parsed.accessibility) accessibility = { ...accessibility, ...parsed.accessibility };
    }
  } catch {
    // Si falla el parse, usa defaults — no crashear la app
  }

  const root = document.documentElement;

  // ── Tema ──────────────────────────────────────────────────────────────────
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = appearance.theme === "dark" || (appearance.theme === "system" && prefersDark);
  root.classList.toggle("dark", isDark);
  root.setAttribute("data-theme", appearance.theme);

  // ── Acento ────────────────────────────────────────────────────────────────
  if (appearance.accentHue !== DEFAULT_HUE) {
    const h = appearance.accentHue;
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
  if (appearance.density !== "default") {
    root.setAttribute("data-density", appearance.density);
  } else {
    root.removeAttribute("data-density");
  }

  // ── Animaciones ───────────────────────────────────────────────────────────
  root.classList.toggle("reduce-motion", !appearance.animations);
  window.dispatchEvent(
    new CustomEvent("edm:animations", { detail: { enabled: appearance.animations } }),
  );

  // ── Accesibilidad ─────────────────────────────────────────────────────────
  root.classList.toggle("high-contrast",    accessibility.highContrast);
  root.classList.toggle("reduce-motion",    accessibility.reduceMotion);
  root.classList.toggle("focus-indicators", accessibility.focusIndicators);

  const fontSizeMap = { sm: "14px", md: "16px", lg: "18px", xl: "20px" } as const;
  const fs = accessibility.fontSize as keyof typeof fontSizeMap;
  if (fs !== "md") {
    root.style.fontSize = fontSizeMap[fs] ?? "16px";
    root.setAttribute("data-fontsize", fs);
  } else {
    root.style.removeProperty("font-size");
    root.removeAttribute("data-fontsize");
  }
}

// ── Componente ────────────────────────────────────────────────────────────────

/**
 * Componente sin UI que aplica las preferencias del colaborador al DOM
 * en cada carga de página y las mantiene sincronizadas entre pestañas
 * y con el tema del sistema operativo.
 *
 * @remarks
 * Retorna `null` — no renderiza ningún elemento en el DOM. Toda su
 * lógica vive en el `useEffect` que se ejecuta tras el montaje.
 *
 * Debe montarse lo más alto posible en el árbol de componentes —
 * actualmente en {@link module:providers} — para garantizar que las
 * preferencias se apliquen antes de que cualquier componente hijo
 * se renderice con clases de Tailwind.
 *
 * @example
 * ```tsx
 * // En Providers:
 * <QueryClientProvider client={queryClient}>
 *   <SettingsInitializer />
 *   {children}
 * </QueryClientProvider>
 * ```
 */
export function SettingsInitializer(): null {
  useEffect(() => {
    applyFromStorage();

    const handleSettingsChange = () => applyFromStorage();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) applyFromStorage();
    };
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => applyFromStorage();

    window.addEventListener("edm:settings-changed", handleSettingsChange);
    window.addEventListener("storage", handleStorage);
    mq.addEventListener("change", handleMediaChange);

    return () => {
      window.removeEventListener("edm:settings-changed", handleSettingsChange);
      window.removeEventListener("storage", handleStorage);
      mq.removeEventListener("change", handleMediaChange);
    };
  }, []);

  return null;
}