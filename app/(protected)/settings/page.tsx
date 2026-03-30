// app/configuracion/page.tsx
// Server Component — layout estático + delega interactividad a ConfigShell

import type { Metadata } from 'next';
import { Settings }      from 'lucide-react';
import { ConfigShell }   from './components/SettingsShell';

export const metadata: Metadata = {
  title: 'Configuración — Intranet',
};

export default function ConfiguracionPage() {
  return (
    <div className="min-h-screen bg-slate-50/70">

      {/* Header estático — no necesita 'use client' */}
      <div className="relative overflow-hidden bg-white border-b border-slate-200">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ background: 'radial-gradient(ellipse 70% 80% at 70% -20%, hsl(258,70%,55%), transparent)' }}
        />
        <div className="mx-auto max-w-5xl px-6 py-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 shadow-md shadow-violet-200">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Configuración</h1>
              <p className="text-[12px] text-slate-400">Personaliza tu experiencia en la intranet</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shell interactivo */}
      <div className="mx-auto max-w-5xl px-6 py-8">
        <ConfigShell />
      </div>
    </div>
  );
}