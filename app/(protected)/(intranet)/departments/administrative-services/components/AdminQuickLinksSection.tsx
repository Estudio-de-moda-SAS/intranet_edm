/**
 * @module AdminQuickLinksSection
 * Sección de accesos rápidos del módulo de Servicios Administrativos.
 *
 * Renderiza un conjunto de acciones frecuentes (quick links) adaptadas
 * dinámicamente según el nivel de acceso del usuario.
 *
 * @remarks
 * Este componente:
 * - filtra y configura accesos mediante {@link processQuickLinks},
 * - conecta ciertos accesos a acciones internas (modales),
 * - delega el render visual en {@link QuickLinksSection},
 * - controla la apertura de flujos interactivos como:
 *   - nueva solicitud,
 *   - gestión de tarjetas de acceso,
 *   - registro de visitantes.
 *
 * Es un punto clave de integración entre:
 * - configuración (adminQuickLinks),
 * - permisos (AccessLevel),
 * - UI (QuickLinksSection),
 * - lógica de interacción (modales).
 */

// app/(protected)/(intranet)/departments/administrative/components/AdminQuickLinksSection.tsx
"use client";

import { useState }                    from "react";
import { QuickLinksSection }           from "@/app/components/ui/QuickLinksSection";
import { adminQuickLinks }             from "../config/adminQuickLinks";
import { processQuickLinks }           from "@/lib/quickLinksAccess";
import type { AccessLevel }            from "@/lib/roles";

import NewRequestModal          from "./modals/NewRequestModal";
import AccessCardModal          from "./modals/AccessCardModal";
import VisitorRegistrationModal from "./modals/VisitorRegistrationModal";

/**
 * Propiedades de {@link AdminQuickLinksSection}.
 *
 * @property accessLevel Nivel de acceso del usuario actual.
 */
interface Props {
  accessLevel: AccessLevel;
}

/**
 * Componente que renderiza los accesos rápidos administrativos con lógica
 * de permisos y acciones interactivas.
 *
 * @param props Propiedades del componente.
 * @returns Sección de accesos rápidos con modales asociados.
 *
 * @remarks
 * Flujo interno:
 *
 * 1. Se obtienen los accesos base desde {@link adminQuickLinks}.
 * 2. Se filtran y configuran según permisos con {@link processQuickLinks}.
 * 3. Se interceptan ciertos enlaces (`href`) para convertirlos en acciones
 *    que abren modales en lugar de navegación directa.
 * 4. Se renderiza la UI mediante {@link QuickLinksSection}.
 * 5. Se controlan los modales según el estado local `open`.
 *
 * Esto permite desacoplar:
 * - la configuración de accesos,
 * - la lógica de permisos,
 * - la ejecución de acciones (modales).
 */
export function AdminQuickLinksSection({ accessLevel }: Props) {

  /**
   * Estado que controla qué modal está abierto.
   *
   * Valores posibles:
   * - `"new_request"` → modal de nueva solicitud
   * - `"access_card"` → gestión de tarjetas
   * - `"visitor"` → registro de visitantes
   * - `null` → ningún modal abierto
   */
  const [open, setOpen] = useState<"new_request" | "access_card" | "visitor" | null>(null);

  /**
   * Procesa los accesos rápidos según permisos y asigna acciones
   * a aquellos que deben abrir modales en lugar de navegar.
   *
   * @remarks
   * Se interceptan rutas específicas (`href`) para:
   * - evitar navegación,
   * - ejecutar acciones controladas desde el componente.
   */
  const links = processQuickLinks(adminQuickLinks, accessLevel).map((link) => {

    /**
     * Nueva solicitud → abre modal
     */
    if (link.href === "/administrative/requests/new") {
      return { ...link, action: () => setOpen("new_request") };
    }

    /**
     * Tarjetas de acceso → abre modal
     */
    if (link.href === "/administrative/access-cards") {
      return { ...link, action: () => setOpen("access_card") };
    }

    /**
     * Registro de visitantes → abre modal
     */
    if (link.href === "/administrative/visitors") {
      return { ...link, action: () => setOpen("visitor") };
    }

    /**
     * Links sin acción especial → navegación normal
     */
    return link;
  });

  return (
    <>
      <QuickLinksSection
        title="Accesos rápidos · Admin"
        quickLinks={links}
      />

      {/* ── Modales ───────────────────────────────────────────── */}

      <NewRequestModal
        open={open === "new_request"}
        onClose={() => setOpen(null)}
      />

      <AccessCardModal
        open={open === "access_card"}
        onClose={() => setOpen(null)}
      />

      <VisitorRegistrationModal
        open={open === "visitor"}
        onClose={() => setOpen(null)}
      />
    </>
  );
}