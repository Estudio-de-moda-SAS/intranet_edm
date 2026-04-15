/**
 * @module SecurityCards
 * Conjunto de tarjetas relacionadas con seguridad y datos corporativos del perfil.
 *
 * @remarks
 * Este archivo agrupa varias tarjetas funcionales del módulo de perfil:
 *
 * - gestión de autenticación en dos pasos
 * - sesiones activas del usuario
 * - información corporativa
 *
 * Aunque pertenecen al mismo dominio visual, cada tarjeta tiene una
 * responsabilidad distinta:
 *
 * - {@link TwoFACard}: redirección al portal de seguridad de Microsoft
 * - {@link SessionsCard}: visualización y revocación local de sesiones
 * - {@link CorporateInfoCard}: visualización de datos corporativos
 *
 * Es un **Client Component** porque incluye estado local en `SessionsCard`
 * y acciones de interacción en cliente.
 */

// components/perfil/SecurityCards.tsx
"use client";

import { useState } from "react";
import {
  Monitor,
  Smartphone,
  LogOut,
  ChevronRight,
  Building2,
} from "lucide-react";
import { SectionCard, SectionHeader } from "@/app/components/ui/IntranetUI";
import type { ProfileData, SessionEntry } from "@/types/profile";

/* -------------------------------------------------------------------------- */
/* Tipos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Props de la tarjeta {@link CorporateInfoCard}.
 *
 * @property profile Datos corporativos básicos del usuario.
 */
interface CorporateInfoCardProps {
  profile: Pick<
    ProfileData,
    "department" | "role" | "employeeId" | "joined"
  >;
}

/* -------------------------------------------------------------------------- */
/* Tarjeta: Autenticación 2FA                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Tarjeta de autenticación en dos factores.
 *
 * @returns Tarjeta informativa con acceso al portal oficial de Microsoft.
 *
 * @remarks
 * Este componente no administra la configuración de 2FA directamente
 * dentro de la intranet. En su lugar:
 *
 * - informa al usuario sobre el flujo correcto
 * - lo redirige al portal oficial de Microsoft
 *
 * Esto evita duplicar lógica de seguridad y delega la gestión real
 * al proveedor de identidad corporativo.
 *
 * @example
 * ```tsx
 * <TwoFACard />
 * ```
 */
export function TwoFACard() {
  /**
   * Abre el portal oficial de seguridad de Microsoft en una nueva pestaña.
   */
  const handleRedirect = () => {
    window.open(
      "https://mysignins.microsoft.com/security-info",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <SectionCard>
      <SectionHeader
        icon={ShieldIcon}
        title="Autenticación 2FA"
        subtitle="Verificación en dos pasos gestionada por Microsoft"
      />

      <div className="px-5 py-4 space-y-4">
        {/* Banner informativo */}
        <div className="flex gap-3 rounded-xl border border-violet-100 bg-violet-50/60 px-3.5 py-3">
          <div className="mt-0.5 shrink-0 text-violet-500">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </div>

          <p className="text-[12px] leading-relaxed text-violet-700">
            La verificación en dos pasos está gestionada por{" "}
            <span className="font-semibold">Microsoft 365</span>. Puedes activarla,
            desactivarla y administrar tus métodos desde el portal oficial.
          </p>
        </div>

        {/* Pasos */}
        <ol className="space-y-2">
          {[
            "Haz clic en el botón para abrir el portal de seguridad de Microsoft.",
            'Inicia sesión con tu cuenta corporativa.',
            'En "Información de seguridad" gestiona tus métodos de verificación.',
          ].map((step, index) => (
            <li key={index} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[9px] font-bold text-violet-600">
                {index + 1}
              </span>
              <span className="text-[12px] text-slate-500">{step}</span>
            </li>
          ))}
        </ol>

        {/* Acción principal */}
        <button
          onClick={handleRedirect}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-violet-200 transition-all hover:bg-violet-700 active:scale-[0.98]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-4 w-4"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Gestionar verificación en dos pasos
        </button>

        <p className="text-center text-[10px] text-slate-400">
          Abre{" "}
          <span className="font-medium text-slate-500">
            mysignins.microsoft.com/security-info
          </span>{" "}
          en una nueva pestaña
        </p>
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Tarjeta: Sesiones activas                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Tarjeta de sesiones activas del usuario.
 *
 * @returns Listado de sesiones y acciones locales de revocación.
 *
 * @remarks
 * Este componente maneja estado local de sesiones activas mediante
 * {@link useState}.
 *
 * Capacidades actuales:
 *
 * - mostrar dispositivos activos
 * - identificar la sesión actual
 * - revocar sesiones individuales de forma local
 *
 * La revocación actual es visual/local. En una integración completa,
 * debería conectarse a un backend o proveedor de identidad para cerrar
 * sesiones reales.
 *
 * @example
 * ```tsx
 * <SessionsCard />
 * ```
 */
export function SessionsCard() {
  /**
   * Estado local de sesiones activas.
   */
  const [sessions, setSessions] = useState<SessionEntry[]>([]);

  /**
   * Elimina una sesión del estado local.
   *
   * @param id Identificador de la sesión a revocar.
   */
  const revoke = (id: string) =>
    setSessions((previous) => previous.filter((session) => session.id !== id));

  return (
    <SectionCard>
      <SectionHeader
        icon={Monitor}
        title="Sesiones activas"
        subtitle={`${sessions.length} dispositivo${
          sessions.length !== 1 ? "s" : ""
        }`}
      />

      <div className="px-4 py-3 space-y-1">
        {sessions.length === 0 ? (
          <p className="py-4 text-center text-[12px] text-slate-400">
            No hay sesiones activas registradas
          </p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="group flex items-start gap-3 rounded-xl px-2 py-2.5 hover:bg-slate-50 transition-colors"
            >
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                {session.icon === "mobile" ? (
                  <Smartphone className="h-3.5 w-3.5 text-slate-500" />
                ) : (
                  <Monitor className="h-3.5 w-3.5 text-slate-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-[12px] font-medium text-slate-700 truncate">
                    {session.device}
                  </p>

                  {session.current && (
                    <span className="shrink-0 rounded-full bg-violet-50 border border-violet-100 px-1.5 py-px text-[9px] font-bold text-violet-600">
                      ACTUAL
                    </span>
                  )}
                </div>

                <p className="text-[10px] text-slate-400">
                  {session.location} · {session.lastSeen}
                </p>
              </div>

              {!session.current && (
                <button
                  onClick={() => revoke(session.id)}
                  title="Revocar sesión"
                  className="opacity-0 group-hover:opacity-100 mt-0.5 shrink-0 rounded-md p-1 text-rose-400 hover:bg-rose-50 transition-all"
                >
                  <LogOut className="h-3 w-3" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="border-t border-slate-100 px-5 py-3">
        <button className="flex items-center gap-1 text-[12px] font-medium text-rose-500 hover:text-rose-700 transition-colors">
          <LogOut className="h-3.5 w-3.5" />
          Cerrar todas las demás sesiones
        </button>
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Tarjeta: Información corporativa                                            */
/* -------------------------------------------------------------------------- */

/**
 * Tarjeta de información corporativa del usuario.
 *
 * @param props Propiedades del componente.
 * @returns Resumen de datos corporativos del perfil.
 *
 * @remarks
 * Esta tarjeta muestra información gestionada por la organización, como:
 *
 * - departamento
 * - cargo
 * - identificador de empleado
 * - fecha de ingreso
 *
 * También incluye un acceso para solicitar cambios sobre estos datos.
 *
 * @example
 * ```tsx
 * <CorporateInfoCard profile={profile} />
 * ```
 */
export function CorporateInfoCard({
  profile,
}: CorporateInfoCardProps) {
  /**
   * Filas de información corporativa a renderizar.
   */
  const rows = [
    { label: "Departamento", value: profile.department },
    { label: "Cargo", value: profile.role },
    { label: "ID empleado", value: profile.employeeId },
    { label: "Fecha ingreso", value: profile.joined },
  ];

  return (
    <SectionCard>
      <SectionHeader
        icon={Building2}
        title="Información corporativa"
        subtitle="Gestionado por Recursos Humanos"
      />

      <div className="px-5 py-4 space-y-3">
        {rows.map(({ label, value }) => (
          <div key={label}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {label}
            </p>
            <p className="mt-0.5 text-[13px] text-slate-700">
              {value ?? "—"}
            </p>
          </div>
        ))}

        <div className="pt-1">
          <a
            href="/rrhh/solicitudes"
            className="flex items-center gap-1 text-[12px] font-medium text-violet-600 hover:underline"
          >
            Solicitar cambio de información
            <ChevronRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Utilidades visuales                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Icono auxiliar de escudo utilizado en la tarjeta de 2FA.
 *
 * @param props Props SVG estándar.
 * @returns SVG de escudo.
 *
 * @remarks
 * Se define localmente para evitar dependencias externas adicionales
 * y mantener consistencia visual en la tarjeta.
 */
function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      {...props}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}