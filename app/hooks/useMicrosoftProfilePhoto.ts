"use client";

import { useCallback, useEffect, useState } from "react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";

const GRAPH_PROFILE_SCOPES = ["User.Read"];
const GRAPH_PROFILE_PHOTO_URL =
  "https://graph.microsoft.com/v1.0/me/photo/$value";

const PROFILE_PHOTO_CACHE_KEY = "edm_profile_photo_cache";
const PROFILE_PHOTO_MISSING_CACHE_KEY = "edm_profile_photo_missing";
const PROFILE_PHOTO_CACHE_TTL = 30 * 60 * 1000; // 30 minutos

type ProfilePhotoCache = {
  photoUrl: string;
  cachedAt: number;
};

function isCacheValid(cachedAt: number) {
  return Date.now() - cachedAt < PROFILE_PHOTO_CACHE_TTL;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("No fue posible convertir la foto a base64."));
    };

    reader.onerror = () => {
      reject(reader.error);
    };

    reader.readAsDataURL(blob);
  });
}

function getCachedProfilePhoto() {
  try {
    const cached = sessionStorage.getItem(PROFILE_PHOTO_CACHE_KEY);

    if (!cached) return null;

    const parsed = JSON.parse(cached) as ProfilePhotoCache;

    if (!parsed.photoUrl || !isCacheValid(parsed.cachedAt)) {
      sessionStorage.removeItem(PROFILE_PHOTO_CACHE_KEY);
      return null;
    }

    return parsed.photoUrl;
  } catch {
    sessionStorage.removeItem(PROFILE_PHOTO_CACHE_KEY);
    return null;
  }
}

function setCachedProfilePhoto(photoUrl: string) {
  const payload: ProfilePhotoCache = {
    photoUrl,
    cachedAt: Date.now(),
  };

  sessionStorage.setItem(PROFILE_PHOTO_CACHE_KEY, JSON.stringify(payload));
  sessionStorage.removeItem(PROFILE_PHOTO_MISSING_CACHE_KEY);
}

function hasValidMissingPhotoCache() {
  try {
    const cached = sessionStorage.getItem(PROFILE_PHOTO_MISSING_CACHE_KEY);

    if (!cached) return false;

    const cachedAt = Number(cached);

    if (!cachedAt || !isCacheValid(cachedAt)) {
      sessionStorage.removeItem(PROFILE_PHOTO_MISSING_CACHE_KEY);
      return false;
    }

    return true;
  } catch {
    sessionStorage.removeItem(PROFILE_PHOTO_MISSING_CACHE_KEY);
    return false;
  }
}

function setMissingPhotoCache() {
  sessionStorage.setItem(PROFILE_PHOTO_MISSING_CACHE_KEY, String(Date.now()));
  sessionStorage.removeItem(PROFILE_PHOTO_CACHE_KEY);
}

export function useMicrosoftProfilePhoto() {
  const { instance, accounts } = useMsal();

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cachedPhoto = getCachedProfilePhoto();

    if (cachedPhoto) {
      setPhotoUrl(cachedPhoto);
    }
  }, []);

  const loadProfilePhoto = useCallback(async () => {
    const cachedPhoto = getCachedProfilePhoto();

    if (cachedPhoto) {
      setPhotoUrl(cachedPhoto);
      setError(null);
      return;
    }

    if (hasValidMissingPhotoCache()) {
      setPhotoUrl(null);
      setError("El usuario autenticado no tiene foto de perfil configurada.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const account = instance.getActiveAccount() ?? accounts[0];

      if (!account) {
        throw new Error("No hay una cuenta activa en MSAL.");
      }

      let tokenResponse;

      try {
        tokenResponse = await instance.acquireTokenSilent({
          account,
          scopes: GRAPH_PROFILE_SCOPES,
        });
      } catch (err) {
        if (err instanceof InteractionRequiredAuthError) {
          tokenResponse = await instance.acquireTokenPopup({
            account,
            scopes: GRAPH_PROFILE_SCOPES,
          });
        } else {
          throw err;
        }
      }

      const response = await fetch(GRAPH_PROFILE_PHOTO_URL, {
        headers: {
          Authorization: `Bearer ${tokenResponse.accessToken}`,
        },
      });

      if (response.status === 404) {
        setMissingPhotoCache();
        setPhotoUrl(null);
        setError("El usuario autenticado no tiene foto de perfil configurada.");
        return;
      }

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail);
      }

      const blob = await response.blob();
      const dataUrl = await blobToDataUrl(blob);

      setCachedProfilePhoto(dataUrl);
      setPhotoUrl(dataUrl);

      console.log("Foto de perfil cargada correctamente.");
    } catch (err) {
      console.error("Error consultando foto de perfil:", err);

      setError(
        err instanceof Error
          ? err.message
          : "No fue posible consultar la foto de perfil."
      );
    } finally {
      setIsLoading(false);
    }
  }, [accounts, instance]);

  return {
    photoUrl,
    isLoading,
    error,
    loadProfilePhoto,
  };
}