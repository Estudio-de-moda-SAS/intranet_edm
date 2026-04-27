/**
 * @module app/settings/page
 * Página de configuración personal de la intranet EDM.
 *
 * @remarks
 * Server Component estático que compone el layout de la página de
 * configuración: un header decorativo con el título y un contenedor
 * para el shell interactivo {@link ConfigShell}.
 *
 * Toda la interactividad — gestión de pestañas, mutaciones de
 * preferencias, guardado y preview en tiempo real — está delegada
 * a {@link ConfigShell}, manteniendo este componente como Server
 * Component puro sin estado ni efectos.
 *
 * El fondo usa `var(--bg-base)` y el header usa `var(--bg-card)`
 * para adaptarse automáticamente al tema claro/oscuro sin clases
 * `dark:` adicionales.
 */

import type { Metadata } from "next";
import { Settings }      from "lucide-react";
import { ConfigShell }   from "./components/SettingsShell";

// ── Metadata ──────────────────────────────────────────────────────────────────

/**
 * Metadata de la página de configuración para el `<head>` del documento.
 * El título aparece en la pestaña del navegador y en los resultados
 * de búsqueda internos de la intranet.
 */
export const metadata: Metadata = {
  title: "Configuración — Intranet EDM",
};

// ── Página ────────────────────────────────────────────────────────────────────

/**
 * Página de configuración personal de la intranet EDM.
 *
 * @remarks
 * Compone dos secciones:
 *
 * 1. **Header estático** — muestra el título "Configuración" con un
 *    ícono de engranaje y un subtítulo descriptivo. Incluye un gradiente
 *    radial decorativo con opacidad baja (`0.06`) para añadir profundidad
 *    sin distraer del contenido. El gradiente es `pointer-events-none`
 *    y `aria-hidden` para no interferir con la interacción ni la
 *    accesibilidad.
 *
 * 2. **Shell interactivo** — monta {@link ConfigShell} dentro de un
 *    contenedor centrado con `max-w-5xl` para mantener una anchura
 *    de lectura cómoda en pantallas grandes.
 *
 * @example
 * ```
 * // Ruta: /settings
 * // Accesible para todos los colaboradores autenticados.
 * // No requiere permisos especiales — cada colaborador gestiona
 * // solo sus propias preferencias.
 * ```
 */
export default function ConfiguracionPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-base)" }}>

      {/* Header estático con título y gradiente decorativo */}
      <div
        className="relative overflow-hidden border-b"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor:     "var(--border)",
        }}
      >
        {/* Gradiente decorativo — no interactivo ni accesible */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            background: "radial-gradient(ellipse 70% 80% at 70% -20%, hsl(258,70%,55%), transparent)",
          }}
        />

        <div className="mx-auto max-w-5xl px-6 py-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl
                            bg-violet-600 shadow-md shadow-violet-200 dark:shadow-violet-900/30">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1
                className="text-xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Configuración
              </h1>
              <p
                className="text-[12px]"
                style={{ color: "var(--text-muted)" }}
              >
                Personaliza tu experiencia en la intranet
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Shell interactivo — gestiona pestañas, settings y guardado */}
      <div className="mx-auto max-w-5xl px-6 py-8">
        <ConfigShell />
      </div>

    </div>
  );
}