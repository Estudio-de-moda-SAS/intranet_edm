// app/configuracion/hooks/useApplySettings.ts
// Aplica los settings de Apariencia y Accesibilidad al DOM en tiempo real.
// Se ejecuta en cada cambio — sin necesidad de recargar la página.
// También notifica al SettingsInitializer global para que se sincronice.
'use client';

import { useEffect } from 'react';
import type { AppearanceSettings, AccessibilitySettings } from '@/types/settings';

const DEFAULT_HUE = 258;

function applyAppearance(s: AppearanceSettings) {
  const root = document.documentElement;

  // Tema
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = s.theme === 'dark' || (s.theme === 'system' && prefersDark);
  root.classList.toggle('dark', isDark);
  root.setAttribute('data-theme', s.theme);

  // Acento
  if (s.accentHue !== DEFAULT_HUE) {
    const h = s.accentHue;
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

  // Densidad
  if (s.density !== 'default') {
    root.setAttribute('data-density', s.density);
  } else {
    root.removeAttribute('data-density');
  }

  // Animaciones
  root.classList.toggle('reduce-motion', !s.animations);
  window.dispatchEvent(
    new CustomEvent('edm:animations', { detail: { enabled: s.animations } })
  );
}

function applyAccessibility(s: AccessibilitySettings) {
  const root = document.documentElement;

  root.classList.toggle('high-contrast',    s.highContrast);
  root.classList.toggle('reduce-motion',    s.reduceMotion);
  root.classList.toggle('focus-indicators', s.focusIndicators);

  const fontSizeMap = { sm: '14px', md: '16px', lg: '18px', xl: '20px' } as const;
  const fs = s.fontSize as keyof typeof fontSizeMap;
  if (fs !== 'md') {
    root.style.fontSize = fontSizeMap[fs] ?? '16px';
    root.setAttribute('data-fontsize', fs);
  } else {
    root.style.removeProperty('font-size');
    root.removeAttribute('data-fontsize');
  }
}

export function useApplySettings(
  appearance:    AppearanceSettings,
  accessibility: AccessibilitySettings,
) {
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

  // System theme listener
  useEffect(() => {
    if (appearance.theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyAppearance(appearance);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [appearance]);
}