// components/configuracion/tabs/AppearanceTab.tsx
'use client';

import { useState }  from 'react';
import { Palette, Settings, Layers, Sun, Moon, Monitor, Check, Zap } from 'lucide-react';
import { SectionCard, SectionHeader, RowSetting, Toggle } from '@/app/components/ui/IntranetUI';
import { DEFAULT_APPEARANCE } from '../config/settingsValues';
import type { AppearanceSettings } from '@/types/settings';

interface Props { onChange: () => void }

const THEMES = [
  { value: 'light'  as const, label: 'Claro',   Icon: Sun     },
  { value: 'dark'   as const, label: 'Oscuro',  Icon: Moon    },
  { value: 'system' as const, label: 'Sistema', Icon: Monitor },
];

const DENSITIES = [
  { value: 'compact'  as const, label: 'Compacto' },
  { value: 'default'  as const, label: 'Normal'   },
  { value: 'spacious' as const, label: 'Amplio'   },
];

const ACCENTS = [
  { hue: 258, label: 'Violeta'   },
  { hue: 220, label: 'Azul'     },
  { hue: 160, label: 'Esmeralda'},
  { hue: 25,  label: 'Naranja'  },
  { hue: 330, label: 'Rosa'     },
  { hue: 0,   label: 'Rojo'     },
];

export function AppearanceTab({ onChange }: Props) {
  const [s, setS] = useState<AppearanceSettings>(DEFAULT_APPEARANCE);
  const upd = <K extends keyof AppearanceSettings>(k: K, v: AppearanceSettings[K]) => {
    setS((p) => ({ ...p, [k]: v }));
    onChange();
  };

  return (
    <div className="space-y-6">
      {/* Tema */}
      <SectionCard>
        <SectionHeader icon={Palette} title="Tema de la interfaz" subtitle="Modo claro, oscuro o según el sistema" />
        <div className="px-6 py-5">
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => upd('theme', value)}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 transition-all ${
                  s.theme === value
                    ? 'border-violet-400 bg-violet-50 shadow-sm shadow-violet-100'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Icon className={`h-5 w-5 ${s.theme === value ? 'text-violet-600' : 'text-slate-400'}`} />
                <span className={`text-[12px] font-medium ${s.theme === value ? 'text-violet-700' : 'text-slate-500'}`}>{label}</span>
                {s.theme === value && <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Accent */}
      <SectionCard>
        <SectionHeader icon={Layers} title="Color de acento" subtitle="Color principal de botones y elementos activos" />
        <div className="px-6 py-5">
          <div className="flex gap-3 flex-wrap">
            {ACCENTS.map(({ hue, label }) => (
              <button
                key={hue}
                title={label}
                onClick={() => upd('accentHue', hue)}
                className={`relative h-9 w-9 rounded-full transition-transform hover:scale-110 ${s.accentHue === hue ? 'ring-2 ring-offset-2 scale-110' : ''}`}
                style={{ background: `linear-gradient(135deg, hsl(${hue},70%,55%), hsl(${hue + 20},65%,45%))` }}
              >
                {s.accentHue === hue && <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-slate-400">Aplica en la próxima recarga de página.</p>
        </div>
      </SectionCard>

      {/* Densidad */}
      <SectionCard>
        <SectionHeader icon={Settings} title="Densidad y comportamiento" />
        <div className="px-6 py-4 border-b border-slate-50">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Densidad de la interfaz</p>
          <div className="flex gap-2">
            {DENSITIES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => upd('density', value)}
                className={`rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-all ${
                  s.density === value
                    ? 'border-violet-300 bg-violet-50 text-violet-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <RowSetting label="Sidebar colapsado por defecto" description="El menú lateral aparecerá minimizado al cargar.">
          <Toggle value={s.sidebarCollapsed} onChange={(v) => upd('sidebarCollapsed', v)} />
        </RowSetting>
        <RowSetting label="Animaciones de la interfaz" description="Desactiva para mejor rendimiento en dispositivos lentos." border={false}>
          <div className="flex items-center gap-2">
            <Zap className={`h-4 w-4 ${s.animations ? 'text-violet-500' : 'text-slate-400'}`} />
            <Toggle value={s.animations} onChange={(v) => upd('animations', v)} />
          </div>
        </RowSetting>
      </SectionCard>
    </div>
  );
}
