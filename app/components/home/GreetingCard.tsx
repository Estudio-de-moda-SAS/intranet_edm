/**
 * @module GreetingCard
 * Contenido textual del saludo principal del usuario.
 *
 * @remarks
 * Solo muestra el nombre y el saludo dinámico. Los badges de cargo y
 * ubicación se quitaron a pedido — se consideraron redundantes con la
 * información que ya vive en "Mi Perfil", y el bloque completo (banner +
 * saludo) se buscaba más compacto.
 */

import { saludo } from "@/lib/format";
import type { User } from "@/types/home";

interface Props {
  /** Información del usuario a mostrar en el saludo. */
  user: User;
}

export function GreetingCard({ user }: Props) {
  return (
    <div>
     <h1 className="text-xl font-medium leading-snug tracking-tight sm:text-2xl text-violet-950 dark:text-[#e6edf3]">
        {saludo(user?.name)}{" "}
        <span
          className="inline-block origin-bottom-right"
          style={{ animation: "wave 1.8s ease-in-out 0.4s 1 forwards" }}
          aria-hidden
        >
          👋
        </span>
      </h1>

      <style>{`
        @keyframes wave {
          0%   { transform: rotate(0deg);  }
          15%  { transform: rotate(14deg); }
          30%  { transform: rotate(-8deg); }
          45%  { transform: rotate(14deg); }
          60%  { transform: rotate(-4deg); }
          75%  { transform: rotate(10deg); }
          100% { transform: rotate(0deg);  }
        }
      `}</style>
    </div>
  );
}