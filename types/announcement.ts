export type AnnouncementCategory = 'TI' | 'RRHH' | 'General';

export type Announcement = {
  id: string;
  title: string;
  excerpt?: string;
  date: string; // ISO
  category: AnnouncementCategory;
  imageUrl?: string;
};