/**
 * @module PerfilPage
 * Página principal del perfil de usuario dentro de la intranet.
 *
 * @remarks
 * Este archivo define la ruta de perfil y actúa como capa de preparación
 * de datos antes de delegar la renderización al componente cliente
 * {@link ProfilePageClient}.
 *
 * Soporta dos flujos de carga:
 *
 * - **modo desarrollo**: utiliza datos simulados desde {@link DEV_SESSION}
 * - **modo producción**: obtiene datos autenticados desde {@link auth}
 *
 * Su responsabilidad principal es construir un objeto {@link ProfileData}
 * consistente para el cliente, independientemente de la fuente de datos.
 */

// app/(protected)/perfil/page.tsx

import type { Metadata } from "next";
import { auth } from "@/auth";
import { ProfilePageClient } from "./components/ProfilePageContent";
import { DEV_SESSION } from "@/lib/devSession";
import type { ProfileData } from "@/types/profile";

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Metadata de la página de perfil.
 *
 * @remarks
 * Define el título mostrado en el navegador para la sección de perfil.
 */
export const metadata: Metadata = {
  title: "Mi perfil — Intranet",
};

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Página de perfil del usuario.
 *
 * @returns Componente cliente de perfil con datos iniciales preparados.
 *
 * @remarks
 * Flujo general:
 *
 * 1. Verifica si la aplicación está en modo bypass de autenticación
 * 2. Si está en modo desarrollo:
 *    - construye el perfil usando {@link DEV_SESSION}
 * 3. Si está en modo producción:
 *    - obtiene la sesión autenticada mediante {@link auth}
 *    - construye el perfil a partir de los datos del usuario
 * 4. Renderiza {@link ProfilePageClient} con `initialProfile`
 *
 * Este patrón permite:
 *
 * - desacoplar la fuente de datos del componente cliente
 * - facilitar pruebas locales sin autenticación real
 * - mantener una estructura uniforme de `ProfileData`
 *
 * @example
 * ```tsx
 * <PerfilPage />
 * ```
 */
export default async function PerfilPage() {
  /* ------------------------------------------------------------------------ */
  /* Modo desarrollo                                                           */
  /* ------------------------------------------------------------------------ */

  /**
   * En modo bypass, el perfil se construye a partir de la sesión simulada.
   */
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") {
    const user = DEV_SESSION.user;

    const profile: ProfileData = {
      id: user.id,
      name: user.name,
      image: user.image ?? null,
      role: user.role,
      email: user.email,
      department: user.department,
      timezone: "",
      language: "",
      ...(user.location !== undefined && { location: user.location }),
      ...(user.employeeId !== undefined && { employeeId: user.employeeId }),
      ...(user.joined !== undefined && { joined: user.joined }),
      ...(user.phone !== undefined && { phone: user.phone }),
    };

    return <ProfilePageClient initialProfile={profile} />;
  }

  /* ------------------------------------------------------------------------ */
  /* Modo producción                                                           */
  /* ------------------------------------------------------------------------ */

  /**
   * Sesión autenticada obtenida desde el proveedor de auth.
   */
  const session = await auth();

  /**
   * Perfil base construido a partir de la sesión del usuario.
   *
   * @remarks
   * Se inicializan valores vacíos o por defecto cuando la sesión
   * no contiene alguno de los campos esperados.
   */
  const profile: ProfileData = {
    id: session?.user?.id ?? "",
    name: session?.user?.name ?? "Usuario",
    image: session?.user?.image ?? null,
    role: session?.user?.role ?? "",
    email: session?.user?.email ?? "",
    department: session?.user?.department ?? "",
    timezone: "",
    language: "",
  };

  /**
   * Campos opcionales adicionales provenientes de la sesión.
   */
  const employeeId = session?.user?.employeeId || undefined;
  const joined = session?.user?.joined || undefined;
  const phone = session?.user?.phone || undefined;
  const location = session?.user?.location || undefined;

  /**
   * Enriquecimiento condicional del perfil con campos opcionales.
   */
  if (employeeId) profile.employeeId = employeeId;
  if (joined) profile.joined = joined;
  if (phone) profile.phone = phone;
  if (location) profile.location = location;

  return <ProfilePageClient initialProfile={profile} />;
}