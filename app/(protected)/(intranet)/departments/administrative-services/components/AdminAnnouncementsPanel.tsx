// app/(protected)/(intranet)/departments/administrative/components/AdminAnnouncementsPanel.tsx
// SERVER COMPONENT

import { Megaphone, Pin } from "lucide-react";
import type { AdminData } from "@/lib/graph/departments/administrative.service";

type Props = { data: AdminData };

export default function AdminAnnouncementsPanel({ data }: Props) {
  const sorted = [...data.announcements].sort((a, b) =>
    a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1,
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 border border-amber-100">
          <Megaphone size={16} className="text-amber-600" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-800">Avisos del área</p>
          <p className="text-[11px] text-slate-400">Comunicados importantes</p>
        </div>
      </div>

      {/* Announcements */}
      <ul className="divide-y divide-slate-50">
        {sorted.map((ann) => (
          <li key={ann.id} className="px-5 py-4">
            <div className="flex items-start gap-2">
              {ann.pinned && (
                <Pin size={13} className="mt-0.5 shrink-0 text-amber-500" />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800">
                    {ann.title}
                  </p>
                  {ann.pinned && (
                    <span className="rounded-full bg-amber-50 border border-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                      Fijado
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                  {ann.body}
                </p>
                <p className="mt-1.5 text-[11px] text-slate-400">
                  {ann.publishedAt}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
