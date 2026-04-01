// app/configuracion/page.tsx
// Server Component — layout estático, delega interactividad a ConfigShell

import type { Metadata } from 'next';
import { Settings }      from 'lucide-react';
import { ConfigShell }   from './components/SettingsShell';

export const metadata: Metadata = {
  title: 'Configuración — Intranet EDM',
};

export default function ConfiguracionPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>

      {/* Header estático */}
      <div
        className="relative overflow-hidden border-b"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor:     'var(--border)',
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ background: 'radial-gradient(ellipse 70% 80% at 70% -20%, hsl(258,70%,55%), transparent)' }}
        />
        <div className="mx-auto max-w-5xl px-6 py-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl
                            bg-violet-600 shadow-md shadow-violet-200 dark:shadow-violet-900/30">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Configuración
              </h1>
              <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                Personaliza tu experiencia en la intranet
              </p>
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