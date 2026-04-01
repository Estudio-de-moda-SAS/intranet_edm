// app/configuracion/components/tabs/AppearanceTab.tsx
'use client';

import { Palette, Settings, Layers, Sun, Moon, Monitor, Check, Zap, ZapOff } from 'lucide-react';
import { SectionCard, SectionHeader, RowSetting, Toggle } from '@/app/components/ui/IntranetUI';
import type { AppearanceSettings } from '@/types/settings';

interface Props {
  settings: AppearanceSettings;
  onChange: (key: keyof AppearanceSettings, value: AppearanceSettings[keyof AppearanceSettings]) => void;
}

const THEMES = [
  { value: 'light'  as const, label: 'Claro',   Icon: Sun,     preview: 'bg-white border-slate-200'         },
  { value: 'dark'   as const, label: 'Oscuro',  Icon: Moon,    preview: 'bg-slate-900 border-slate-700'     },
  { value: 'system' as const, label: 'Sistema', Icon: Monitor, preview: 'bg-gradient-to-br from-white to-slate-900 border-slate-400' },
] as const;

const DENSITIES = [
  { value: 'compact'  as const, label: 'Compacto', hint: 'Más contenido visible' },
  { value: 'default'  as const, label: 'Normal',   hint: 'Equilibrado'           },
  { value: 'spacious' as const, label: 'Amplio',   hint: 'Más espacio'           },
] as const;

const ACCENTS: { hue: number; label: string }[] = [
  { hue: 258, label: 'Violeta'    },
  { hue: 220, label: 'Azul'      },
  { hue: 160, label: 'Esmeralda' },
  { hue: 25,  label: 'Naranja'   },
  { hue: 330, label: 'Rosa'      },
  { hue: 0,   label: 'Rojo'      },
];

export function AppearanceTab({ settings: s, onChange }: Props) {
  return (
    <div className="space-y-6">

      {/* ── Tema ────────────────────────────────────────────────── */}
      <SectionCard>
        <SectionHeader
          icon={Palette}
          title="Tema de la interfaz"
          subtitle="Cambia el modo al instante — sin recargar"
        />
        <div className="px-6 py-5">
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map(({ value, label, Icon, preview }) => {
              const active = s.theme === value;
              return (
                <button
                  key={value}
                  onClick={() => onChange('theme', value)}
                  aria-pressed={active}
                  className={`group flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 transition-all ${
                    active
                      ? 'border-[var(--accent-500)] bg-[var(--accent-50)] shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {/* Mini preview del tema */}
                  <div className={`h-8 w-12 rounded-md border-2 ${preview} flex items-center justify-center`}>
                    <Icon className={`h-3.5 w-3.5 ${value === 'dark' ? 'text-slate-300' : 'text-slate-500'}`} />
                  </div>
                  <span className={`text-[12px] font-medium ${active ? 'text-[var(--accent-600)]' : 'text-slate-500'}`}>
                    {label}
                  </span>
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent-500)' }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </SectionCard>

      {/* ── Color de acento ─────────────────────────────────────── */}
      <SectionCard>
        <SectionHeader
          icon={Layers}
          title="Color de acento"
          subtitle="Se aplica al instante en toda la interfaz"
        />
        <div className="px-6 py-5">
          <div className="flex gap-3 flex-wrap items-center">
            {ACCENTS.map(({ hue, label }) => {
              const active = s.accentHue === hue;
              return (
                <button
                  key={hue}
                  title={label}
                  onClick={() => onChange('accentHue', hue)}
                  aria-label={label}
                  aria-pressed={active}
                  className={`relative h-9 w-9 rounded-full transition-transform hover:scale-110 ${
                    active ? 'scale-110' : ''
                  }`}
                  style={{
                    background:  `linear-gradient(135deg, hsl(${hue},70%,55%), hsl(${hue + 20},65%,45%))`,
                    boxShadow:   active ? `0 0 0 2px white, 0 0 0 4px hsl(${hue},70%,55%)` : undefined,
                  }}
                >
                  {active && <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />}
                </button>
              );
            })}
          </div>

          {/* Live preview con el color seleccionado */}
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div
              className="h-7 w-7 rounded-lg shadow-sm"
              style={{ background: 'var(--accent-500)' }}
              aria-hidden="true"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-slate-600">Vista previa en vivo</p>
              <p className="text-[10px] text-slate-400">
                El color se aplica inmediatamente al guardar.
              </p>
            </div>
            <button
              className="rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white transition-colors"
              style={{ background: 'var(--accent-500)' }}
              onClick={(e) => e.preventDefault()}
              aria-hidden="true"
              tabIndex={-1}
            >
              Botón
            </button>
          </div>
        </div>
      </SectionCard>

      {/* ── Densidad y comportamiento ───────────────────────────── */}
      <SectionCard>
        <SectionHeader icon={Settings} title="Densidad y comportamiento" />

        <div className="px-6 py-4 border-b border-slate-50">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Densidad de la interfaz
          </p>
          <div className="flex gap-2">
            {DENSITIES.map(({ value, label, hint }) => {
              const active = s.density === value;
              return (
                <button
                  key={value}
                  onClick={() => onChange('density', value)}
                  title={hint}
                  aria-pressed={active}
                  className={`rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-all ${
                    active
                      ? 'border-[var(--accent-200)] bg-[var(--accent-50)] text-[var(--accent-700)]'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <RowSetting
          label="Animaciones de la interfaz"
          description="Activa o desactiva transiciones y efectos de movimiento."
          border={false}
        >
          <div className="flex items-center gap-2">
            {s.animations
              ? <Zap    className="h-4 w-4 text-[var(--accent-500)]" />
              : <ZapOff className="h-4 w-4 text-slate-400" />}
            <Toggle value={s.animations} onChange={(v) => onChange('animations', v)} />
          </div>
        </RowSetting>
      </SectionCard>
    </div>
  );
}