// app/configuracion/components/tabs/NotificationsTab.tsx
'use client';

import { Bell, MessageSquare, Volume2, VolumeX } from 'lucide-react';
import { SectionCard, SectionHeader, RowSetting, Toggle } from '@/app/components/ui/IntranetUI';
import type { NotificationSettings } from '@/config/settings';

// Todos los valores de NotificationSettings son boolean, así que el onChange
// puede tiparse directamente sin genérico — evita el error con exactOptionalPropertyTypes
type NotifKey = keyof NotificationSettings;

interface Props {
  settings: NotificationSettings;
  onChange: (key: NotifKey, value: boolean) => void;
}

const EVENT_ROWS: { key: NotifKey; label: string; description: string }[] = [
  { key: 'taskAssigned',  label: 'Tarea asignada a mí',         description: 'Cuando alguien te asigna una tarea.'        },
  { key: 'taskDue',       label: 'Vencimiento próximo',          description: 'Recordatorio 24 h antes de que venza.'      },
  { key: 'mentions',      label: 'Menciones en comentarios',     description: 'Cuando te mencionan con @nombre.'            },
  { key: 'announcements', label: 'Comunicados corporativos',     description: 'Boletines oficiales de la empresa.'          },
  { key: 'systemAlerts',  label: 'Alertas de mantenimiento',     description: 'Avisos de actualizaciones o caídas.'         },
  { key: 'weeklyReport',  label: 'Reporte semanal de actividad', description: 'Resumen de tu actividad de la semana.'       },
];

export function NotificationsTab({ settings: s, onChange }: Props) {
  return (
    <div className="space-y-6">
      {/* Canales */}
      <SectionCard>
        <SectionHeader
          icon={Bell}
          title="Canales de notificación"
          subtitle="Dónde quieres recibir alertas"
        />

        <RowSetting label="Email — alertas inmediatas" description="Un email por cada evento importante.">
          <Toggle value={s.emailAlerts} onChange={(v) => onChange('emailAlerts', v)} />
        </RowSetting>

        <RowSetting label="Email — resumen diario" description="Un solo email al final del día.">
          <Toggle value={s.emailDigest} onChange={(v) => onChange('emailDigest', v)} />
        </RowSetting>

        <RowSetting label="Notificaciones del navegador" description="Push mientras tienes la intranet abierta.">
          <Toggle value={s.pushBrowser} onChange={(v) => onChange('pushBrowser', v)} />
        </RowSetting>

        <RowSetting label="Notificaciones móviles" description="Push a la app corporativa.">
          <Toggle value={s.pushMobile} onChange={(v) => onChange('pushMobile', v)} />
        </RowSetting>

        <RowSetting
          label="Sonido de escritorio"
          description="Reproducir tono al recibir notificaciones."
          border={false}
        >
          <div className="flex items-center gap-2">
            {s.soundDesktop
              ? <Volume2 className="h-4 w-4 text-violet-500" />
              : <VolumeX  className="h-4 w-4 text-slate-400" />}
            <Toggle value={s.soundDesktop} onChange={(v) => onChange('soundDesktop', v)} />
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

        {EVENT_ROWS.map(({ key, label, description }, i) => (
          <RowSetting key={key} label={label} description={description} border={i < EVENT_ROWS.length - 1}>
            <Toggle value={s[key]} onChange={(v) => onChange(key, v)} />
          </RowSetting>
        ))}
      </SectionCard>
    </div>
  );
}