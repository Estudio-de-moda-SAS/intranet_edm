/**
 * @module ProfilePageClient
 * Componente cliente principal de la pagina de perfil.
 *
 * @remarks
 * Orquesta el modulo de perfil en el cliente combinando tres fuentes
 * de datos:
 *
 * 1. **Microsoft Graph** via {@link useGraphProfile} — nombre, email, cargo,
 *    departamento, telefono, ubicacion, foto, ID empleado, fecha de ingreso.
 *    Estos campos son de solo lectura — gestionados por Entra ID / RRHH.
 *
 * 2. **localStorage** — timezone e idioma. Son preferencias locales del
 *    colaborador que no existen en Graph con `User.Read`. Se persisten
 *    en `edm_profile_prefs` para sobrevivir recargas.
 *
 * 3. **initialProfile** — perfil inicial del servidor. Completo en modo
 *    bypass (DEV_SESSION), vacio en produccion (`id: ""`). Cuando esta
 *    vacio, Graph lo enriquece via `useEffect`.
 *
 * **Campos editables:**
 * Solo `timezone` y `language` son editables desde la intranet.
 * `name`, `email`, `role`, `department`, `employeeId`, `joined` son
 * de solo lectura — provienen de Entra ID y son gestionados por RRHH.
 * `phone` y `location` se muestran desde Graph pero no se editan aqui
 * porque requieren `User.ReadWrite` que las cuentas corporativas
 * generalmente no tienen habilitado para auto-edicion.
 */

"use client";

import { useState, useEffect }  from "react";
import { ProfileHeader }        from "./ProfileHeader";
import {
  PersonalInfoCard,
  RegionalPrefsCard,
  PasswordCard,
}                               from "./ProfileCards";
import {
  TwoFACard,
  SessionsCard,
  CorporateInfoCard,
}                               from "./SecurityCards";
import { useGraphProfile }      from "@/lib/useGraphProfile";
import type { ProfileData }     from "@/types/profile";

// -- Constantes ---------------------------------------------------------------

/** Clave de localStorage para preferencias regionales del colaborador. */
const PREFS_KEY = "edm_profile_prefs";

// -- Helpers ------------------------------------------------------------------

/**
 * Lee las preferencias regionales guardadas en localStorage.
 * Retorna valores por defecto si no existen o hay un error de parseo.
 * @internal
 */
function loadPrefs(): { timezone: string; language: string } {
  if (typeof window === "undefined") return { timezone: "", language: "" };
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { timezone: "", language: "" };
    return JSON.parse(raw);
  } catch {
    return { timezone: "", language: "" };
  }
}

/**
 * Persiste las preferencias regionales en localStorage.
 * @internal
 */
function savePrefs(prefs: { timezone: string; language: string }): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

// -- Tipos --------------------------------------------------------------------

interface ProfilePageClientProps {
  /** Perfil inicial preparado en servidor. Vacio en produccion (`id: ""`). */
  initialProfile: ProfileData;
}

// -- Componente ---------------------------------------------------------------

/**
 * Pagina cliente del perfil de usuario.
 *
 * @param props - Ver {@link ProfilePageClientProps}.
 * @returns Layout completo del perfil con datos reales de Graph.
 */
export function ProfilePageClient({ initialProfile }: ProfilePageClientProps) {

  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [prefs, setPrefs]     = useState<{ timezone: string; language: string }>(
    { timezone: "", language: "" }
  );

  // Cargar preferencias desde localStorage en el cliente
  useEffect(() => {
    const saved = loadPrefs();
    setPrefs(saved);
    setProfile((prev) => ({
      ...prev,
      timezone: saved.timezone,
      language: saved.language,
    }));
  }, []);

  // Perfil desde Graph — activo en produccion cuando initialProfile.id === ""
  const { data: graphData, isLoading } = useGraphProfile();

  // Enriquecer perfil con datos reales de Graph en produccion
  useEffect(() => {
    if (initialProfile.id) return;
    if (!graphData?.user)  return;

    const u     = graphData.user;
    const saved = loadPrefs();

    setProfile({
      id:         u.id,
      name:       u.name,
      image:      u.image ?? null,
      role:       u.role,
      email:      u.email,
      department: u.department,
      timezone:   saved.timezone,
      language:   saved.language,
      ...(u.location   && { location:   u.location   }),
      ...(u.employeeId && { employeeId: u.employeeId }),
      ...(u.joined     && { joined:     u.joined     }),
      ...(u.phone      && { phone:      u.phone      }),
    });
  }, [initialProfile.id, graphData]);

  /**
   * Actualiza un campo del perfil.
   *
   * Solo `timezone` y `language` se persisten en localStorage.
   * El resto se actualiza solo en estado local — son datos de Graph
   * de solo lectura desde la intranet.
   */
  const updateField = (field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));

    if (field === "timezone" || field === "language") {
      const updated = { ...prefs, [field]: value };
      setPrefs(updated);
      savePrefs(updated);
    }

    // TODO: cuando GRAPH_READY=true y User.ReadWrite este habilitado,
    // enviar PATCH /api/profile con { [field]: value } para phone y location.
  };

  // Skeleton mientras Graph resuelve el perfil en produccion
  if (!initialProfile.id && isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/70 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-400">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70">
      <ProfileHeader profile={profile} />

      <div className="mx-auto max-w-5xl px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Columna izquierda */}
        <div className="lg:col-span-2 space-y-6">
          <PersonalInfoCard profile={profile} onUpdate={updateField} />
          <RegionalPrefsCard profile={profile} onUpdate={updateField} />
          <PasswordCard />
        </div>

        {/* Columna derecha */}
        <div className="space-y-6">
          <TwoFACard />
          <SessionsCard />
          <CorporateInfoCard profile={profile} />
        </div>
      </div>
    </div>
  );
}