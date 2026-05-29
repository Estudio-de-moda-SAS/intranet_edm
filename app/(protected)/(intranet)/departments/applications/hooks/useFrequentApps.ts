"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_PREFIX = "frequent-apps";

type UseFrequentAppsParams = {
  userKey?: string | null;
};

export function useFrequentApps({ userKey }: UseFrequentAppsParams) {
  const [frequentAppIds, setFrequentAppIds] = useState<string[]>([]);

  const storageKey = useMemo(() => {
    return userKey ? `${STORAGE_PREFIX}:${userKey}` : null;
  }, [userKey]);

  useEffect(() => {
    if (!storageKey) return;

    try {
      const stored = window.localStorage.getItem(storageKey);
      setFrequentAppIds(stored ? JSON.parse(stored) : []);
    } catch {
      setFrequentAppIds([]);
    }
  }, [storageKey]);

  const persist = useCallback(
    (nextIds: string[]) => {
      setFrequentAppIds(nextIds);

      if (!storageKey) return;

      try {
        window.localStorage.setItem(storageKey, JSON.stringify(nextIds));
      } catch {
        // Evita romper la UI si localStorage no está disponible.
      }
    },
    [storageKey],
  );

  const isFrequent = useCallback(
    (appId?: string) => {
      if (!appId) return false;
      return frequentAppIds.includes(appId);
    },
    [frequentAppIds],
  );

  const toggleFrequent = useCallback(
    (appId?: string) => {
      if (!appId) return;

      const nextIds = frequentAppIds.includes(appId)
        ? frequentAppIds.filter((id) => id !== appId)
        : [...frequentAppIds, appId];

      persist(nextIds);
    },
    [frequentAppIds, persist],
  );

  return {
    frequentAppIds,
    isFrequent,
    toggleFrequent,
  };
}