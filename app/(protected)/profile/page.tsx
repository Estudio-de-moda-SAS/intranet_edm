/**
 * @module PerfilPage
 * Página principal del perfil de usuario dentro de la intranet.
 *
 * @remarks
 * This file defines the profile route and acts as a data preparation
 * layer before delegating rendering to the client component
 * {@link ProfilePageClient}.
 *
 * Supports two loading flows:
 *
 * - **bypass mode**: uses simulated data from {@link DEV_SESSION}
 * - **production mode**: passes an empty profile — {@link ProfilePageClient}
 *   enriches it from {@link useGraphProfile} once MSAL resolves the account
 *
 * Its main responsibility is to build a consistent {@link ProfileData}
 * object for the client, regardless of the data source.
 */

// app/(protected)/profile/page.tsx

import type { Metadata }         from "next";
import { ProfilePageClient }     from "./components/ProfilePageContent";
import { DEV_SESSION }           from "@/lib/devSession";
import type { ProfileData }      from "@/types/profile";

/* -------------------------------------------------------------------------- */
/* Metadata                                                                    */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: "Mi perfil — Intranet",
};

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Profile page entry point.
 *
 * @remarks
 * **Bypass mode** (`NEXT_PUBLIC_AUTH_BYPASS === "true"`):
 * Builds the profile from {@link DEV_SESSION} and passes it as
 * `initialProfile` to {@link ProfilePageClient}. The client renders
 * immediately without any Graph calls.
 *
 * **Production mode:**
 * Passes an empty profile as `initialProfile`. {@link ProfilePageClient}
 * detects the empty `id` and uses {@link useGraphProfile} to fetch the
 * real profile from Microsoft Graph, showing a skeleton while loading.
 *
 * This pattern ensures:
 * - No unnecessary cookies with profile data
 * - No duplication between server and client
 * - Profile always fresh from Graph (cached 15 min by TanStack Query)
 * - Smooth development experience with bypass
 *
 * @returns {@link ProfilePageClient} with the initial profile for the active mode.
 */
export default async function PerfilPage() {

  /* ------------------------------------------------------------------------ */
  /* Bypass mode                                                               */
  /* ------------------------------------------------------------------------ */

  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") {
    const user = DEV_SESSION.user;

    const profile: ProfileData = {
      id:         user.id,
      name:       user.name,
      image:      user.image ?? null,
      role:       user.role,
      email:      user.email,
      department: user.department,
      timezone:   "",
      language:   "",
      ...(user.location   && { location:   user.location   }),
      ...(user.employeeId && { employeeId: user.employeeId }),
      ...(user.joined     && { joined:     user.joined     }),
      ...(user.phone      && { phone:      user.phone      }),
    };

    return <ProfilePageClient initialProfile={profile} />;
  }

  /* ------------------------------------------------------------------------ */
  /* Production mode                                                           */
  /* ------------------------------------------------------------------------ */

  /**
   * Empty profile — {@link ProfilePageClient} enriches it from
   * {@link useGraphProfile} on the client once MSAL has an active
   * account and Graph responds.
   *
   * `id: ""` signals the client that it must fetch the profile
   * from Graph instead of using this object.
   */
  const emptyProfile: ProfileData = {
    id:         "",
    name:       "",
    image:      null,
    role:       "",
    email:      "",
    department: "",
    timezone:   "",
    language:   "",
  };

  return <ProfilePageClient initialProfile={emptyProfile} />;
}