/**
 * @module useAnimationsEnabled
 * Hook para determinar si las animaciones de la interfaz están habilitadas.
 *
 * @remarks
 * Este hook:
 *
 * - Lee el estado de animaciones desde `localStorage`
 * - Escucha cambios en tiempo real
 * - Permite que la UI reaccione dinámicamente a cambios de configuración
 *
 * Fuente de verdad:
 *
 * - `localStorage` bajo la clave `edm_intranet_settings`
 * - Eventos personalizados (`edm:animations`)
 * - Evento nativo `storage` (sincronización entre pestañas)
 */

// app/hooks/useAnimationsEnabled.ts 
// Hook que lee si las animaciones están habilitadas desde localStorage
// y se actualiza en tiempo real cuando el usuario cambia el setting.
'use client';

import { useState, useEffect } from 'react';

/**
 * Clave utilizada para almacenar configuraciones en localStorage.
 */
const STORAGE_KEY = 'edm_intranet_settings';

/**
 * Lee el estado de animaciones desde localStorage.
 *
 * @returns `true` si las animaciones están habilitadas, `false` en caso contrario.
 *
 * @remarks
 * - Si no existe configuración, retorna `true` por defecto.
 * - Maneja errores silenciosamente (fail-safe).
 * - Evita ejecución en SSR comprobando `window`.
 */
function readEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    return JSON.parse(raw)?.appearance?.animations ?? true;
  } catch {
    return true;
  }
}

/**
 * Hook que indica si las animaciones están activadas en la aplicación.
 *
 * @returns Estado booleano de animaciones (`true` = activadas).
 *
 * @remarks
 * Este hook:
 *
 * - Inicializa el estado leyendo desde localStorage
 * - Escucha cambios mediante:
 *   - Evento personalizado `edm:animations`
 *   - Evento `storage` (multi-tab)
 * - Actualiza automáticamente el estado cuando cambia la configuración
 *
 * Eventos soportados:
 *
 * - `edm:animations` → evento custom emitido internamente
 * - `storage` → sincronización entre pestañas del navegador
 *
 * @example
 * ```tsx
 * const animationsEnabled = useAnimationsEnabled();
 *
 * if (animationsEnabled) {
 *   // Renderizar con animaciones
 * }
 * ```
 */
export function useAnimationsEnabled(): boolean {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(readEnabled());

    /**
     * Maneja cambios mediante evento personalizado.
     */
    const onCustom = (e: Event) => {
      setEnabled((e as CustomEvent<{ enabled: boolean }>).detail.enabled);
    };

    /**
     * Maneja cambios en localStorage (otras pestañas).
     */
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setEnabled(readEnabled());
    };

    window.addEventListener('edm:animations', onCustom);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('edm:animations', onCustom);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return enabled;
}