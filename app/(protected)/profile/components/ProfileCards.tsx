/**
 * @module ProfileCards
 * Tarjetas editables del lado izquierdo de la página de perfil.
 *
 * @remarks
 * Este módulo agrupa las secciones principales de edición del perfil
 * del usuario dentro de la intranet.
 *
 * Incluye:
 *
 * - información personal
 * - preferencias regionales
 * - acceso al cambio de contraseña
 *
 * Las tarjetas editables comparten una misma lógica de interacción:
 *
 * - activación de modo edición por campo
 * - almacenamiento temporal del valor editado
 * - guardado delegado al callback `onUpdate`
 *
 * Es un **Client Component** porque utiliza estado local para controlar
 * la edición de campos y acciones del usuario.
 */

// components/perfil/ProfileCards.tsx
// Tarjetas editables del lado izquierdo de la página de perfil
'use client';

import { useState } from 'react';
import { User, Mail, Phone, MapPin, Globe, Clock} from 'lucide-react';
import { SectionCard, SectionHeader, EditableField } from '@/app/components/ui/IntranetUI';
import type { ProfileData } from '@/types/profile';

// ─── Personal Info ────────────────────────────────────────────────

/**
 * Props de la tarjeta {@link PersonalInfoCard}.
 *
 * @property profile Datos actuales del perfil.
 * @property onUpdate Callback para actualizar un campo del perfil.
 */
interface PersonalInfoCardProps {
  profile:    ProfileData;
  onUpdate:   (field: keyof ProfileData, value: string) => void;
}

/**
 * Tarjeta de información personal del usuario.
 *
 * @param props Propiedades del componente.
 * @returns Tarjeta editable con datos visibles en el directorio corporativo.
 *
 * @remarks
 * Esta tarjeta permite editar campos básicos del perfil, como:
 *
 * - nombre completo
 * - correo corporativo
 * - teléfono o extensión
 * - ubicación
 *
 * La persistencia real de los cambios se delega al callback `onUpdate`.
 *
 * @example
 * ```tsx
 * <PersonalInfoCard profile={profile} onUpdate={updateField} />
 * ```
 */
export function PersonalInfoCard({ profile, onUpdate }: PersonalInfoCardProps) {
  /**
   * Campo actualmente en edición.
   */
  const [editing, setEditing] = useState<string | null>(null);

  /**
   * Valor temporal del campo en edición.
   */
  const [tempVal, setTempVal] = useState('');

  /**
   * Activa el modo edición para un campo específico.
   *
   * @param field Nombre del campo a editar.
   */
  const startEdit  = (field: string) => { setEditing(field); setTempVal(profile[field as keyof ProfileData] as string); };

  /**
   * Cancela la edición activa.
   */
  const cancelEdit = () => setEditing(null);

  /**
   * Guarda el valor temporal del campo editado.
   *
   * @param field Campo del perfil a actualizar.
   */
  const saveEdit   = (field: keyof ProfileData) => { onUpdate(field, tempVal); setEditing(null); };

  /**
   * Configuración de campos editables de información personal.
   *
   * @remarks
   * Cada entrada define:
   *
   * - clave del campo en el perfil
   * - etiqueta visible
   * - icono representativo
   * - tipo de input
   */
  const FIELDS = [
    { field: 'name'     as const, label: 'Nombre completo',       icon: User,  type: 'text' },
    { field: 'email'    as const, label: 'Correo corporativo',     icon: Mail,  type: 'email' },
    { field: 'phone'    as const, label: 'Teléfono / Extensión',   icon: Phone, type: 'tel'   },
    { field: 'location' as const, label: 'Ubicación',              icon: MapPin, type: 'text' },
  ];

  return (
    <SectionCard>
      <SectionHeader
        icon={User}
        title="Información personal"
        subtitle="Datos visibles en el directorio corporativo"
      />
      <div className="px-6 divide-y divide-slate-50">
        {FIELDS.map(({ field, label, type }) => (
          <EditableField
            key={field}
            label={label}
            type={type}
            value={profile[field] ?? ''}
            editing={editing === field}
            onEdit={() => startEdit(field)}
            onChange={setTempVal}
            onSave={() => saveEdit(field)}
            onCancel={cancelEdit}
          />
        ))}
      </div>
    </SectionCard>
  );
}

// ─── Regional Prefs ───────────────────────────────────────────────

/**
 * Props de la tarjeta {@link RegionalPrefsCard}.
 *
 * @property profile Datos actuales del perfil.
 * @property onUpdate Callback para actualizar un campo del perfil.
 */
interface RegionalPrefsCardProps {
  profile:  ProfileData;
  onUpdate: (field: keyof ProfileData, value: string) => void;
}

/**
 * Tarjeta de preferencias regionales.
 *
 * @param props Propiedades del componente.
 * @returns Tarjeta editable con zona horaria e idioma.
 *
 * @remarks
 * Esta sección permite al usuario administrar preferencias de interfaz
 * y configuración regional.
 *
 * @example
 * ```tsx
 * <RegionalPrefsCard profile={profile} onUpdate={updateField} />
 * ```
 */
export function RegionalPrefsCard({ profile, onUpdate }: RegionalPrefsCardProps) {
  /**
   * Campo actualmente en edición.
   */
  const [editing, setEditing] = useState<string | null>(null);

  /**
   * Valor temporal del campo en edición.
   */
  const [tempVal, setTempVal] = useState('');

  /**
   * Activa la edición para un campo regional.
   *
   * @param field Nombre del campo a editar.
   */
  const startEdit  = (field: string) => { setEditing(field); setTempVal(profile[field as keyof ProfileData] as string); };

  /**
   * Cancela la edición activa.
   */
  const cancelEdit = () => setEditing(null);

  /**
   * Guarda el nuevo valor del campo regional.
   *
   * @param field Campo del perfil a actualizar.
   */
  const saveEdit   = (field: keyof ProfileData) => { onUpdate(field, tempVal); setEditing(null); };

  /**
   * Configuración de campos editables regionales.
   */
  const FIELDS = [
    { field: 'timezone' as const, label: 'Zona horaria', icon: Clock },
    { field: 'language' as const, label: 'Idioma',       icon: Globe },
  ];

  return (
    <SectionCard>
      <SectionHeader
        icon={Globe}
        title="Preferencias regionales"
        subtitle="Zona horaria e idioma de la interfaz"
      />
      <div className="px-6 divide-y divide-slate-50">
        {FIELDS.map(({ field, label }) => (
          <EditableField
            key={field}
            label={label}
            value={profile[field] ?? ''}
            editing={editing === field}
            onEdit={() => startEdit(field)}
            onChange={setTempVal}
            onSave={() => saveEdit(field)}
            onCancel={cancelEdit}
          />
        ))}
      </div>
    </SectionCard>
  );
}

// ─── Password Card ────────────────────────────────────────────────

/**
 * Tarjeta de cambio de contraseña.
 *
 * @returns Tarjeta informativa con acceso al portal de Microsoft.
 *
 * @remarks
 * Este componente no cambia la contraseña directamente desde la intranet.
 * En su lugar, redirige al portal oficial de Microsoft para mantener
 * la gestión de credenciales bajo el proveedor corporativo de identidad.
 *
 * @example
 * ```tsx
 * <PasswordCard />
 * ```
 */
export function PasswordCard() {
  /**
   * Redirige al portal oficial de restablecimiento/cambio de contraseña.
   */
  const handleRedirect = () => {
    window.open('https://passwordreset.microsoftonline.com/', '_blank', 'noopener,noreferrer');
  };

  return (
    <SectionCard>
      <SectionHeader
        icon={Lock}
        title="Cambiar contraseña"
        subtitle="La gestión de contraseñas se realiza a través del portal corporativo de Microsoft"
      />
      <div className="px-6 py-5">
        {/* Info banner */}
        <div className="flex gap-3 rounded-xl border border-violet-100 bg-violet-50/60 px-4 py-3.5 mb-5">
          <div className="mt-0.5 shrink-0 text-violet-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </div>
          <p className="text-[12px] leading-relaxed text-violet-700">
            Tu contraseña está gestionada por <span className="font-semibold">Microsoft 365</span>.
            Al hacer clic serás redirigido al portal oficial para cambiarla o restablecerla de forma segura.
          </p>
        </div>

        {/* Steps */}
        <ol className="space-y-2 mb-5">
          {[
            'Haz clic en el botón para abrir el portal de Microsoft.',
            'Inicia sesión con tu cuenta corporativa.',
            'Sigue los pasos para cambiar o restablecer tu contraseña.',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[9px] font-bold text-violet-600">
                {i + 1}
              </span>
              <span className="text-[12px] text-slate-500">{step}</span>
            </li>
          ))}
        </ol>

        {/* CTA */}
        <button
          onClick={handleRedirect}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-violet-200 transition-all hover:bg-violet-700 active:scale-[0.98]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Ir al portal de Microsoft
        </button>

        <p className="mt-3 text-center text-[10px] text-slate-400">
          Abre <span className="font-medium text-slate-500">passwordreset.microsoftonline.com</span> en una nueva pestaña
        </p>
      </div>
    </SectionCard>
  );
}

/**
 * Icono auxiliar de candado usado en {@link PasswordCard}.
 *
 * @param props Props SVG estándar.
 * @returns SVG de candado.
 *
 * @remarks
 * Se define inline para evitar una importación adicional exclusiva
 * para este componente.
 */
// Lock icon inline (evita importar sólo para este componente)
function Lock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}