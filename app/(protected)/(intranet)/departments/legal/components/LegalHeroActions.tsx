/**
 * @module LegalHeroActions
 * Acciones principales del hero para el módulo jurídico.
 *
 * @remarks
 * Este componente renderiza un conjunto de botones de acción rápida
 * ubicados en el banner principal (hero) del área legal.
 *
 * Permite navegación directa a:
 * - Creación de nuevas solicitudes legales
 * - Gestión de contratos
 * - Módulo de compliance
 *
 * Está diseñado como Client Component debido al uso de navegación
 * programática mediante el hook {@link useRouter}.
 */

"use client";

import { FilePlus, FileSignature, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Componente de acciones del hero jurídico.
 *
 * @returns Botones interactivos para navegación rápida dentro del módulo legal.
 *
 * @remarks
 * Características principales:
 * - Navegación programática con `router.push`
 * - Estilo visual adaptado al hero (glassmorphism / overlay)
 * - Botones responsivos con soporte para wrap
 *
 * Consideraciones:
 * - No incluye validación de permisos interna; se asume control desde el padre
 *   (por ejemplo, {@link LegalHomePage})
 * - Pensado para acciones de alto nivel y acceso frecuente
 *
 * @example
 * ```tsx
 * <LegalHeroActions />
 * ```
 */
export default function LegalHeroActions() {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2">
      {/* Nueva solicitud */}
      <button
        onClick={() => router.push("/legal/requests/new")}
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white
                   bg-white/15 border border-white/25 backdrop-blur-sm
                   hover:bg-white/25 transition-all duration-200"
      >
        <FilePlus size={15} />
        Nueva solicitud
      </button>

      {/* Contratos */}
      <button
        onClick={() => router.push("/legal/contracts")}
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white/90
                   bg-white/10 border border-white/15 backdrop-blur-sm
                   hover:bg-white/20 transition-all duration-200"
      >
        <FileSignature size={15} />
        Contratos
      </button>

      {/* Compliance */}
      <button
        onClick={() => router.push("/legal/compliance")}
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white/90
                   bg-white/10 border border-white/15 backdrop-blur-sm
                   hover:bg-white/20 transition-all duration-200"
      >
        <ShieldCheck size={15} />
        Compliance
      </button>
    </div>
  );
}