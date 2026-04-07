'use client';

import { useState, useCallback, useRef } from 'react';
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
  window.dispatchEvent(new CustomEvent('edm:settings-changed'));
}

function isEqual(a: AllSettings, b: AllSettings): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ─── Hook público ─────────────────────────────────────────────────────────────

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useSettings() {
  const [saved,   setSaved]   = useState<AllSettings>(loadFromStorage);
  const [current, setCurrent] = useState<AllSettings>(loadFromStorage);
  const [saveStatus, setStatus] = useState<SaveStatus>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // dirty se deriva de la comparación — nunca se setea manualmente
  const dirty = !isEqual(current, saved);

  const updateNotifications = useCallback(
    <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => {
      setCurrent((prev) => ({ ...prev, notifications: { ...prev.notifications, [key]: value } }));
    },
    [],
  );

  const updateAppearance = useCallback(
    <K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) => {
      setCurrent((prev) => ({ ...prev, appearance: { ...prev.appearance, [key]: value } }));
    },
    [],
  );

  const updateAccessibility = useCallback(
    <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
      setCurrent((prev) => ({ ...prev, accessibility: { ...prev.accessibility, [key]: value } }));
    },
    [],
  );

  const updateIntegration = useCallback((id: string, connected: boolean) => {
    setCurrent((prev) => ({
      ...prev,
      integrations: { ...prev.integrations, [id]: connected },
    }));
  }, []);

  const save = useCallback(async () => {
    if (!dirty) return;
    setStatus('saving');
    try {
      await saveToStorage(current);
      setSaved(current); // saved se sincroniza → dirty vuelve a false automáticamente
      setStatus('saved');
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setStatus('idle'), 2500);
    } catch {
      setStatus('error');
    }
  }, [dirty, current]);

  const discard = useCallback(() => {
    setCurrent(saved); // vuelve al último guardado → dirty false automáticamente
    setStatus('idle');
  }, [saved]);

  return {
    settings: current,
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