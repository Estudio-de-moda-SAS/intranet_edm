/**
 * @module app/settings/SettingsShell
 * Shell principal de la página de configuración personal de la
 * intranet EDM.
 *
 * @remarks
 * Orquesta todos los elementos de la página de configuración:
 * sidebar de navegación entre pestañas, panel de contenido activo
 * y barra de guardado. Es el componente raíz que monta en
 * `app/(protected)/settings/page.tsx`.
 *
 * **Responsabilidades:**
 * - Gestiona la pestaña activa mediante estado local.
 * - Conecta {@link useSettings} para leer y mutar las preferencias.
 * - Conecta {@link useApplySettings} para preview en tiempo real.
 * - Publica la altura del header en `--header-h` para que el sidebar
 *   calcule su posición sticky de forma dinámica.
 *
 * **Flujo de guardado:**
 * 1. El colaborador modifica una preferencia → se refleja en la UI
 *    inmediatamente gracias a {@link useApplySettings}.
 * 2. `dirty` se vuelve `true` → aparece la `SaveBar`.
 * 3. El colaborador presiona "Guardar" → `save()` persiste en
 *    `localStorage` y dispara `edm:settings-changed`.
 * 4. El colaborador presiona "Descartar" → `discard()` restaura
 *    los valores guardados.
 */

"use client";

import { useState, useEffect }  from "react";
import { useSettings }          from "../hooks/useSettings";
import { useApplySettings }     from "../hooks/useApplySettings";
import { ConfigSidebar }        from "./ConfigSidebar";
import { NotificationsTab }     from "./tabs/NotificationsTab";
import { AppearanceTab }        from "./tabs/AppearanceTab";
import { AccessibilityTab }     from "./tabs/AccessibilityTab";
import { IntegrationsTab }      from "./tabs/IntegrationsTab";
import { SaveBar }              from "./SaveBar";
import type {
  ConfigTab,
  NotificationSettings,
  AppearanceSettings,
  AccessibilitySettings,
} from "@/config/settings";

// ── Constantes ────────────────────────────────────────────────────────────────

/**
 * Metadatos de cada pestaña de configuración para el encabezado
 * del panel de contenido.
 *
 * @remarks
 * El `label` se muestra como título del panel activo y el
 * `description` como subtítulo descriptivo bajo el título.
 * Centralizado aquí para evitar duplicar strings en los componentes
 * de cada pestaña.
 */
const TAB_META: Record<ConfigTab, { label: string; description: string }> = {
  notifications: {
    label:       "Notificaciones",
    description: "Canales y eventos que te notifican",
  },
  appearance: {
    label:       "Apariencia",
    description: "Tema, colores y densidad de la interfaz",
  },
  accessibility: {
    label:       "Accesibilidad",
    description: "Fuente, contraste y opciones de movilidad",
  },
  integrations: {
    label:       "Integraciones",
    description: "Apps conectadas a la intranet corporativa",
  },
};

// ── Hooks internos ────────────────────────────────────────────────────────────

/**
 * Hook interno que observa la altura del header sticky y la publica
 * como variable CSS `--header-h` en el elemento `<html>`.
 *
 * @remarks
 * Permite que el sidebar de configuración calcule su posición
 * `sticky` de forma dinámica sin hardcodear una altura fija.
 * Usa `ResizeObserver` para actualizar la variable si el header
 * cambia de altura (ej. al colapsar en móvil).
 *
 * La variable se usa en el estilo inline del `<nav>`:
 * ```tsx
 * style={{ top: 'calc(var(--header-h, 112px) + 1.5rem)' }}
 * ```
 * El valor de fallback `112px` cubre el caso de SSR donde
 * `--header-h` aún no está disponible.
 */
function useHeaderHeight(): void {
  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;

    const update = () => {
      document.documentElement.style.setProperty(
        "--header-h",
        `${header.getBoundingClientRect().height}px`,
      );
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);
}

// ── Componente principal ──────────────────────────────────────────────────────

/**
 * Shell principal de la página de configuración personal.
 *
 * @remarks
 * Layout de dos columnas en desktop (sidebar + contenido) y una
 * columna en móvil. El sidebar tiene posición sticky relativa al
 * header real, calculada dinámicamente por {@link useHeaderHeight}.
 *
 * Cada pestaña recibe sus `settings` actuales y un callback `onChange`
 * tipado que actualiza solo la sección correspondiente en el store de
 * `useSettings`, manteniendo el resto de preferencias intactas.
 *
 * @example
 * ```tsx
 * // app/(protected)/settings/page.tsx
 * import { ConfigShell } from "./components/SettingsShell";
 *
 * export default function SettingsPage() {
 *   return <ConfigShell />;
 * }
 * ```
 */
export function ConfigShell() {
  const [activeTab, setActiveTab] = useState<ConfigTab>("notifications");

  const {
    settings,
    dirty,
    saveStatus,
    save,
    discard,
    updateNotifications,
    updateAppearance,
    updateAccessibility,
    updateIntegration,
  } = useSettings();

  useApplySettings(settings.appearance, settings.accessibility);
  useHeaderHeight();

  const { label, description } = TAB_META[activeTab];

  return (
    <div className="flex flex-col lg:flex-row gap-8">

      {/* Sidebar de navegación entre pestañas */}
      <aside className="w-full lg:w-56 shrink-0">
        <nav
          className="space-y-1 lg:sticky"
          style={{ top: "calc(var(--header-h, 112px) + 1.5rem)" }}
          aria-label="Secciones de configuración"
        >
          <ConfigSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </nav>
      </aside>

      {/* Panel de contenido de la pestaña activa */}
      <main className="flex-1 min-w-0">
        <div className="mb-5">
          <h2 className="text-[17px] font-bold text-slate-900">{label}</h2>
          <p className="mt-0.5 text-[12px] text-slate-400">{description}</p>
        </div>

        {activeTab === "notifications" && (
          <NotificationsTab
            settings={settings.notifications}
            onChange={(key: keyof NotificationSettings, value: boolean) =>
              updateNotifications(key, value)
            }
          />
        )}
        {activeTab === "appearance" && (
          <AppearanceTab
            settings={settings.appearance}
            onChange={(
              key: keyof AppearanceSettings,
              value: AppearanceSettings[keyof AppearanceSettings],
            ) => updateAppearance(key, value)}
          />
        )}
        {activeTab === "accessibility" && (
          <AccessibilityTab
            settings={settings.accessibility}
            onChange={(
              key: keyof AccessibilitySettings,
              value: AccessibilitySettings[keyof AccessibilitySettings],
            ) => updateAccessibility(key, value)}
          />
        )}
        {activeTab === "integrations" && (
          <IntegrationsTab
            settings={settings.integrations}
            onChange={updateIntegration}
          />
        )}
      </main>

      {/* Barra de guardado — visible solo cuando hay cambios sin guardar */}
      <SaveBar
        dirty={dirty}
        saveStatus={saveStatus}
        onSave={save}
        onDiscard={discard}
      />
    </div>
  );
}