// app/components/SettingsInitializer.tsx
// Componente ligero que aplica los settings al DOM en cada carga de página.
// Se monta en Providers → corre en TODAS las rutas, no solo en /configuracion.
'use client';

import { useEffect } from 'react';

const STORAGE_KEY = 'edm_intranet_settings';
const DEFAULT_HUE = 258;

/**
 * Lee los settings de localStorage y los aplica al <html>.
 * Es una versión "standalone" de useApplySettings que no depende
 * del hook useSettings — solo lee lo que haya guardado.
 */
function applyFromStorage() {
  if (typeof window === 'undefined') return;

  let appearance = {
    theme: 'light' as string,
    accentHue: DEFAULT_HUE,
    density: 'default' as string,
    animations: true,
  };
  let accessibility = {
    highContrast: false,
    reduceMotion: false,
    focusIndicators: false,
    fontSize: 'md' as string,
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

  // ── Tema ──────────────────────────────────────────────────
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = appearance.theme === 'dark' || (appearance.theme === 'system' && prefersDark);
  root.classList.toggle('dark', isDark);
  root.setAttribute('data-theme', appearance.theme);

  // ── Acento ────────────────────────────────────────────────
  if (appearance.accentHue !== DEFAULT_HUE) {
    const h = appearance.accentHue;
    root.style.setProperty('--accent-h',         String(h));
    root.style.setProperty('--accent-500',        `hsl(${h}, 70%, 55%)`);
    root.style.setProperty('--accent-600',        `hsl(${h}, 68%, 48%)`);
    root.style.setProperty('--accent-700',        `hsl(${h}, 65%, 40%)`);
    root.style.setProperty('--accent-50',         `hsl(${h}, 80%, 97%)`);
    root.style.setProperty('--accent-100',        `hsl(${h}, 75%, 93%)`);
    root.style.setProperty('--accent-200',        `hsl(${h}, 70%, 86%)`);
    root.style.setProperty('--accent-foreground', '#ffffff');
  } else {
    root.style.removeProperty('--accent-h');
    root.style.removeProperty('--accent-500');
    root.style.removeProperty('--accent-600');
    root.style.removeProperty('--accent-700');
    root.style.removeProperty('--accent-50');
    root.style.removeProperty('--accent-100');
    root.style.removeProperty('--accent-200');
    root.style.removeProperty('--accent-foreground');
  }

  // ── Densidad ──────────────────────────────────────────────
  if (appearance.density !== 'default') {
    root.setAttribute('data-density', appearance.density);
  } else {
    root.removeAttribute('data-density');
  }

  // ── Animaciones ───────────────────────────────────────────
  root.classList.toggle('reduce-motion', !appearance.animations);
  window.dispatchEvent(
    new CustomEvent('edm:animations', { detail: { enabled: appearance.animations } })
  );

  // ── Accesibilidad ─────────────────────────────────────────
  root.classList.toggle('high-contrast',    accessibility.highContrast);
  root.classList.toggle('reduce-motion',    accessibility.reduceMotion);
  root.classList.toggle('focus-indicators', accessibility.focusIndicators);

  const fontSizeMap = { sm: '14px', md: '16px', lg: '18px', xl: '20px' } as const;
  const fs = accessibility.fontSize as keyof typeof fontSizeMap;
  if (fs !== 'md') {
    root.style.fontSize = fontSizeMap[fs] ?? '16px';
    root.setAttribute('data-fontsize', fs);
  } else {
    root.style.removeProperty('font-size');
    root.removeAttribute('data-fontsize');
  }
}

export function SettingsInitializer() {
  useEffect(() => {
    // Aplica inmediatamente al montar
    applyFromStorage();

    // Escucha cambios desde la página de configuración (CustomEvent)
    const handleSettingsChange = () => applyFromStorage();
    window.addEventListener('edm:settings-changed', handleSettingsChange);

    // Escucha cambios desde otras pestañas (StorageEvent)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) applyFromStorage();
    };
    window.addEventListener('storage', handleStorage);

    // Escucha cambios de prefers-color-scheme del sistema
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => applyFromStorage();
    mq.addEventListener('change', handleMediaChange);

    return () => {
      window.removeEventListener('edm:settings-changed', handleSettingsChange);
      window.removeEventListener('storage', handleStorage);
      mq.removeEventListener('change', handleMediaChange);
    };
  }, []);

  return null; // No renderiza nada — solo side effects
}
