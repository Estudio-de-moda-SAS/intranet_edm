// components/perfil/SecurityCards.tsx
'use client';

import { useState } from 'react';
import {
  Monitor, Smartphone, LogOut,
  ChevronRight, Building2,
} from 'lucide-react';
import { SectionCard, SectionHeader } from '@/app/components/ui/IntranetUI';
import type { ProfileData, SessionEntry }     from '@/types/profile';

// ─── 2FA ─────────────────────────────────────────────────────────

export function TwoFACard() {
  const handleRedirect = () => {
    window.open('https://mysignins.microsoft.com/security-info', '_blank', 'noopener,noreferrer');
  };

  return (
    <SectionCard>
      <SectionHeader
        icon={ShieldIcon}
        title="Autenticación 2FA"
        subtitle="Verificación en dos pasos gestionada por Microsoft"
      />
      <div className="px-5 py-4 space-y-4">

        {/* Info banner */}
        <div className="flex gap-3 rounded-xl border border-violet-100 bg-violet-50/60 px-3.5 py-3">
          <div className="mt-0.5 shrink-0 text-violet-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </div>
          <p className="text-[12px] leading-relaxed text-violet-700">
            La verificación en dos pasos está gestionada por{' '}
            <span className="font-semibold">Microsoft 365</span>. Puedes activarla,
            desactivarla y administrar tus métodos desde el portal oficial.
          </p>
        </div>

        {/* Steps */}
        <ol className="space-y-2">
          {[
            'Haz clic en el botón para abrir el portal de seguridad de Microsoft.',
            'Inicia sesión con tu cuenta corporativa.',
            'En "Información de seguridad" gestiona tus métodos de verificación.',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[9px] font-bold text-violet-600">
                {i + 1}
              </span>
              <span className="text-[12px] text-slate-500">{step}</span>
            </li>
          ))}
        </ol>

        {/* CTA */}
        <button
          onClick={handleRedirect}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-violet-200 transition-all hover:bg-violet-700 active:scale-[0.98]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Gestionar verificación en dos pasos
        </button>

        <p className="text-center text-[10px] text-slate-400">
          Abre{' '}
          <span className="font-medium text-slate-500">mysignins.microsoft.com/security-info</span>{' '}
          en una nueva pestaña
        </p>

      </div>
    </SectionCard>
  );
}
// ─── Sessions ─────────────────────────────────────────────────────

export function SessionsCard() {
  const [sessions, setSessions] = useState<SessionEntry[]>([]);

  const revoke = (id: string) =>
    setSessions((prev) => prev.filter((x) => x.id !== id));

  return (
    <SectionCard>
      <SectionHeader
        icon={Monitor}
        title="Sesiones activas"
        subtitle={`${sessions.length} dispositivo${sessions.length !== 1 ? 's' : ''}`}
      />

      <div className="px-4 py-3 space-y-1">
        {sessions.length === 0 ? (
          <p className="py-4 text-center text-[12px] text-slate-400">
            No hay sesiones activas registradas
          </p>
        ) : (
          sessions.map((s) => (
            <div
              key={s.id}
              className="group flex items-start gap-3 rounded-xl px-2 py-2.5 hover:bg-slate-50 transition-colors"
            >
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                {s.icon === 'mobile'
                  ? <Smartphone className="h-3.5 w-3.5 text-slate-500" />
                  : <Monitor    className="h-3.5 w-3.5 text-slate-500" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-[12px] font-medium text-slate-700 truncate">{s.device}</p>
                  {s.current && (
                    <span className="shrink-0 rounded-full bg-violet-50 border border-violet-100 px-1.5 py-px text-[9px] font-bold text-violet-600">
                      ACTUAL
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">{s.location} · {s.lastSeen}</p>
              </div>

              {!s.current && (
                <button
                  onClick={() => revoke(s.id)}
                  title="Revocar sesión"
                  className="opacity-0 group-hover:opacity-100 mt-0.5 shrink-0 rounded-md p-1 text-rose-400 hover:bg-rose-50 transition-all"
                >
                  <LogOut className="h-3 w-3" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="border-t border-slate-100 px-5 py-3">
        <button className="flex items-center gap-1 text-[12px] font-medium text-rose-500 hover:text-rose-700 transition-colors">
          <LogOut className="h-3.5 w-3.5" />
          Cerrar todas las demás sesiones
        </button>
      </div>
    </SectionCard>
  );
}

// ─── Corporate Info ───────────────────────────────────────────────

interface CorporateInfoCardProps {
  profile: Pick<ProfileData, 'department' | 'role' | 'employeeId' | 'joined'>;
}

export function CorporateInfoCard({ profile }: CorporateInfoCardProps) {
  const ROWS = [
    { label: 'Departamento',  value: profile.department  },
    { label: 'Cargo',         value: profile.role        },
    { label: 'ID empleado',   value: profile.employeeId  },
    { label: 'Fecha ingreso', value: profile.joined      },
  ];

  return (
    <SectionCard>
      <SectionHeader
        icon={Building2}
        title="Información corporativa"
        subtitle="Gestionado por Recursos Humanos"
      />
      <div className="px-5 py-4 space-y-3">
        {ROWS.map(({ label, value }) => (
          <div key={label}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-0.5 text-[13px] text-slate-700">{value ?? '—'}</p>
          </div>
        ))}
        <div className="pt-1">
          <a
            href="/rrhh/solicitudes"
            className="flex items-center gap-1 text-[12px] font-medium text-violet-600 hover:underline"
          >
            Solicitar cambio de información
            <ChevronRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </SectionCard>
  );
}

// ─── Icon helpers ─────────────────────────────────────────────────

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}