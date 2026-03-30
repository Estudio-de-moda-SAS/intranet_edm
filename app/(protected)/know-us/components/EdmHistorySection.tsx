// ✅ SERVER COMPONENT

import { companyHistory } from "../config/edmHistory";

export function CompanyHistorySection() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
        <span className="h-[6px] w-[6px] flex-shrink-0 rounded-full bg-violet-600" />
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          Nuestra historia
        </p>
      </div>

      <div className="grid grid-cols-3">
        {companyHistory.map((item, i) => (
          <div
            key={item.year}
            className="group px-6 py-5 transition-colors hover:bg-violet-50/50 dark:hover:bg-gray-800"
            style={{
              borderRight  : (i + 1) % 3 !== 0 ? "0.5px solid rgb(226 232 240)" : "none",
              borderBottom : i < companyHistory.length - 3 ? "0.5px solid rgb(226 232 240)" : "none",
            }}
          >
            <p
              className="mb-1.5 text-[26px] font-bold leading-none text-violet-700"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {item.year}
            </p>
            <p className="mb-1 text-[13px] font-semibold leading-snug text-slate-700 dark:text-slate-200">
              {item.title}
            </p>
            <p className="text-[12px] leading-[1.55] text-slate-400 dark:text-slate-400">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}