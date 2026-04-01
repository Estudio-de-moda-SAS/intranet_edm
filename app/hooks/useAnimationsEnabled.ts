// app/hooks/useAnimationsEnabled.ts
// Hook que lee si las animaciones están habilitadas desde localStorage
// y se actualiza en tiempo real cuando el usuario cambia el setting.
'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'edm_intranet_settings';

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

export function useAnimationsEnabled(): boolean {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(readEnabled());

    const onCustom = (e: Event) => {
      setEnabled((e as CustomEvent<{ enabled: boolean }>).detail.enabled);
    };
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
