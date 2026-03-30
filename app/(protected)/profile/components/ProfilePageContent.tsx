// components/perfil/ProfilePageClient.tsx
// Único Client Component orquestador — mantiene el estado del perfil completo
'use client';

import { useState } from 'react';
import { ProfileHeader }     from './ProfileHeader';
import { PersonalInfoCard, RegionalPrefsCard, PasswordCard } from './ProfileCards';
import { TwoFACard, SessionsCard, CorporateInfoCard }        from './SecurityCards';
import type { ProfileData }  from '@/types/profile';

interface Props {
  initialProfile: ProfileData;
}

export function ProfilePageClient({ initialProfile }: Props) {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);

  const updateField = (field: keyof ProfileData, value: string) => {
    setProfile((p) => ({ ...p, [field]: value }));
    // TODO: PATCH /api/perfil con { [field]: value }
  };

  return (
    <div className="min-h-screen bg-slate-50/70">
      <ProfileHeader profile={profile} />

      <div className="mx-auto max-w-5xl px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Columna izquierda — 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          <PersonalInfoCard profile={profile} onUpdate={updateField} />
          <RegionalPrefsCard profile={profile} onUpdate={updateField} />
          <PasswordCard />
        </div>

        {/* Columna derecha — 1/3 */}
        <div className="space-y-6">
          <TwoFACard />
          <SessionsCard />
          <CorporateInfoCard profile={profile} />
        </div>
      </div>
    </div>
  );
}