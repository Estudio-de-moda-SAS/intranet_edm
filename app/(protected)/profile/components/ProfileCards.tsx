/**
 * @module ProfileCards
 * Tarjetas del lado izquierdo de la pagina de perfil.
 *
 * @remarks
 * **Campos de solo lectura (Graph / Entra ID):**
 * `name`, `email`, `phone`, `location` provienen de Microsoft Graph
 * con el scope `User.Read`. No son editables desde la intranet porque
 * modificarlos requiere `User.ReadWrite`, que las cuentas corporativas
 * generalmente no tienen habilitado para auto-edicion. Los cambios
 * se gestionan a traves de RRHH o del portal de Microsoft 365.
 *
 * **Campos editables (localStorage):**
 * `timezone` y `language` son preferencias locales del colaborador.
 * Se persisten en `edm_profile_prefs` via {@link ProfilePageClient}.
 */

"use client";

import { useState }  from "react";
import { User, Mail, Phone, MapPin, Globe, Clock, Info } from "lucide-react";
import { SectionCard, SectionHeader, EditableField } from "@/app/components/ui/IntranetUI";
import type { ProfileData } from "@/types/profile";

// -- ReadonlyField ------------------------------------------------------------

/**
 * Campo de solo lectura con tooltip que explica por que no es editable.
 * @internal
 */
function ReadonlyField({
  label,
  value,
  icon: Icon,
  reason,
}: {
  label:   string;
  value:   string;
  icon:    React.ComponentType<React.SVGProps<SVGSVGElement>>;
  reason?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <div className="flex items-center gap-3 min-w-0">
        <Icon className="h-4 w-4 shrink-0 text-slate-400" />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="mt-0.5 text-[13px] text-slate-700 truncate">
            {value || "—"}
          </p>
        </div>
      </div>

      {reason && (
        <div className="group relative shrink-0 ml-2">
          <Info className="h-3.5 w-3.5 text-slate-300 cursor-help" />
          <div className="pointer-events-none absolute right-0 top-5 z-10 w-48 rounded-lg border border-slate-100 bg-white p-2.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-[11px] text-slate-500 leading-relaxed">{reason}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// -- PersonalInfoCard ---------------------------------------------------------

interface PersonalInfoCardProps {
  profile:  ProfileData;
  onUpdate: (field: keyof ProfileData, value: string) => void;
}

/**
 * Tarjeta de informacion personal del usuario.
 *
 * @remarks
 * Muestra `name`, `email`, `phone` y `location` desde Microsoft Graph.
 * Todos son de solo lectura — un tooltip explica que se gestionan
 * desde Entra ID / portal de Microsoft 365.
 */
export function PersonalInfoCard({ profile }: PersonalInfoCardProps) {
  const READONLY_REASON = "Gestionado por tu cuenta corporativa de Microsoft 365. Contacta a TI o RRHH para cambios.";

  const fields = [
    { field: "name"     as const, label: "Nombre completo",     icon: User,   value: profile.name     ?? "" },
    { field: "email"    as const, label: "Correo corporativo",  icon: Mail,   value: profile.email    ?? "" },
    { field: "phone"    as const, label: "Telefono / Extension",icon: Phone,  value: profile.phone    ?? "" },
    { field: "location" as const, label: "Ubicacion",           icon: MapPin, value: profile.location ?? "" },
  ];

  return (
    <SectionCard>
      <SectionHeader
        icon={User}
        title="Informacion personal"
        subtitle="Datos visibles en el directorio corporativo"
      />

      {/* Aviso de solo lectura */}
      <div className="mx-6 mt-1 mb-2 flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2.5">
        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
        <p className="text-[11px] text-amber-700 leading-relaxed">
          Estos datos provienen de tu cuenta de{" "}
          <span className="font-semibold">Microsoft 365</span> y son de solo lectura.
          Para modificarlos contacta a TI o Recursos Humanos.
        </p>
      </div>

      <div className="px-6 divide-y divide-slate-50">
        {fields.map(({ field, label, icon, value }) => (
          <ReadonlyField
            key={field}
            label={label}
            value={value}
            icon={icon}
            reason={READONLY_REASON}
          />
        ))}
      </div>
    </SectionCard>
  );
}

// -- RegionalPrefsCard --------------------------------------------------------

interface RegionalPrefsCardProps {
  profile:  ProfileData;
  onUpdate: (field: keyof ProfileData, value: string) => void;
}

/**
 * Tarjeta de preferencias regionales.
 *
 * @remarks
 * `timezone` y `language` son los unicos campos editables del perfil
 * desde la intranet. Se persisten en localStorage via {@link ProfilePageClient}.
 */
export function RegionalPrefsCard({ profile, onUpdate }: RegionalPrefsCardProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [tempVal, setTempVal] = useState("");

  const startEdit  = (field: string) => {
    setEditing(field);
    setTempVal(profile[field as keyof ProfileData] as string ?? "");
  };
  const cancelEdit = () => setEditing(null);
  const saveEdit   = (field: keyof ProfileData) => {
    onUpdate(field, tempVal);
    setEditing(null);
  };

  const FIELDS = [
    { field: "timezone" as const, label: "Zona horaria", icon: Clock },
    { field: "language" as const, label: "Idioma",       icon: Globe },
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
            value={profile[field] ?? ""}
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

// -- PasswordCard -------------------------------------------------------------

/**
 * Tarjeta de cambio de contrasena.
 *
 * @remarks
 * Redirige al portal oficial de Microsoft para la gestion de credenciales.
 * Las contrasenas de cuentas corporativas no se gestionan desde la intranet.
 */
export function PasswordCard() {
  const handleRedirect = () => {
    window.open("https://passwordreset.microsoftonline.com/", "_blank", "noopener,noreferrer");
  };

  return (
    <SectionCard>
      <SectionHeader
        icon={Lock}
        title="Cambiar contrasena"
        subtitle="La gestion de contrasenas se realiza a traves del portal corporativo de Microsoft"
      />
      <div className="px-6 py-5">
        <div className="flex gap-3 rounded-xl border border-violet-100 bg-violet-50/60 px-4 py-3.5 mb-5">
          <div className="mt-0.5 shrink-0 text-violet-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </div>
          <p className="text-[12px] leading-relaxed text-violet-700">
            Tu contrasena esta gestionada por{" "}
            <span className="font-semibold">Microsoft 365</span>.
            Al hacer clic seras redirigido al portal oficial para cambiarla
            o restablecerla de forma segura.
          </p>
        </div>

        <ol className="space-y-2 mb-5">
          {[
            "Haz clic en el boton para abrir el portal de Microsoft.",
            "Inicia sesion con tu cuenta corporativa.",
            "Sigue los pasos para cambiar o restablecer tu contrasena.",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[9px] font-bold text-violet-600">
                {i + 1}
              </span>
              <span className="text-[12px] text-slate-500">{step}</span>
            </li>
          ))}
        </ol>

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
          Abre{" "}
          <span className="font-medium text-slate-500">
            passwordreset.microsoftonline.com
          </span>{" "}
          en una nueva pestana
        </p>
      </div>
    </SectionCard>
  );
}

// -- Lock icon ----------------------------------------------------------------

function Lock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}