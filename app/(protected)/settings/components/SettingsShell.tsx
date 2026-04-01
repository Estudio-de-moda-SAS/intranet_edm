// app/configuracion/components/SettingsShell.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSettings }         from '../hooks/useSettings';
import { useApplySettings }    from '../hooks/useApplySettings';
import { ConfigSidebar }       from './ConfigSidebar';
import { NotificationsTab }    from './tabs/NotificationsTab';
import { AppearanceTab }       from './tabs/AppearanceTab';
import { AccessibilityTab }    from './tabs/AccessibilityTab';
import { IntegrationsTab }     from './tabs/IntegrationsTab';
import { SaveBar }             from './SaveBar';
import type { ConfigTab, NotificationSettings, AppearanceSettings, AccessibilitySettings } from '@/types/settings';

const TAB_META: Record<ConfigTab, { label: string; description: string }> = {
  notifications: { label: 'Notificaciones', description: 'Canales y eventos que te notifican'        },
  appearance:    { label: 'Apariencia',     description: 'Tema, colores y densidad de la interfaz'   },
  accessibility: { label: 'Accesibilidad',  description: 'Fuente, contraste y opciones de movilidad' },
  integrations:  { label: 'Integraciones',  description: 'Apps conectadas a la intranet corporativa' },
};

/** Observa el header sticky y publica su altura en --header-h */
function useHeaderHeight() {
  useEffect(() => {
    const header = document.querySelector('header');
    if (!header) return;

    const update = () => {
      document.documentElement.style.setProperty(
        '--header-h',
        `${header.getBoundingClientRect().height}px`,
      );
    };

    update(); // valor inicial
    const ro = new ResizeObserver(update);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);
}

export function ConfigShell() {
  const [activeTab, setActiveTab] = useState<ConfigTab>('notifications');

  const {
    settings, dirty, saveStatus, save, discard,
    updateNotifications, updateAppearance, updateAccessibility, updateIntegration,
  } = useSettings();

  useApplySettings(settings.appearance, settings.accessibility);
  useHeaderHeight();

  const { label, description } = TAB_META[activeTab];

  return (
    <div className="flex flex-col lg:flex-row gap-8">

      {/* Sidebar — top dinámico según el header real */}
      <aside className="w-full lg:w-56 shrink-0">
        <nav
          className="space-y-1 lg:sticky"
          style={{ top: 'calc(var(--header-h, 112px) + 1.5rem)' }}
          aria-label="Secciones de configuración"
        >
          <ConfigSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </nav>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="mb-5">
          <h2 className="text-[17px] font-bold text-slate-900">{label}</h2>
          <p className="mt-0.5 text-[12px] text-slate-400">{description}</p>
        </div>

        {activeTab === 'notifications' && (
          <NotificationsTab
            settings={settings.notifications}
            onChange={(key: keyof NotificationSettings, value: boolean) =>
              updateNotifications(key, value)
            }
          />
        )}
        {activeTab === 'appearance' && (
          <AppearanceTab
            settings={settings.appearance}
            onChange={(key: keyof AppearanceSettings, value: AppearanceSettings[keyof AppearanceSettings]) =>
              updateAppearance(key, value)
            }
          />
        )}
        {activeTab === 'accessibility' && (
          <AccessibilityTab
            settings={settings.accessibility}
            onChange={(key: keyof AccessibilitySettings, value: AccessibilitySettings[keyof AccessibilitySettings]) =>
              updateAccessibility(key, value)
            }
          />
        )}
        {activeTab === 'integrations' && (
          <IntegrationsTab
            settings={settings.integrations}
            onChange={updateIntegration}
          />
        )}
      </main>

      <SaveBar dirty={dirty} saveStatus={saveStatus} onSave={save} onDiscard={discard} />
    </div>
  );
}