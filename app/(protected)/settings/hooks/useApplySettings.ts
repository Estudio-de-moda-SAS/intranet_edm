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

  // Acento — solo escribe en DOM si es distinto al default
  // Así brand-title y otros elementos no quedan afectados en estado normal
  if (s.accentHue !== DEFAULT_HUE) {
    const h = s.accentHue;
    root.style.setProperty('--accent-h',          String(h));
    root.style.setProperty('--accent-500',         `hsl(${h}, 70%, 55%)`);
    root.style.setProperty('--accent-600',         `hsl(${h}, 68%, 48%)`);
    root.style.setProperty('--accent-700',         `hsl(${h}, 65%, 40%)`);
    root.style.setProperty('--accent-50',          `hsl(${h}, 80%, 97%)`);
    root.style.setProperty('--accent-100',         `hsl(${h}, 75%, 93%)`);
    root.style.setProperty('--accent-200',         `hsl(${h}, 70%, 86%)`);
    root.style.setProperty('--accent-foreground',  '#ffffff');
  } else {
    // Restaura — elimina inline styles para que el CSS de :root tome control
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

  // Animaciones — clase CSS para transiciones Tailwind + evento para Framer Motion en Providers
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

  // Tamaño de fuente — escala todo via rem
  const fontSizeMap = { sm: '14px', md: '16px', lg: '18px', xl: '20px' } as const;
  if (s.fontSize !== 'md') {
    root.style.fontSize = fontSizeMap[s.fontSize];
    root.setAttribute('data-fontsize', s.fontSize);
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

  useEffect(() => {
    if (appearance.theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyAppearance(appearance);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [appearance]);
}