// components/configuracion/tabs/NotificationsTab.tsx
'use client';

import { useState }                    from 'react';
import { Bell, MessageSquare, Volume2, VolumeX } from 'lucide-react';
import { SectionCard, SectionHeader, RowSetting, Toggle } from '@/app/components/ui/IntranetUI';
import { DEFAULT_NOTIFICATIONS }       from '../config/settingsValues';
import type { NotificationSettings }   from '@/types/settings';

interface Props { onChange: () => void }

export function NotificationsTab({ onChange }: Props) {
  const [s, setS] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);

  const update = <K extends keyof NotificationSettings>(k: K, v: NotificationSettings[K]) => {
    setS((p) => ({ ...p, [k]: v }));
    onChange();
  };

  return (
    <div className="space-y-6">
      {/* Canales */}
      <SectionCard>
        <SectionHeader
          icon={Bell}
          title="Canales de notificación"
          subtitle="Dónde quieres recibir alertas"
        />
        <RowSetting label="Email — alertas inmediatas"   description="Un email por cada evento importante.">
          <Toggle value={s.emailAlerts}  onChange={(v) => update('emailAlerts', v)} />
        </RowSetting>
        <RowSetting label="Email — resumen diario"       description="Un solo email al final del día.">
          <Toggle value={s.emailDigest}  onChange={(v) => update('emailDigest', v)} />
        </RowSetting>
        <RowSetting label="Notificaciones del navegador" description="Push mientras tienes la intranet abierta.">
          <Toggle value={s.pushBrowser}  onChange={(v) => update('pushBrowser', v)} />
        </RowSetting>
        <RowSetting label="Notificaciones móviles"       description="Push a la app corporativa.">
          <Toggle value={s.pushMobile}   onChange={(v) => update('pushMobile', v)} />
        </RowSetting>
        <RowSetting label="Sonido de escritorio"         description="Reproducir tono al recibir notificaciones." border={false}>
          <div className="flex items-center gap-2">
            {s.soundDesktop
              ? <Volume2 className="h-4 w-4 text-violet-500" />
              : <VolumeX className="h-4 w-4 text-slate-400" />}
            <Toggle value={s.soundDesktop} onChange={(v) => update('soundDesktop', v)} />
          </div>
        </RowSetting>
      </SectionCard>

      {/* Eventos */}
      <SectionCard>
        <SectionHeader
          icon={MessageSquare}
          title="Eventos que generan notificación"
          subtitle="Selecciona qué actividad te interesa seguir"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        {([
          { key: 'taskAssigned'  as const, label: 'Tarea asignada a mí',                 description: 'Cuando alguien te asigna una tarea.' },
          { key: 'taskDue'       as const, label: 'Vencimiento próximo',                  description: 'Recordatorio 24h antes de que venza.' },
          { key: 'mentions'      as const, label: 'Menciones en comentarios',             description: 'Cuando te mencionan con @nombre.' },
          { key: 'announcements' as const, label: 'Comunicados corporativos',             description: 'Boletines oficiales de la empresa.' },
          { key: 'systemAlerts'  as const, label: 'Alertas de mantenimiento',             description: 'Avisos de actualizaciones o caídas.' },
          { key: 'weeklyReport'  as const, label: 'Reporte semanal de actividad',         description: 'Resumen de tu actividad de la semana.' },
        ]).map(({ key, label, description }, i, arr) => (
          <RowSetting key={key} label={label} description={description} border={i < arr.length - 1}>
            <Toggle value={s[key]} onChange={(v) => update(key, v)} />
          </RowSetting>
        ))}
      </SectionCard>
    </div>
  );
}
