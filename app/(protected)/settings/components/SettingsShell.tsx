// components/configuracion/ConfigShell.tsx
// Único Client Component de la página — maneja tab activo y estado de guardado
'use client';

import { useState }         from 'react';
import { SaveBar }          from '@/app/components/ui/IntranetUI';
import { ConfigSidebar }    from './ConfigSidebar';
import { NotificationsTab } from './NotificationsTab';
import { AppearanceTab }    from './AppearanceTab';
import { AccessibilityTab } from './AccessibilityTab';
import { IntegrationsTab }  from './IntegrationsTab';
import type { ConfigTab }   from '@/types/settings';

const TAB_META: Record<ConfigTab, { label: string; description: string }> = {
  notifications: { label: 'Notificaciones', description: 'Canales y eventos que te notifican'          },
  appearance:    { label: 'Apariencia',     description: 'Tema, colores y densidad de la interfaz'     },
  accessibility: { label: 'Accesibilidad',  description: 'Fuente, contraste y opciones de movilidad'   },
  integrations:  { label: 'Integraciones',  description: 'Apps conectadas a la intranet corporativa'   },
};

export function ConfigShell() {
  const [activeTab, setActiveTab] = useState<ConfigTab>('notifications');
  const [dirty,     setDirty]     = useState(false);
  const [saved,     setSaved]     = useState(false);

  const markDirty = () => { setDirty(true); setSaved(false); };

  const handleSave = () => {
    // TODO: persistir en API
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const { label, description } = TAB_META[activeTab];

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <ConfigSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 min-w-0">
        <div className="mb-5">
          <h2 className="text-[17px] font-bold text-slate-900">{label}</h2>
          <p className="mt-0.5 text-[12px] text-slate-400">{description}</p>
        </div>

        {activeTab === 'notifications' && <NotificationsTab onChange={markDirty} />}
        {activeTab === 'appearance'    && <AppearanceTab    onChange={markDirty} />}
        {activeTab === 'accessibility' && <AccessibilityTab onChange={markDirty} />}
        {activeTab === 'integrations'  && <IntegrationsTab />}
      </main>

      <SaveBar dirty={dirty} onSave={handleSave} saved={saved} />
    </div>
  );
}