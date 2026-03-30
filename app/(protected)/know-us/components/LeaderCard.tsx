// ✅ SERVER COMPONENT

type Props = {
  leader: {
    name: string;
    role: string;
    area: string;
    initials?: string;
    photoUrl: string | null;
  };
  index: number;
  total: number;
};

export function LeaderCard({ leader, index, total }: Props) {
  const isRightCol = index % 2 !== 0;
  const isLastRow  = index >= total - 2;

  return (
    <div
      className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-violet-50/50 dark:hover:bg-gray-800"
      style={{
        borderRight : !isRightCol ? "0.5px solid rgb(226 232 240)" : "none",
        borderBottom: !isLastRow  ? "0.5px solid rgb(226 232 240)" : "none",
      }}
    >
      {/* Avatar — foto MS Graph o iniciales */}
      {leader.photoUrl ? (
        <img
          src={leader.photoUrl}
          alt={leader.name}
          width={40}
          height={40}
          className="h-10 w-10 flex-shrink-0 rounded-full object-cover ring-2 ring-violet-100"
        />
      ) : (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-violet-600 text-[12px] font-bold tracking-wide text-white">
          {leader.initials ?? leader.name.slice(0, 2).toUpperCase()}
        </div>
      )}

      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold leading-tight text-slate-700 dark:text-slate-200">
          {leader.name}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-slate-400">
          {leader.role} · {leader.area}
        </p>
      </div>
    </div>
  );
}
