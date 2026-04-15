/**
 * @module hooks/useSettings
 * Hook principal de gestión de preferencias personales de la intranet EDM.
 *
 * @remarks
 * Gestiona el ciclo de vida completo de las preferencias del colaborador:
 * carga inicial desde `localStorage`, mutaciones por sección, detección
 * de cambios pendientes y persistencia con feedback de estado.
 *
 * **Arquitectura de estado dual:**
 * Mantiene dos copias del estado — `saved` (último guardado) y `current`
 * (estado de trabajo) — para implementar el patrón "cambios pendientes"
 * sin lógica adicional. `dirty` se deriva automáticamente comparando
 * ambas copias, nunca se setea manualmente.
 *
 * **Flujo de datos:**
 * ```
 * localStorage → loadFromStorage() → saved + current (estado inicial)
 *                                         ↓
 *                               updateX() → current (mutaciones)
 *                                         ↓
 *                                save() → saved ← current (persistencia)
 *                                         ↓
 *                            localStorage + edm:settings-changed
 * ```
 *
 * @example
 * ```tsx
 * const {
 *   settings, dirty, saveStatus,
 *   save, discard,
 *   updateAppearance,
 * } = useSettings();
 *
 * // Cambio en tiempo real
 * updateAppearance("theme", "dark");
 *
 * // Guardar cuando el colaborador confirma
 * if (dirty) await save();
 * ```
 */

"use client";

import { useState, useCallback, useRef } from "react";
import {
  DEFAULT_NOTIFICATIONS,
  DEFAULT_APPEARANCE,
  DEFAULT_ACCESSIBILITY,
  INTEGRATIONS,
} from "../config/settingsValues";
import type {
  NotificationSettings,
  AppearanceSettings,
  AccessibilitySettings,
} from "@/config/settings";

// ── Constantes ────────────────────────────────────────────────────────────────

/**
 * Clave de `localStorage` donde se persisten todas las preferencias
 * del colaborador. Debe coincidir con la usada en
 * `SettingsInitializer` y `applyFromStorage`.
 */
const STORAGE_KEY = "edm_intranet_settings";

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Agregado completo de todas las preferencias configurables del
 * colaborador, usado como estructura interna del hook.
 */
interface AllSettings {
  /** Preferencias de notificaciones. */
  notifications: NotificationSettings;

  /** Preferencias de apariencia visual. */
  appearance: AppearanceSettings;

  /** Preferencias de accesibilidad. */
  accessibility: AccessibilitySettings;

  /**
   * Estado de conexión de cada integración, indexado por su `id`.
   * `true` indica que la integración está actualmente conectada.
   */
  integrations: Record<string, boolean>;
}

/**
 * Estado de la operación de guardado de preferencias.
 *
 * | Valor     | Descripción                                      |
 * |-----------|--------------------------------------------------|
 * | `idle`    | Sin operación en curso ni resultado pendiente    |
 * | `saving`  | Guardado en progreso                             |
 * | `saved`   | Guardado completado con éxito                    |
 * | `error`   | Error durante el guardado — mostrar opción retry |
 */
export type SaveStatus = "idle" | "saving" | "saved" | "error";

// ── Helpers internos ──────────────────────────────────────────────────────────

/**
 * Construye el objeto de preferencias por defecto combinando las
 * constantes `DEFAULT_*` de `settingsValues.ts` y el estado inicial
 * de conexión de cada integración.
 *
 * @returns Objeto `AllSettings` con todos los valores por defecto.
 */
function getDefaults(): AllSettings {
  return {
    notifications: DEFAULT_NOTIFICATIONS,
    appearance:    DEFAULT_APPEARANCE,
    accessibility: DEFAULT_ACCESSIBILITY,
    integrations:  Object.fromEntries(INTEGRATIONS.map((i) => [i.id, i.connected])),
  };
}

/**
 * Carga las preferencias del colaborador desde `localStorage`,
 * fusionándolas con los valores por defecto para garantizar que
 * todos los campos estén presentes aunque el storage esté incompleto.
 *
 * @remarks
 * Retorna los valores por defecto en los siguientes casos:
 * - Ejecución en servidor (`window === "undefined"`).
 * - No hay preferencias guardadas en `localStorage`.
 * - El JSON almacenado está corrupto o no es parseable.
 *
 * La fusión con `getDefaults()` garantiza retrocompatibilidad cuando
 * se añaden nuevos campos a `AllSettings` — los campos nuevos
 * reciben su valor por defecto sin romper configuraciones existentes.
 *
 * @returns Preferencias del colaborador fusionadas con los defaults.
 */
function loadFromStorage(): AllSettings {
  if (typeof window === "undefined") return getDefaults();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaults();
    const parsed   = JSON.parse(raw) as Partial<AllSettings>;
    const defaults = getDefaults();
    return {
      notifications: { ...defaults.notifications, ...parsed.notifications },
      appearance:    { ...defaults.appearance,    ...parsed.appearance    },
      accessibility: { ...defaults.accessibility, ...parsed.accessibility },
      integrations:  { ...defaults.integrations,  ...parsed.integrations  },
    };
  } catch {
    return getDefaults();
  }
}

/**
 * Persiste las preferencias en `localStorage` y notifica a otros
 * componentes mediante el evento personalizado `edm:settings-changed`.
 *
 * @remarks
 * El evento `edm:settings-changed` es escuchado por
 * `SettingsInitializer` para reaplicar los settings al DOM
 * inmediatamente tras el guardado.
 *
 * @param data - Preferencias completas a persistir.
 */
async function saveToStorage(data: AllSettings): Promise<void> {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent("edm:settings-changed"));
}

/**
 * Compara dos objetos `AllSettings` por valor usando serialización JSON.
 *
 * @remarks
 * Suficientemente eficiente para el tamaño del objeto de settings.
 * Se usa para derivar `dirty` sin necesidad de comparaciones campo
 * a campo.
 *
 * @param a - Primera instancia de preferencias.
 * @param b - Segunda instancia de preferencias.
 * @returns `true` si ambos objetos son equivalentes por valor.
 */
function isEqual(a: AllSettings, b: AllSettings): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ── Hook público ──────────────────────────────────────────────────────────────

/**
 * Hook principal de gestión de preferencias personales de la
 * intranet EDM.
 *
 * @remarks
 * Implementa el patrón de estado dual (`saved` + `current`) para
 * detectar cambios pendientes sin lógica adicional. `dirty` se
 * deriva automáticamente comparando ambas copias en cada render.
 *
 * Las funciones `updateX` están memoizadas con `useCallback` y
 * dependencias vacías para que sean estables entre renders —
 * seguras para pasar como props sin causar re-renders innecesarios
 * en los componentes hijos.
 *
 * El estado `saved` se actualiza al guardar y `discard` lo copia
 * de vuelta a `current`, haciendo que `dirty` vuelva a `false`
 * automáticamente sin necesidad de resetearlo manualmente.
 *
 * Tras un guardado exitoso, `saveStatus` vuelve a `"idle"`
 * automáticamente después de 2.5 segundos mediante un timeout
 * gestionado con `debounceRef`.
 *
 * @returns Objeto con el estado de las preferencias y las acciones
 *   para mutarlas, guardarlas y descartarlas.
 */
export function useSettings() {
  const [saved,   setSaved]   = useState<AllSettings>(loadFromStorage);
  const [current, setCurrent] = useState<AllSettings>(loadFromStorage);
  const [saveStatus, setStatus] = useState<SaveStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** `true` si hay cambios en `current` que no han sido guardados en `saved`. */
  const dirty = !isEqual(current, saved);

  /**
   * Actualiza un campo de las preferencias de notificaciones.
   * El cambio se refleja en la UI inmediatamente sin guardar.
   */
  const updateNotifications = useCallback(
    <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => {
      setCurrent((prev) => ({
        ...prev,
        notifications: { ...prev.notifications, [key]: value },
      }));
    },
    [],
  );

  /**
   * Actualiza un campo de las preferencias de apariencia.
   * `useApplySettings` aplica el cambio al DOM en tiempo real.
   */
  const updateAppearance = useCallback(
    <K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) => {
      setCurrent((prev) => ({
        ...prev,
        appearance: { ...prev.appearance, [key]: value },
      }));
    },
    [],
  );

  /**
   * Actualiza un campo de las preferencias de accesibilidad.
   * `useApplySettings` aplica el cambio al DOM en tiempo real.
   */
  const updateAccessibility = useCallback(
    <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
      setCurrent((prev) => ({
        ...prev,
        accessibility: { ...prev.accessibility, [key]: value },
      }));
    },
    [],
  );

  /**
   * Actualiza el estado de conexión de una integración específica.
   *
   * @param id        - Identificador de la integración.
   * @param connected - Nuevo estado de conexión.
   */
  const updateIntegration = useCallback((id: string, connected: boolean) => {
    setCurrent((prev) => ({
      ...prev,
      integrations: { ...prev.integrations, [id]: connected },
    }));
  }, []);

  /**
   * Persiste las preferencias actuales en `localStorage`.
   *
   * @remarks
   * No hace nada si `dirty === false`. Tras un guardado exitoso,
   * sincroniza `saved` con `current` (haciendo `dirty = false`) y
   * programa el reset de `saveStatus` a `"idle"` en 2.5 segundos.
   */
  const save = useCallback(async () => {
    if (!dirty) return;
    setStatus("saving");
    try {
      await saveToStorage(current);
      setSaved(current);
      setStatus("saved");
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
    }
  }, [dirty, current]);

  /**
   * Descarta todos los cambios pendientes restaurando `current` al
   * último estado guardado en `saved`.
   *
   * @remarks
   * Al igualar `current` a `saved`, `dirty` vuelve a `false`
   * automáticamente sin necesidad de resetearlo manualmente.
   */
  const discard = useCallback(() => {
    setCurrent(saved);
    setStatus("idle");
  }, [saved]);

  return {
    /** Estado actual de todas las preferencias (puede tener cambios pendientes). */
    settings: current,
    /** `true` si hay cambios sin guardar. */
    dirty,
    /** Estado de la última operación de guardado. */
    saveStatus,
    /** Persiste los cambios actuales en `localStorage`. */
    save,
    /** Descarta los cambios pendientes restaurando el último guardado. */
    discard,
    /** Actualiza un campo de las preferencias de notificaciones. */
    updateNotifications,
    /** Actualiza un campo de las preferencias de apariencia. */
    updateAppearance,
    /** Actualiza un campo de las preferencias de accesibilidad. */
    updateAccessibility,
    /** Actualiza el estado de conexión de una integración. */
    updateIntegration,
  };
}