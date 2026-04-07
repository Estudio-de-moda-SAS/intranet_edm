// hooks/useSettings.ts
// Capa de persistencia desacoplada — swap localStorage → API/Prisma sin tocar los tabs
//
// Para conectar a API real:
//   1. Reemplaza loadFromStorage() con: await fetch('/api/settings')
//   2. Reemplaza saveToStorage()   con: await fetch('/api/settings', { method: 'PUT', body: ... })
//   3. Envuelve en useEffect + SWR/React Query para revalidación

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

// ─── Storage helpers (swap these for API calls) ───────────────────

function loadFromStorage(): AllSettings {
  // TODO: reemplazar con → const res = await fetch('/api/configuracion'); return res.json();
  if (typeof window === 'undefined') return getDefaults();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaults();
    const parsed = JSON.parse(raw) as Partial<AllSettings>;
    // Merge con defaults para tolerar keys nuevas sin romper clientes viejos
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
  // TODO: reemplazar con →
  //   await fetch('/api/configuracion', {
  //     method: 'PUT',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(data),
  //   });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ─── Hook público ─────────────────────────────────────────────────

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useSettings() {
  const [settings, setSettings] = useState<AllSettings>(getDefaults);
  const [dirty,      setDirty]  = useState(false);
  const [saveStatus, setStatus] = useState<SaveStatus>('idle');
  const debounceRef              = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cargar desde storage al montar
  useEffect(() => {
    setSettings(loadFromStorage());
  }, []);

  const markDirty = useCallback(() => {
    setDirty(true);
    setStatus('idle');
  }, []);

  // Updaters tipados por sección
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

  // Guardar manual (botón SaveBar)
  const save = useCallback(async () => {
    if (!dirty) return;
    setStatus('saving');
    try {
      await saveToStorage(settings);
      setDirty(false);
      setStatus('saved');
      // Reset a idle después de 2.5s
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setStatus('idle'), 2500);
    } catch {
      setStatus('error');
    }
  }, [dirty, settings]);

  // Descartar cambios
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