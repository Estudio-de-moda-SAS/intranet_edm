// app/(protected)/perfil/page.tsx
import type { Metadata }     from 'next';
import { auth }              from '@/auth';
import { ProfilePageClient } from './components/ProfilePageContent';
import { DEV_SESSION }       from '@/lib/devSession';
import type { ProfileData }  from '@/types/profile';

export const metadata: Metadata = { title: 'Mi perfil — Intranet' };

export default async function PerfilPage() {

  // ── Dev mode: datos desde DEV_SESSION ────────────────────────
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true') {
    const u = DEV_SESSION.user;
    const profile: ProfileData = {
      id:         u.id,
      name:       u.name,
      image:      u.image ?? null,
      role:       u.role,
      email:      u.email,
      department: u.department,
      timezone:   '',
      language:   '',
      ...(u.location   !== undefined && { location:   u.location }),
      ...(u.employeeId !== undefined && { employeeId: u.employeeId }),
      ...(u.joined     !== undefined && { joined:     u.joined }),
      ...(u.phone      !== undefined && { phone:      u.phone }),
    };
    return <ProfilePageClient initialProfile={profile} />;
  }

  // ── Producción: datos desde Entra ID + Graph API ──────────────
  const session = await auth();
  const profile: ProfileData = {
    id:         session?.user?.id         ?? '',
    name:       session?.user?.name       ?? 'Usuario',
    image:      session?.user?.image      ?? null,
    role:       session?.user?.role       ?? '',
    email:      session?.user?.email      ?? '',
    department: session?.user?.department ?? '',
    timezone:   '',
    language:   '',
  };

  const employeeId = session?.user?.employeeId || undefined;
  const joined     = session?.user?.joined     || undefined;
  const phone      = session?.user?.phone      || undefined;
  const location   = session?.user?.location   || undefined;

  if (employeeId) profile.employeeId = employeeId;
  if (joined)     profile.joined     = joined;
  if (phone)      profile.phone      = phone;
  if (location)   profile.location   = location;

  return <ProfilePageClient initialProfile={profile} />;
}