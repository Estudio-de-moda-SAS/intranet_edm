'use client';

import { useState } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { Shield, Eye, Database, Bell, Share2, ChevronRight } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────

interface Toggle {
  id: string;
  label: string;
  description: string;
  value: boolean;
}

interface Section {
  id: string;
  Icon: React.ElementType;
  title: string;
  color: string;
  toggles: Toggle[];
}

// ── Initial state ─────────────────────────────────────────────────

const INITIAL_SECTIONS: Section[] = [
  {
    id: 'visibility',
    Icon: Eye,
    title: 'Visibilidad de perfil',
    color: 'text-blue-500',
    toggles: [
      {
        id: 'show_email',
        label: 'Mostrar correo a compañeros',
        description: 'Tu email será visible en tu perfil de la intranet.',
        value: true,
      },
      {
        id: 'show_department',
        label: 'Mostrar departamento',
        description: 'Tu área y cargo aparecerán en búsquedas internas.',
        value: true,
      },
      {
        id: 'show_phone',
        label: 'Mostrar número de extensión',
        description: 'Otros empleados podrán ver tu extensión directa.',
        value: false,
      },
    ],
  },
  {
    id: 'data',
    Icon: Database,
    title: 'Datos y actividad',
    color: 'text-violet-500',
    toggles: [
      {
        id: 'activity_log',
        label: 'Registro de actividad',
        description: 'Permitir que TI registre tu actividad con fines de auditoría.',
        value: true,
      },
      {
        id: 'analytics',
        label: 'Participar en métricas de uso',
        description: 'Contribuir a estadísticas anónimas de uso del sistema.',
        value: false,
      },
    ],
  },
  {
    id: 'notifications',
    Icon: Bell,
    title: 'Notificaciones',
    color: 'text-amber-500',
    toggles: [
      {
        id: 'email_notifs',
        label: 'Recibir notificaciones por email',
        description: 'Alertas importantes también se enviarán a tu correo corporativo.',
        value: true,
      },
      {
        id: 'desktop_notifs',
        label: 'Notificaciones de escritorio',
        description: 'Recibir push notifications en el navegador.',
        value: false,
      },
    ],
  },
  {
    id: 'sharing',
    Icon: Share2,
    title: 'Compartir información',
    color: 'text-emerald-500',
    toggles: [
      {
        id: 'share_calendar',
        label: 'Compartir disponibilidad de calendario',
        description: 'Tu horario libre/ocupado será visible para compañeros.',
        value: true,
      },
    ],
  },
];

// ── Toggle component ──────────────────────────────────────────────

function ToggleSwitch({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`
        relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30
        ${value ? 'bg-violet-600' : 'bg-slate-200'}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow
          transition-transform duration-200
          ${value ? 'translate-x-4' : 'translate-x-0'}
        `}
      />
    </button>
  );
}

// ── Props ─────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────

export function PrivacyModal({ open, onClose }: Props) {
  const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS);
  const [saved, setSaved] = useState(false);

  const setToggle = (sectionId: string, toggleId: string, value: boolean) => {
    setSaved(false);
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              toggles: s.toggles.map((t) =>
                t.id !== toggleId ? t : { ...t, value }
              ),
            }
      )
    );
  };

  const handleSave = () => {
    // TODO: llamada a API para guardar preferencias
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      accentColor="bg-violet-600"
      title="Privacidad"
      subtitle="Controla qué información compartes dentro de la organización"
      footer={
        <div className="flex items-center justify-between">
          <a
            href="/privacidad"
            className="flex items-center gap-1 text-[12px] font-medium text-violet-600 hover:underline"
            onClick={onClose}
          >
            Ver política de privacidad completa
            <ChevronRight className="h-3 w-3" />
          </a>
          <button
            onClick={handleSave}
            className={`
              rounded-xl px-4 py-2 text-[12px] font-semibold transition-all duration-200
              ${saved
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-violet-600 text-white hover:bg-violet-700 shadow-sm shadow-violet-200'}
            `}
          >
            {saved ? '✓ Guardado' : 'Guardar cambios'}
          </button>
        </div>
      }
    >
      <div className="space-y-5 max-h-[380px] overflow-y-auto -mx-1 px-1">
        {sections.map((section) => (
          <div key={section.id}>
            {/* Section header */}
            <div className="mb-2.5 flex items-center gap-2">
              <section.Icon className={`h-4 w-4 ${section.color}`} />
              <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">
                {section.title}
              </span>
            </div>

            {/* Toggles */}
            <div className="space-y-1 rounded-xl border border-slate-100 bg-slate-50/50 overflow-hidden">
              {section.toggles.map((toggle, idx) => (
                <div
                  key={toggle.id}
                  className={`
                    flex items-start justify-between gap-4 px-4 py-3
                    ${idx < section.toggles.length - 1 ? 'border-b border-slate-100' : ''}
                  `}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-slate-700">
                      {toggle.label}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400 leading-relaxed">
                      {toggle.description}
                    </p>
                  </div>
                  <div className="mt-0.5 shrink-0">
                    <ToggleSwitch
                      value={toggle.value}
                      onChange={(v) => setToggle(section.id, toggle.id, v)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Info footer note */}
        <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <p className="text-[11px] leading-relaxed text-slate-400">
            Estos ajustes aplican únicamente dentro de la red corporativa. El
            departamento de TI puede acceder a cierta información con fines de
            auditoría de seguridad independientemente de esta configuración.
          </p>
        </div>
      </div>
    </Modal>
  );
}
