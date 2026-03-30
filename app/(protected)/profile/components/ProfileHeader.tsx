// components/perfil/ProfileHeader.tsx
'use client';

import { Building2, Calendar, MapPin } from 'lucide-react';
import { getInitials, nameToHue } from '@/lib/avatar';
import type { ProfileData } from '@/types/profile';

interface Props {
  profile: ProfileData;
}

export function ProfileHeader({ profile }: Props) {
  const hue = nameToHue(profile.name ?? '');

  return (
    <div className="relative overflow-hidden bg-white border-b border-slate-200">
      {/* Decorative radial */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ background: `radial-gradient(ellipse 80% 60% at 60% -10%, hsl(${hue},70%,55%), transparent)` }}
      />

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end">

          {/* Avatar */}
          <div className="relative shrink-0">
            {profile.image ? (
              <img
                src={profile.image}
                alt={profile.name ?? ''}
                className="h-24 w-24 rounded-2xl object-cover shadow-lg"
              />
            ) : (
              <div
                className="h-24 w-24 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg"
                style={{ background: `linear-gradient(135deg, hsl(${hue},70%,55%), hsl(${hue + 20},65%,45%))` }}
              >
                {getInitials(profile.name ?? '')}
              </div>
            )}
          </div>

          {/* Name & meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
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
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Desde {profile.joined}
              </span>
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