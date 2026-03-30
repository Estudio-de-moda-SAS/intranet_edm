// ─────────────────────────────────────────────────────────────────
// @/types/home.ts
// Tipos centrales para la página principal de la intranet.
// ─────────────────────────────────────────────────────────────────

// ── Usuario ───────────────────────────────────────────────────────

export type User = {
  id: string;
  name: string;
  role: string;
  location?: string;
  /** URL del avatar. Si está ausente, se generan iniciales. */
  avatarUrl?: string;
  /** Departamento o área organizacional */
  department?: string;
};

// ── Anuncios / Noticias ───────────────────────────────────────────

export type AnnouncementCategory =
  | "general"
  | "rrhh"
  | "tecnologia"
  | "finanzas"
  | "operaciones"
  | "comunicado";

export type Announcement = {
  id: string;
  title: string;
  summary: string;
  /** ISO date string */
  publishedAt: string;
  category?: AnnouncementCategory;
  /** URL de imagen de portada opcional */
  imageUrl?: string;
  /** Slug o ruta de detalle */
  href?: string;
  isPinned?: boolean;
};

// ── Eventos ───────────────────────────────────────────────────────

export type EventCategory =
  | "formacion"
  | "reunion"
  | "social"
  | "capacitacion"
  | "otro";

export type EventAttachment = {
  label: string;
  url: string;
};

/** Estado de asistencia del usuario al evento */
export type EventAttendance = "confirmed" | "declined" | "tentative" | null;

export type Event = {
  id: string;
  title: string;
  /** ISO date string (fecha del evento) */
  date: string;
  /** Hora legible, ej. "10:00 AM" */
  time?: string;
  location?: string;
  category?: EventCategory;
  description?: string;
  /** Persona o área responsable del evento */
  organizer?: string;
  /** URL de imagen para el banner del modal */
  bannerUrl?: string;
  /** Archivos o enlaces adjuntos */
  attachments?: EventAttachment[];
  /** URL de detalle del evento */
  href?: string;
  /** Estado de asistencia del usuario actual */
  attendance?: EventAttendance;
};

// ── Accesos rápidos ───────────────────────────────────────────────

export type QuickLink = {
  label: string;
  href: string;
  /** Nombre de ícono Lucide o emoji de fallback */
  icon?: string;
  emoji?: string;
  /** Abre en pestaña nueva */
  external?: boolean;
};

// ── Cumpleaños ────────────────────────────────────────────────────

export type Birthday = {
  id: string;
  name: string;
  /** ISO date string */
  date: string;
  area?: string;
  avatarUrl?: string;
};

// ── Tareas ────────────────────────────────────────────────────────

export type TaskPriority = "alta" | "media" | "baja";

// "bloqueada" agregado para soportar TaskDetail en el drawer
export type TaskStatus =
  | "pendiente"
  | "en_progreso"
  | "completada"
  | "bloqueada";

export type Task = {
  id: string;
  title: string;
  /** ISO date string */
  due: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  href?: string;
};

// ── Líderes ───────────────────────────────────────────────────────

export type Leader = {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  department?: string;
  href?: string;
};

// ── Stats / KPIs ──────────────────────────────────────────────────

export type StatItem = {
  label: string;
  value: string | number;
  delta?: string;
  /** Tendencia respecto al período anterior */
  trend?: "up" | "down" | "neutral";
};

// ── HomeData (agregado raíz) ──────────────────────────────────────

export type HomeData = {
  user: User;
  announcements: Announcement[];
  events: Event[];
  birthdays: Birthday[];
  tasks: Task[];
  quickLinks: QuickLink[];
  leaders?: Leader[];
  stats?: StatItem[];
};