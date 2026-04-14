/**
 * @module ProfilePageClient
 * Componente cliente principal de la página de perfil.
 *
 * @remarks
 * Este componente actúa como el orquestador del módulo de perfil
 * en el cliente, recibiendo un perfil inicial desde servidor y
 * administrando el estado editable del usuario.
 *
 * Su responsabilidad principal es:
 *
 * - mantener el estado completo del perfil en cliente
 * - distribuir la información en distintas tarjetas funcionales
 * - centralizar la actualización de campos editables
 *
 * Estructura general:
 *
 * - encabezado del perfil
 * - columna izquierda: información personal, preferencias y contraseña
 * - columna derecha: seguridad, sesiones e información corporativa
 *
 * Es el único componente cliente de alto nivel del módulo,
 * mientras que la página de ruta prepara los datos en servidor.
 */

// components/perfil/ProfilePageClient.tsx
// Único Client Component orquestador — mantiene el estado del perfil completo

"use client";

import { useState } from "react";
import { ProfileHeader } from "./ProfileHeader";
import {
  PersonalInfoCard,
  RegionalPrefsCard,
  PasswordCard,
} from "./ProfileCards";
import {
  TwoFACard,
  SessionsCard,
  CorporateInfoCard,
} from "./SecurityCards";
import type { ProfileData } from "@/types/profile";

/* -------------------------------------------------------------------------- */
/* Tipos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Props del componente {@link ProfilePageClient}.
 *
 * @property initialProfile Perfil inicial preparado en servidor.
 */
interface ProfilePageClientProps {
  initialProfile: ProfileData;
}

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Página cliente del perfil de usuario.
 *
 * @param props Propiedades del componente.
 * @returns Layout completo del perfil con estado editable local.
 *
 * @remarks
 * Este componente:
 *
 * - inicializa el estado local a partir de `initialProfile`
 * - centraliza la actualización de campos del perfil
 * - distribuye el contenido en un layout de dos columnas
 *
 * Flujo de datos:
 *
 * 1. El servidor prepara `initialProfile`
 * 2. El cliente inicializa el estado con ese valor
 * 3. Las tarjetas hijas consumen y actualizan dicho estado
 * 4. En el futuro, las ediciones podrán persistirse mediante API
 *
 * @example
 * ```tsx
 * <ProfilePageClient initialProfile={profile} />
 * ```
 */
export function ProfilePageClient({
  initialProfile,
}: ProfilePageClientProps) {
  /**
   * Estado local completo del perfil del usuario.
   */
  const [profile, setProfile] = useState<ProfileData>(initialProfile);

  /**
   * Actualiza un campo específico del perfil.
   *
   * @param field Campo del perfil a modificar.
   * @param value Nuevo valor del campo.
   *
   * @remarks
   * Actualmente la actualización se refleja únicamente en el estado local.
   *
   * En una futura integración, esta función debería:
   *
   * - persistir cambios mediante `PATCH /api/perfil`
   * - manejar errores de red
   * - mostrar feedback de guardado
   */
  const updateField = (field: keyof ProfileData, value: string) => {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));

    // TODO: PATCH /api/perfil con { [field]: value }
  };

  return (
    <div className="min-h-screen bg-slate-50/70">
      {/* Header del perfil */}
      <ProfileHeader profile={profile} />

      {/* Layout principal */}
      <div className="mx-auto max-w-5xl px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ---------------------------------------------------------- */}
        {/* Columna izquierda                                          */}
        {/* ---------------------------------------------------------- */}
        <div className="lg:col-span-2 space-y-6">
          <PersonalInfoCard profile={profile} onUpdate={updateField} />
          <RegionalPrefsCard profile={profile} onUpdate={updateField} />
          <PasswordCard />
        </div>

        {/* ---------------------------------------------------------- */}
        {/* Columna derecha                                            */}
        {/* ---------------------------------------------------------- */}
        <div className="space-y-6">
          <TwoFACard />
          <SessionsCard />
          <CorporateInfoCard profile={profile} />
        </div>
      </div>
    </div>
  );
}