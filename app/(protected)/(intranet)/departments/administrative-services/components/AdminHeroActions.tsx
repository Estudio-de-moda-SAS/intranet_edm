// app/(protected)/(intranet)/departments/administrative/components/AdminHeroActions.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Botones del hero banner. Abre:
//   · Nueva solicitud  → NewRequestModal
//   · Tarjeta de acceso → AccessCardModal
//   · Reservar sala    → /departments/administrative/rooms (página)
//   · Registro visita  → VisitorRegistrationModal
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { useState }       from "react";
import { useRouter }      from "next/navigation";
import { FilePlus, CreditCard, CalendarDays, UserCheck } from "lucide-react";
import NewRequestModal          from "./modals/NewRequestModal";
import AccessCardModal          from "./modals/AccessCardModal";
import VisitorRegistrationModal from "./modals/VisitorRegistrationModal";

export default function AdminHeroActions() {
  const router = useRouter();

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