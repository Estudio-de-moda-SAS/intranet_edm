/**
 * @module ProfileHeader
 * Encabezado principal del perfil de usuario.
 *
 * @remarks
 * Este componente presenta la identidad visual principal del usuario
 * dentro del módulo de perfil, incluyendo:
 *
 * - avatar corporativo obtenido desde Microsoft Graph
 * - fallback por imagen local o iniciales
 * - nombre completo
 * - estado visual de actividad
 * - cargo y departamento
 * - metadatos corporativos básicos
 *
 * También aplica una decoración visual dinámica basada en el nombre
 * del usuario mediante {@link nameToHue}, lo que permite generar
 * una identidad cromática consistente incluso cuando no existe foto.
 */

// components/perfil/ProfileHeader.tsx
"use client";

import { useEffect } from "react";
import { Building2, Calendar, MapPin } from "lucide-react";
import { getInitials, nameToHue } from "@/lib/avatar";
import type { ProfileData } from "@/types/profile";
import { useMicrosoftProfilePhoto } from "@/app/hooks/useMicrosoftProfilePhoto";

/* -------------------------------------------------------------------------- */
/* Tipos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Props del componente {@link ProfileHeader}.
 *
 * @property profile Información del perfil a mostrar en la cabecera.
 */
interface ProfileHeaderProps {
  profile: ProfileData;
}

/* -------------------------------------------------------------------------- */
/* Configuración                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Controla la visibilidad de la fecha de ingreso.
 *
 * @remarks
 * Se mantiene deshabilitada mientras no exista una fuente confiable
 * para este dato dentro del perfil corporativo.
 */
const SHOW_JOINED_DATE = false;

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Encabezado visual del perfil.
 *
 * @param props Propiedades del componente.
 * @returns Cabecera del perfil con avatar, nombre y metadatos.
 *
 * @remarks
 * Este componente:
 *
 * - calcula un tono base a partir del nombre del usuario
 * - intenta cargar la foto corporativa desde Microsoft Graph
 * - usa `profile.image` como segundo fallback si existe
 * - usa iniciales como fallback final si no hay foto disponible
 * - muestra información resumida del usuario en una vista destacada
 *
 * Flujo visual:
 *
 * 1. Se calcula un color único con {@link nameToHue}
 * 2. Se consulta la foto corporativa mediante Microsoft Graph
 * 3. Se renderiza la foto Graph, imagen local o avatar con iniciales
 * 4. Se presentan nombre, rol, departamento y metadatos
 *
 * @example
 * ```tsx
 * <ProfileHeader profile={profile} />
 * ```
 */
export function ProfileHeader({ profile }: ProfileHeaderProps) {
  /**
   * Tono base generado a partir del nombre del usuario.
   *
   * @remarks
   * Se utiliza para:
   *
   * - el fondo decorativo radial
   * - el gradiente del avatar fallback
   */
  const hue = nameToHue(profile.name ?? "");

  /**
   * Foto corporativa consultada desde Microsoft Graph.
   *
   * @remarks
   * Si Graph no devuelve una foto, el componente conserva el fallback
   * actual basado en `profile.image` o iniciales.
   */
  const { photoUrl, loadProfilePhoto } = useMicrosoftProfilePhoto();

  /**
   * Carga la foto corporativa al montar el encabezado.
   *
   * @remarks
   * La llamada es segura: si el usuario no tiene foto configurada,
   * el hook devuelve `null` y se mantiene el fallback visual.
   */
  useEffect(() => {
    loadProfilePhoto();
  }, [loadProfilePhoto]);

  /**
   * URL final del avatar a renderizar.
   *
   * @remarks
   * Prioridad:
   * 1. Foto obtenida desde Microsoft Graph.
   * 2. Imagen incluida en los datos del perfil.
   * 3. Avatar generado con iniciales.
   */
  const resolvedAvatarUrl = photoUrl ?? profile.image;

  return (
    <div className="relative overflow-hidden bg-white border-b border-slate-200">
      {/* Fondo decorativo radial */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 60% -10%, hsl(${hue},70%,55%), transparent)`,
        }}
      />

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end">

          {/* -------------------------------------------------------- */}
          {/* Avatar                                                   */}
          {/* -------------------------------------------------------- */}
          <div className="relative shrink-0">
            {resolvedAvatarUrl ? (
              <img
                src={resolvedAvatarUrl}
                alt={profile.name ?? ""}
                className="h-24 w-24 rounded-2xl object-cover shadow-lg"
              />
            ) : (
              <div
                className="h-24 w-24 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg"
                style={{
                  background: `linear-gradient(135deg, hsl(${hue},70%,55%), hsl(${hue + 20},65%,45%))`,
                }}
              >
                {getInitials(profile.name ?? "")}
              </div>
            )}
          </div>

          {/* -------------------------------------------------------- */}
          {/* Nombre y metadata                                        */}
          {/* -------------------------------------------------------- */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">
                {profile.name}
              </h1>

              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-px text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Activo
              </span>
            </div>

            <p className="mt-1 text-[13px] text-slate-500">
              {profile.role} · {profile.department}
            </p>

            <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {profile.employeeId}
              </span>

              {SHOW_JOINED_DATE && profile.joined && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Desde {profile.joined}
                </span>
              )}

              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {profile.location}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}