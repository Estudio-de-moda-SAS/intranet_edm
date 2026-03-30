// components/configuracion/ConfigSidebar.tsx
'use client';

import { Bell, Palette, Accessibility, Plug } from 'lucide-react';
import type { ConfigTab } from '@/types/settings';

const TABS: { id: ConfigTab; label: string; Icon: React.ElementType; description: string }[] = [
  { id: 'notifications', label: 'Notificaciones', Icon: Bell,          description: 'Canales y eventos'   },
  { id: 'appearance',    label: 'Apariencia',     Icon: Palette,       description: 'Tema y densidad'     },
  { id: 'accessibility', label: 'Accesibilidad',  Icon: Accessibility, description: 'Fuente y contraste'  },
  { id: 'integrations',  label: 'Integraciones',  Icon: Plug,          description: 'Apps conectadas'     },
];

interface Props {
  activeTab:   ConfigTab;
  onTabChange: (tab: ConfigTab) => void;
}

export function ConfigSidebar({ activeTab, onTabChange }: Props) {
  return (
    <aside className="w-full lg:w-56 shrink-0">
      <nav className="space-y-1 lg:sticky lg:top-6">
        {TABS.map(({ id, label, Icon, description }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`
                w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all
                ${active
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                  : 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900'}
              `}
            >
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${active ? 'bg-white/20' : 'bg-slate-100'}`}>
                <Icon className={`h-3.5 w-3.5 ${active ? 'text-white' : 'text-slate-500'}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-[13px] font-semibold truncate ${active ? 'text-white' : 'text-slate-700'}`}>
                  {label}
                </p>
                <p className={`text-[10px] truncate ${active ? 'text-violet-200' : 'text-slate-400'}`}>
                  {description}
                </p>
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
