/**
 * @module app/settings/tabs/IntegrationsTab
 * Pestaña de configuración de integraciones con servicios externos
 * de la intranet EDM.
 *
 * @remarks
 * Muestra el catálogo de integraciones disponibles definido en
 * `settingsValues.ts` y permite al colaborador conectar o desconectar
 * cada servicio mediante un toggle. Las integraciones conectadas
 * muestran un enlace adicional para acceder a su configuración
 * detallada.
 *
 * El estado de conexión de cada integración se gestiona como un
 * `Record<string, boolean>` indexado por el `id` de la integración,
 * lo que permite añadir nuevas integraciones a `INTEGRATIONS` sin
 * modificar este componente.
 */

"use client";

import { ChevronRight }             from "lucide-react";
import { SectionCard, Toggle }      from "@/app/components/ui/IntranetUI";
import { INTEGRATIONS }             from "@/app/(protected)/settings/config/settingsValues";

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Props del componente {@link IntegrationsTab}.
 */
interface Props {
  /**
   * Estado de conexión de cada integración, indexado por su `id`.
   * `true` indica que la integración está actualmente conectada.
   * Si un `id` no está presente, se trata como `false` (desconectado).
   */
  settings: Record<string, boolean>;

  /**
   * Callback invocado cuando el colaborador cambia el estado de
   * conexión de una integración.
   *
   * @param id        - Identificador de la integración modificada.
   * @param connected - Nuevo estado de conexión (`true` = conectado).
   */
  onChange: (id: string, connected: boolean) => void;
}

// ── Componente ────────────────────────────────────────────────────────────────

/**
 * Pestaña de integraciones de la página de configuración personal.
 *
 * @remarks
 * Componente controlado — no gestiona estado propio. Renderiza una
 * grilla de 2 columnas en pantallas `sm+` con una tarjeta por cada
 * integración definida en `INTEGRATIONS`.
 *
 * Cada tarjeta muestra:
 * - Ícono y nombre de la integración.
 * - Badge de estado (`Conectado` / `Desconectado`).
 * - Toggle para conectar o desconectar.
 * - Descripción del servicio.
 * - Enlace "Configurar" visible solo cuando la integración está conectada.
 *
 * Al final de la lista incluye un enlace a `/soporte/solicitud` para
 * que el colaborador pueda solicitar integraciones no disponibles.
 *
 * @param props - Ver {@link Props}.
 *
 * @example
 * ```tsx
 * <IntegrationsTab
 *   settings={settings.integrations}
 *   onChange={updateIntegration}
 * />
 * ```
 */
export function IntegrationsTab({ settings, onChange }: Props) {
  const isConnected = (id: string): boolean => settings[id] ?? false;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {INTEGRATIONS.map((intg) => (
          <SectionCard key={intg.id}>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${intg.color}`}
                    aria-hidden="true"
                  >
                    {intg.icon}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800">
                      {intg.name}
                    </p>
                    <span
                      className={`inline-block rounded-full px-2 py-px text-[10px] font-semibold transition-colors ${
                        isConnected(intg.id)
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {isConnected(intg.id) ? "Conectado" : "Desconectado"}
                    </span>
                  </div>
                </div>
                <Toggle
                  size="sm"
                  value={isConnected(intg.id)}
                  onChange={(v) => onChange(intg.id, v)}
                />
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
                {intg.desc}
              </p>
              {isConnected(intg.id) && (
                <button className="mt-3 flex items-center gap-1 text-[11px] font-medium text-violet-600 hover:underline">
                  Configurar <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>
          </SectionCard>
        ))}
      </div>
      <p className="text-center text-[11px] text-slate-400 py-2">
        ¿Necesitas otra integración?{" "}
        <a href="/soporte/solicitud" className="font-medium text-violet-600 hover:underline">
          Solicítala al equipo de TI
        </a>
      </p>
    </div>
  );
}