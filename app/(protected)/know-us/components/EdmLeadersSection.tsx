/**
 * @module CompanyLeadersSection
 * Sección del equipo directivo dentro de la página corporativa.
 *
 * @remarks
 * Este componente renderiza la lista de líderes de la organización,
 * enriqueciendo previamente los datos con la foto obtenida desde
 * Microsoft Graph cuando el correo corporativo está disponible.
 *
 * Es un **Server Component**, lo que permite:
 *
 * - resolver datos asincrónicos antes del render
 * - obtener fotos desde servicios externos sin exponer lógica al cliente
 * - mantener la vista del equipo directivo lista para renderizar
 *
 * La estructura visual final se delega al subcomponente {@link LeaderCard}.
 */

// ✅ SERVER COMPONENT

import { companyLeaders, type Leader } from "../config/edmLeaders";
import { LeaderCard } from "./LeaderCard";
import { getLeaderPhotoUrl } from "@/lib/graph/getLeaderPhotoUrl";

/* -------------------------------------------------------------------------- */
/* Tipos auxiliares                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Representa un líder enriquecido con la URL de su foto.
 *
 * @remarks
 * Extiende el modelo base {@link Leader} con `photoUrl`, permitiendo
 * a la UI decidir entre mostrar imagen real o fallback por iniciales.
 */
type LeaderWithPhoto = Leader & {
  photoUrl: string | null;
};

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Sección del equipo directivo.
 *
 * @returns Grid de líderes enriquecidos con foto opcional.
 *
 * @remarks
 * Flujo de ejecución:
 *
 * 1. Se toma la configuración base desde {@link companyLeaders}
 * 2. Para cada líder, si existe `email`, se consulta su foto con
 *    {@link getLeaderPhotoUrl}
 * 3. Se construye una nueva colección enriquecida con `photoUrl`
 * 4. Se renderiza cada elemento mediante {@link LeaderCard}
 *
 * Este patrón mantiene separadas:
 *
 * - la fuente de datos base (`companyLeaders`)
 * - la lógica de enriquecimiento (`getLeaderPhotoUrl`)
 * - la representación visual (`LeaderCard`)
 *
 * @example
 * ```tsx
 * <CompanyLeadersSection />
 * ```
 */
export async function CompanyLeadersSection() {
  /**
   * Lista de líderes enriquecida con foto resuelta desde Graph.
   */
  const leaders: LeaderWithPhoto[] = await Promise.all(
    companyLeaders.map(async (leader: Leader) => ({
      ...leader,
      photoUrl: leader.email
        ? await getLeaderPhotoUrl(leader.email)
        : null,
    }))
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
        <span className="h-[6px] w-[6px] flex-shrink-0 rounded-full bg-violet-600" />
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          Equipo directivo
        </p>
      </div>

      {/* Grid de líderes */}
      <div className="grid grid-cols-2">
        {leaders.map((leader, index) => (
          <LeaderCard
            key={`${leader.name}-${index}`}
            leader={leader}
            index={index}
            total={leaders.length}
          />
        ))}
      </div>
    </section>
  );
}