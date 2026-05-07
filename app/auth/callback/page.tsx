"use client";

import { useEffect, useRef } from "react";
import { useSearchParams }   from "next/navigation";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import {
  initMSAL,
  getAccessToken,
} from "@/app/api/auth/msal";
import {
  getMicrosoftGraphProfile,
  getMicrosoftGraphGroups,
  resolveAccessLevelFromGroups,
} from "@/lib/microsoft-graph";

const COOKIE_MAX_AGE = 60 * 60 * 24;

function writeSessionCookies(accessLevel: string, email: string): void {
  const base = `path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  document.cookie = `edm_authed=1; ${base}`;
  document.cookie = `edm_access_level=${accessLevel}; ${base}`;
  document.cookie = `edm_user_email=${email}; ${base}`;
}

export default function AuthCallbackPage() {
  const { accounts, inProgress } = useMsal();
  const isAuthenticated          = useIsAuthenticated();
  const searchParams             = useSearchParams();
  const handledRef               = useRef(false);

  useEffect(() => {
    if (inProgress !== InteractionStatus.None) return;
    if (!isAuthenticated) {
      // Si MSAL terminó pero no hay sesión, algo falló → volver al login
      window.location.href = "/login";
      return;
    }
    if (handledRef.current) return;
    handledRef.current = true;

    const raw         = searchParams.get("callbackUrl") ?? "/";
    const callbackUrl = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";

    // Si las cookies ya existen (recarga), redirigir directo
    if (document.cookie.includes("edm_authed=1")) {
      window.location.href = callbackUrl;
      return;
    }

    (async () => {
      try {
        await initMSAL();

        const accessToken = await getAccessToken({ interactionMode: "redirect" });

        const [profile, groups] = await Promise.all([
          getMicrosoftGraphProfile(accessToken),
          getMicrosoftGraphGroups(accessToken),
        ]);

        const accessLevel = resolveAccessLevelFromGroups(
          groups,
          profile?.department ?? null,
          profile?.jobTitle   ?? null,
        );

        writeSessionCookies(accessLevel, accounts[0]?.username ?? "");

        // Esperar confirmación de cookie
        let retries = 0;
        while (!document.cookie.includes("edm_authed=1") && retries < 10) {
          await new Promise((r) => setTimeout(r, 50));
          retries++;
        }

        window.location.href = callbackUrl;
      } catch (err) {
        console.error("[AuthCallback] Error:", err);
        window.location.href = "/login";
      }
    })();
  }, [inProgress, isAuthenticated, accounts, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <svg className="h-8 w-8 animate-spin text-violet-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-[13px] font-medium text-slate-500">Verificando sesión...</p>
      </div>
    </div>
  );
}