/**
 * @module PrivacyModal
 * Componente cliente encargado de mostrar y gestionar la configuración
 * de privacidad del usuario dentro de la aplicación.
 *
 * @remarks
 * Este archivo implementa un modal de configuración donde el usuario puede
 * controlar qué información comparte dentro de la organización y cómo desea
 * manejar ciertos aspectos de visibilidad, actividad y notificaciones.
 *
 * Su responsabilidad incluye:
 *
 * - Renderizar un modal estructurado mediante {@link Modal}.
 * - Mostrar secciones agrupadas de preferencias de privacidad.
 * - Permitir activar o desactivar opciones mediante switches.
 * - Gestionar cambios locales sobre la configuración.
 * - Mostrar una acción de guardado con retroalimentación visual.
 *
 * Este componente está orientado a centralizar ajustes de privacidad
 * internos en una interfaz clara y organizada.
 */

'use client';

import { useState } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { Shield, Eye, Database, Bell, Share2, ChevronRight } from 'lucide-react';

/**
 * Representa una opción individual de configuración dentro de una sección.
 */
interface Toggle {
  /**
   * Identificador único de la opción.
   */
  id: string;

  /**
   * Nombre visible de la opción.
   */
  label: string;

  /**
   * Descripción breve del comportamiento o impacto de la opción.
   */
  description: string;

  /**
   * Estado actual de la opción.
   *
   * @remarks
   * - `true`: opción activada.
   * - `false`: opción desactivada.
   */
  value: boolean;
}

/**
 * Representa una sección de configuración dentro del modal.
 */
interface Section {
  /**
   * Identificador único de la sección.
   */
  id: string;

  /**
   * Icono representativo de la sección.
   */
  Icon: React.ElementType;

  /**
   * Título visible de la sección.
   */
  title: string;

  /**
   * Clase de color aplicada al icono de la sección.
   */
  color: string;

  /**
   * Lista de opciones configurables de la sección.
   */
  toggles: Toggle[];
}

/**
 * Configuración inicial de secciones y preferencias de privacidad.
 *
 * @remarks
 * Actualmente funciona como fuente local mock del estado del modal.
 * En una implementación real, estos datos podrían provenir de una API,
 * un store global o una configuración persistida del usuario.
 */
const INITIAL_SECTIONS: Section[] = [
  {
    id: 'visibility', Icon: Eye, title: 'Visibilidad de perfil', color: 'text-blue-500 dark:text-blue-400',
    toggles: [
      { id: 'show_email',      label: 'Mostrar correo a compañeros',    description: 'Tu email será visible en tu perfil de la intranet.',          value: true  },
      { id: 'show_department', label: 'Mostrar departamento',           description: 'Tu área y cargo aparecerán en búsquedas internas.',           value: true  },
      { id: 'show_phone',      label: 'Mostrar número de extensión',    description: 'Otros empleados podrán ver tu extensión directa.',             value: false },
    ],
  },
  {
    id: 'data', Icon: Database, title: 'Datos y actividad', color: 'text-violet-500 dark:text-violet-400',
    toggles: [
      { id: 'activity_log', label: 'Registro de actividad',         description: 'Permitir que TI registre tu actividad con fines de auditoría.', value: true  },
      { id: 'analytics',    label: 'Participar en métricas de uso', description: 'Contribuir a estadísticas anónimas de uso del sistema.',         value: false },
    ],
  },
  {
    id: 'notifications', Icon: Bell, title: 'Notificaciones', color: 'text-amber-500 dark:text-amber-400',
    toggles: [
      { id: 'email_notifs',   label: 'Recibir notificaciones por email', description: 'Alertas importantes también se enviarán a tu correo corporativo.', value: true  },
      { id: 'desktop_notifs', label: 'Notificaciones de escritorio',     description: 'Recibir push notifications en el navegador.',                     value: false },
    ],
  },
  {
    id: 'sharing', Icon: Share2, title: 'Compartir información', color: 'text-emerald-500 dark:text-emerald-400',
    toggles: [
      { id: 'share_calendar', label: 'Compartir disponibilidad de calendario', description: 'Tu horario libre/ocupado será visible para compañeros.', value: true },
    ],
  },
];

/**
 * Props del componente {@link ToggleSwitch}.
 */
interface ToggleSwitchProps {
  /**
   * Valor actual del switch.
   */
  value: boolean;

  /**
   * Callback ejecutado cuando el usuario cambia el estado del switch.
   */
  onChange: (v: boolean) => void;
}

/**
 * Componente auxiliar que representa un interruptor visual para activar
 * o desactivar una preferencia.
 *
 * @param props Propiedades del componente.
 * @param props.value Estado actual del switch.
 * @param props.onChange Función ejecutada al cambiar el valor.
 * @returns Interruptor visual interactivo.
 *
 * @remarks
 * Flujo de ejecución:
 *
 * 1. Renderiza un botón con rol semántico de switch.
 * 2. Refleja su estado actual mediante `aria-checked`.
 * 3. Al hacer clic, invierte el valor actual y lo envía al callback.
 *
 * Este componente abstrae la lógica visual de los toggles para reutilizarla
 * dentro de las distintas secciones del modal.
 */
function ToggleSwitch({ value, onChange }: ToggleSwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`
        relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30
        ${value
          ? 'bg-violet-600'
          : 'bg-slate-200 dark:bg-[#30363d]'}
      `}
    >
      <span className={`
        pointer-events-none inline-block h-4 w-4 transform rounded-full shadow
        transition-transform duration-200
        bg-white dark:bg-[#e6edf3]
        ${value ? 'translate-x-4' : 'translate-x-0'}
      `} />
    </button>
  );
}

/**
 * Props del componente {@link PrivacyModal}.
 */
interface Props {
  /**
   * Indica si el modal debe mostrarse.
   */
  open: boolean;

  /**
   * Función que se ejecuta al cerrar el modal.
   */
  onClose: () => void;
}

/**
 * Componente cliente que renderiza el modal de configuración de privacidad.
 *
 * @param props Propiedades del componente.
 * @param props.open Indica si el modal está visible.
 * @param props.onClose Función para cerrar el modal.
 * @returns Modal con secciones de configuración de privacidad.
 *
 * @remarks
 * Flujo de ejecución:
 *
 * 1. Inicializa el estado local de secciones a partir de `INITIAL_SECTIONS`.
 * 2. Mantiene un estado visual `saved` para reflejar si hubo guardado reciente.
 * 3. Permite modificar el valor de un toggle específico mediante `setToggle`.
 * 4. Permite simular una acción de guardado mediante `handleSave`.
 * 5. Renderiza el modal principal con:
 *    - Encabezado y subtítulo.
 *    - Footer con acceso a política completa y botón de guardado.
 *    - Secciones agrupadas de preferencias.
 *    - Nota informativa final sobre auditoría y seguridad.
 *
 * Actualmente los cambios se mantienen solo en memoria local.
 * En una implementación real, `handleSave` debería persistir la configuración
 * en backend o almacenamiento del usuario.
 */
export function PrivacyModal({ open, onClose }: Props) {
  /**
   * Estado local de secciones y preferencias configurables.
   */
  const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS);

  /**
   * Estado visual que indica si los cambios fueron guardados recientemente.
   */
  const [saved, setSaved] = useState(false);

  /**
   * Actualiza el valor de un toggle específico dentro de una sección.
   *
   * @param sectionId Identificador de la sección objetivo.
   * @param toggleId Identificador del toggle a actualizar.
   * @param value Nuevo valor booleano del toggle.
   * @returns No retorna valor.
   *
   * @remarks
   * Flujo de ejecución:
   *
   * 1. Reinicia el estado visual de guardado.
   * 2. Recorre las secciones existentes.
   * 3. Identifica la sección correspondiente.
   * 4. Dentro de ella, reemplaza el toggle indicado con el nuevo valor.
   */
  const setToggle = (sectionId: string, toggleId: string, value: boolean) => {
    setSaved(false);
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId ? s : {
          ...s,
          toggles: s.toggles.map((t) => t.id !== toggleId ? t : { ...t, value }),
        }
      )
    );
  };

  /**
   * Simula el guardado de cambios del formulario.
   *
   * @returns No retorna valor.
   *
   * @remarks
   * Actualmente solo activa un estado visual temporal de confirmación.
   * Después de 2.5 segundos, el indicador vuelve a su estado normal.
   */
  const handleSave = () => {
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
            className="flex items-center gap-1 text-[12px] font-medium text-violet-600 hover:underline dark:text-violet-400"
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
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/[0.10] dark:text-emerald-400 dark:border-emerald-500/25'
                : 'bg-violet-600 text-white hover:bg-violet-700 shadow-sm shadow-violet-200 dark:shadow-none'}
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
              <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#545d68]">
                {section.title}
              </span>
            </div>

            {/* Toggles */}
            <div className="space-y-0 rounded-xl overflow-hidden
                            border border-slate-100 bg-slate-50/50
                            dark:border-[#30363d] dark:bg-[#1c2128]">
              {section.toggles.map((toggle, idx) => (
                <div
                  key={toggle.id}
                  className={`flex items-start justify-between gap-4 px-4 py-3 ${
                    idx < section.toggles.length - 1
                      ? 'border-b border-slate-100 dark:border-[#21262d]'
                      : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-slate-700 dark:text-[#cdd9e5]">
                      {toggle.label}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400 dark:text-[#545d68]">
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
        <div className="flex items-start gap-2.5 rounded-xl px-4 py-3
                        border border-slate-100 bg-slate-50
                        dark:border-[#30363d] dark:bg-[#1c2128]">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-[#545d68]" />
          <p className="text-[11px] leading-relaxed text-slate-400 dark:text-[#768390]">
            Estos ajustes aplican únicamente dentro de la red corporativa. El
            departamento de TI puede acceder a cierta información con fines de
            auditoría de seguridad independientemente de esta configuración.
          </p>
        </div>
      </div>
    </Modal>
  );
}