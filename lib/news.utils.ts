import type { AnnouncementCategory } from "@/types/announcement";

export function tileBgByCategory(cat: AnnouncementCategory) {
  switch (cat) {
    case 'TI':
      return 'from-violet-600 to-fuchsia-600';
    case 'RRHH':
      return 'from-rose-500 to-pink-500';
    case 'General':
      return 'from-amber-500 to-orange-500';
    default:
      return 'from-slate-500 to-slate-600';
  }
}