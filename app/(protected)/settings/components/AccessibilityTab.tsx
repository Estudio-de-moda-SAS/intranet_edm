// components/configuracion/tabs/AccessibilityTab.tsx
'use client';

import { useState } from 'react';
import { Accessibility, Type, Globe, Zap, Contrast, MousePointer } from 'lucide-react';
import { SectionCard, SectionHeader, RowSetting, Toggle } from '@/app/components/ui/IntranetUI';
import { DEFAULT_ACCESSIBILITY } from '../config/settingsValues';
import type { AccessibilitySettings } from '@/types/settings';

interface Props { onChange: () => void }

const FONT_SIZES: { value: AccessibilitySettings['fontSize']; label: string }[] = [
  { value: 'sm', label: 'Pequeño' },
  { value: 'md', label: 'Normal'  },
  { value: 'lg', label: 'Grande'  },
  { value: 'xl', label: 'Extra'   },
];

const TOGGLE_ROWS: {
  key: Exclude<keyof AccessibilitySettings, 'fontSize'>;
  Icon: React.ElementType;
  label: string;
  description: string;
}[] = [
  { key: 'highContrast',    Icon: Contrast,     label: 'Alto contraste',                     description: 'Aumenta el contraste entre texto y fondo.' },
  { key: 'largeText',       Icon: Type,         label: 'Texto grande globalmente',            description: 'Incrementa el tamaño de fuente en toda la interfaz.' },
  { key: 'reduceMotion',    Icon: Zap,          label: 'Reducir movimiento',                  description: 'Minimiza animaciones y transiciones.' },
  { key: 'focusIndicators', Icon: MousePointer, label: 'Indicadores de foco visibles',        description: 'Muestra bordes claros al navegar con teclado.' },
  { key: 'screenReader',    Icon: Globe,        label: 'Optimizar para lector de pantalla',   description: 'Ajusta etiquetas ARIA y orden de foco.' },
];

export function AccessibilityTab({ onChange }: Props) {
  const [s, setS] = useState<AccessibilitySettings>(DEFAULT_ACCESSIBILITY);

  const update = <K extends keyof AccessibilitySettings>(k: K, v: AccessibilitySettings[K]) => {
    setS((p) => ({ ...p, [k]: v }));
    onChange();
  };

  return (
    <div className="space-y-6">
      <SectionCard>
        <SectionHeader
          icon={Accessibility}
          title="Opciones de accesibilidad"
          subtitle="Adapta la interfaz a tus necesidades"
        />
        {TOGGLE_ROWS.map(({ key, Icon, label, description }, i) => (
          <RowSetting key={key} label={label} description={description} border={i < TOGGLE_ROWS.length - 1}>
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${s[key] ? 'text-violet-500' : 'text-slate-300'}`} />
              <Toggle value={s[key]} onChange={(v) => update(key, v)} />
            </div>
          </RowSetting>
        ))}
      </SectionCard>

      {/* Font size picker */}
      <SectionCard>
        <SectionHeader icon={Type} title="Tamaño base de fuente" />
        <div className="px-6 py-5">
          <div className="grid grid-cols-4 gap-2">
            {FONT_SIZES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => update('fontSize', value)}
                className={`rounded-xl border py-3 transition-all ${
                  s.fontSize === value
                    ? 'border-violet-300 bg-violet-50 text-violet-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <span className={`block font-semibold mb-0.5 ${
                  value === 'sm' ? 'text-[11px]' : value === 'md' ? 'text-[13px]' : value === 'lg' ? 'text-[15px]' : 'text-[17px]'
                }`}>Aa</span>
                <span className="text-[10px]">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
