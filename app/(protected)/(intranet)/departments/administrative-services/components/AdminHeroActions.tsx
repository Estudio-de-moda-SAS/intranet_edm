/**
 * @module AdminHeroActions
 * Acciones principales del hero banner del módulo de Servicios Administrativos.
 *
 * Proporciona accesos rápidos a las operaciones más frecuentes del área,
 * incluyendo creación de solicitudes, gestión de tarjetas, reservas y
 * registro de visitantes.
 *
 * @remarks
 * Este componente actúa como punto central de interacción rápida dentro del
 * hero del módulo administrativo.
 *
 * Combina:
 * - navegación a páginas internas,
 * - apertura de modales de flujo (wizard),
 * - acceso directo a funcionalidades críticas del área.
 *
 * Es un Client Component debido al manejo de estado y eventos de interacción.
 */

// app/(protected)/(intranet)/departments/administrative/components/AdminHeroActions.tsx
"use client";

import { useState }       from "react";
import { useRouter }      from "next/navigation";
import { FilePlus, CreditCard, CalendarDays, UserCheck } from "lucide-react";
import NewRequestModal          from "./modals/NewRequestModal";
import AccessCardModal          from "./modals/AccessCardModal";
import VisitorRegistrationModal from "./modals/VisitorRegistrationModal";

/**
 * Renderiza el conjunto de acciones principales del hero administrativo.
 *
 * @returns Grupo de botones interactivos con acceso a funcionalidades clave.
 *
 * @remarks
 * Las acciones disponibles son:
 *
 * - **Nueva solicitud**
 *   Abre {@link NewRequestModal} para crear solicitudes administrativas.
 *
 * - **Tarjeta de acceso**
 *   Abre {@link AccessCardModal} para gestionar tarjetas de acceso.
 *
 * - **Reservar sala**
 *   Navega a la página de reservas:
 *   `/departments/administrative-services/room-booking`.
 *
 * - **Registrar visita**
 *   Abre {@link VisitorRegistrationModal} para pre-registrar visitantes.
 *
 * Cada acción está diseñada como acceso directo desde el hero para reducir
 * fricción en los flujos más utilizados del módulo.
 */
export default function AdminHeroActions() {
  /**
   * Router de Next.js para navegación programática.
   */
  const router = useRouter();

  /**
   * Estados de control de visibilidad de modales.
   */
  const [openRequest,  setOpenRequest]  = useState(false);
  const [openCard,     setOpenCard]     = useState(false);
  const [openVisitor,  setOpenVisitor]  = useState(false);

  return (
    <>
      {/* ── Botones del hero ────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">

        {/* Nueva solicitud */}
        <button
          onClick={() => setOpenRequest(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2
            text-sm font-semibold text-white backdrop-blur-sm border border-white/25
            hover:bg-white/25 transition-all duration-200"
        >
          <FilePlus size={15} />
          Nueva solicitud
        </button>

        {/* Tarjeta de acceso */}
        <button
          onClick={() => setOpenCard(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2
            text-sm font-medium text-white/90 backdrop-blur-sm border border-white/15
            hover:bg-white/20 transition-all duration-200"
        >
          <CreditCard size={15} />
          Tarjeta de acceso
        </button>

        {/* Reservar sala — navega a página */}
        <button
          onClick={() => router.push("/departments/administrative-services/room-booking")}
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2
            text-sm font-medium text-white/90 backdrop-blur-sm border border-white/15
            hover:bg-white/20 transition-all duration-200"
        >
          <CalendarDays size={15} />
          Reservar sala
        </button>

        {/* Registro de visita */}
        <button
          onClick={() => setOpenVisitor(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2
            text-sm font-medium text-white/90 backdrop-blur-sm border border-white/15
            hover:bg-white/20 transition-all duration-200"
        >
          <UserCheck size={15} />
          Registrar visita
        </button>
      </div>

      {/* ── Modales ─────────────────────────────────────────────── */}
      <NewRequestModal
        open={openRequest}
        onClose={() => setOpenRequest(false)}
      />
      <AccessCardModal
        open={openCard}
        onClose={() => setOpenCard(false)}
      />
      <VisitorRegistrationModal
        open={openVisitor}
        onClose={() => setOpenVisitor(false)}
      />
    </>
  );
}