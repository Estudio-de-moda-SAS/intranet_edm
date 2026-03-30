// ✅ SERVER COMPONENT

import { companyLeaders, type Leader } from "../config/edmLeaders";
import { LeaderCard }         from "./LeaderCard";
import { getLeaderPhotoUrl }  from "@/lib/graph/getLeaderPhotoUrl";

export async function CompanyLeadersSection() {
  const leaders = await Promise.all(
    companyLeaders.map(async (leader: Leader) => ({
      ...leader,
      photoUrl: leader.email
        ? await getLeaderPhotoUrl(leader.email)
        : null,
    }))
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
        <span className="h-[6px] w-[6px] flex-shrink-0 rounded-full bg-violet-600" />
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          Equipo directivo
        </p>
      </div>

      <div className="grid grid-cols-2">
        {leaders.map((leader, i) => (
          <LeaderCard
            key={leader.name + i}
            leader={leader}
            index={i}
            total={leaders.length}
          />
        ))}
      </div>
    </section>
  );
}