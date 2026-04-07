'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  DEFAULT_NOTIFICATIONS,
  DEFAULT_APPEARANCE,
  DEFAULT_ACCESSIBILITY,
  INTEGRATIONS,
} from '../config/settingsValues';
import type {
  NotificationSettings,
  AppearanceSettings,
  AccessibilitySettings,
} from '@/types/settings';

const STORAGE_KEY = 'edm_intranet_settings';

interface AllSettings {
  notifications:  NotificationSettings;
  appearance:     AppearanceSettings;
  accessibility:  AccessibilitySettings;
  integrations:   Record<string, boolean>;
}

function getDefaults(): AllSettings {
  return {
    notifications: DEFAULT_NOTIFICATIONS,
    appearance:    DEFAULT_APPEARANCE,
    accessibility: DEFAULT_ACCESSIBILITY,
    integrations:  Object.fromEntries(INTEGRATIONS.map((i) => [i.id, i.connected])),
  };
}

// ─── Lee localStorage sincrónicamente — igual que el anti-FOUC script ─────────
// Esto evita que useApplySettings corra con defaults (theme:'light') antes
// de que el useEffect cargue el valor real, removiendo la clase 'dark' del html.

function loadFromStorage(): AllSettings {
  if (typeof window === 'undefined') return getDefaults();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaults();
    const parsed = JSON.parse(raw) as Partial<AllSettings>;
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

async function saveToStorage(data: AllSettings): Promise<void> {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  // Notifica a SettingsInitializer y otras pestañas
  window.dispatchEvent(new CustomEvent('edm:settings-changed'));
}

// ─── Hook público ─────────────────────────────────────────────────────────────

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useSettings() {
  // ✅ Inicializa directamente desde localStorage (síncrono en cliente).
  // Antes usaba getDefaults() como estado inicial, luego un useEffect
  // sobreescribía con el valor real — pero entre medio useApplySettings
  // corría con theme:'light' y removía la clase 'dark' del <html>.
  const [settings, setSettings] = useState<AllSettings>(loadFromStorage);
  const [dirty,      setDirty]  = useState(false);
  const [saveStatus, setStatus] = useState<SaveStatus>('idle');
  const debounceRef              = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markDirty = useCallback(() => {
    setDirty(true);
    setStatus('idle');
  }, []);

  const updateNotifications = useCallback(
    <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => {
      setSettings((prev) => ({ ...prev, notifications: { ...prev.notifications, [key]: value } }));
      markDirty();
    },
    [markDirty],
  );

  const updateAppearance = useCallback(
    <K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) => {
      setSettings((prev) => ({ ...prev, appearance: { ...prev.appearance, [key]: value } }));
      markDirty();
    },
    [markDirty],
  );

  const updateAccessibility = useCallback(
    <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
      setSettings((prev) => ({ ...prev, accessibility: { ...prev.accessibility, [key]: value } }));
      markDirty();
    },
    [markDirty],
  );

  const updateIntegration = useCallback(
    (id: string, connected: boolean) => {
      setSettings((prev) => ({
        ...prev,
        integrations: { ...prev.integrations, [id]: connected },
      }));
      markDirty();
    },
    [markDirty],
  );

  const save = useCallback(async () => {
    if (!dirty) return;
    setStatus('saving');
    try {
      await saveToStorage(settings);
      setDirty(false);
      setStatus('saved');
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setStatus('idle'), 2500);
    } catch {
      setStatus('error');
    }
  }, [dirty, settings]);

  const discard = useCallback(() => {
    setSettings(loadFromStorage());
    setDirty(false);
    setStatus('idle');
  }, []);

  return {
    settings,
    dirty,
    saveStatus,
    save,
    discard,
    updateNotifications,
    updateAppearance,
    updateAccessibility,
    updateIntegration,
  };
}