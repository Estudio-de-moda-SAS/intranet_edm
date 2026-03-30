// lib/useAppSession.ts
// ─────────────────────────────────────────────────────────────────────────────
// Hook unificado de sesión.
// Funciona con el bypass de desarrollo Y con NextAuth + Entra ID en producción.
//
// Uso:
//   const { user, level, can, isLoading } = useAppSession();
//   if (can('finance:view_dashboard')) { ... }
// ─────────────────────────────────────────────────────────────────────────────

'use client';

import { useSession }                           from 'next-auth/react';
import { DEV_SESSION }                          from './devSession';
import { can as canFn, resolveAccessLevel }     from './roles';
import type { AccessLevel, AppUser, Permission } from './roles';

const isBypass = process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true';

// ── Tipo de retorno ───────────────────────────────────────────────────────────

export interface AppSession {
  /** Usuario resuelto (nunca null si isLoading=false en bypass) */
  user:      AppUser | null;
  /** Nivel de acceso resuelto */
  level:     AccessLevel;
  /** Atajo para verificar permisos: can('finance:view_dashboard') */
  can:       (permission: Permission) => boolean;
  /** true mientras NextAuth carga (siempre false en bypass) */
  isLoading: boolean;
  /** true si hay sesión activa */
  isAuthed:  boolean;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAppSession(): AppSession {

  // En bypass: siempre retornamos DEV_SESSION, sin llamar a NextAuth
  if (isBypass) {
    const user  = DEV_SESSION.user as AppUser;
    const level = user.accessLevel;
    return {
      user,
      level,
      can:       (permission) => canFn(level, permission),
      isLoading: false,
      isAuthed:  true,
    };
  }

  // En producción: NextAuth con Entra ID
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  if (!session?.user) {
    return {
      user:      null,
      level:     'employee',
      can:       () => false,
      isLoading,
      isAuthed:  false,
    };
  }

  // Mapear usuario de NextAuth → AppUser
  // Entra ID devuelve los claims en session.user; ajusta los campos
  // según tu configuración de next-auth callbacks.
  const rawUser = session.user as AppUser & {
    department?: string;
    accessLevel?: AccessLevel;
  };

  const level: AccessLevel =
    rawUser.accessLevel ??
    resolveAccessLevel(rawUser.department, rawUser.role);

const user: AppUser = {
  id:          rawUser.id         ?? '',
  name:        rawUser.name       ?? '',
  email:       rawUser.email      ?? '',
  image:       rawUser.image      ?? null,  // ✅ nunca undefined
  role:        rawUser.role       ?? '',
  department:  rawUser.department ?? '',
  accessLevel: level,
  location:    (rawUser as any).location,
  employeeId:  (rawUser as any).employeeId,
  joined:      (rawUser as any).joined,
  phone:       (rawUser as any).phone,
};

  return {
    user,
    level,
    can:      (permission) => canFn(level, permission),
    isLoading,
    isAuthed: true,
  };
}
