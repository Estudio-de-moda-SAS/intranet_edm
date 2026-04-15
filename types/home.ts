/**
 * @module types/home
 * Tipos centrales para la página principal de la intranet EDM.
 *
 * @remarks
 * Define todas las estructuras de datos que componen el dashboard del
 * homepage: usuario, anuncios, eventos, accesos rápidos, cumpleaños,
 * tareas, líderes y KPIs. El tipo raíz {@link HomeData} es el contrato
 * entre el service `getHomeData` (`home.service.ts`) y los componentes de UI.
 */

// ── Usuario ───────────────────────────────────────────────────────────────────

/**
 * Perfil básico del colaborador autenticado para mostrar en el homepage.
 *
 * @remarks
 * Versión reducida del perfil de Entra ID con solo los campos necesarios
 * para la UI del homepage. Para el perfil completo con todos los campos
 * de Graph, ver el tipo `AppUser` en `lib/roles.ts`.
 *
 * Cuando `avatarUrl` no está disponible, el componente de avatar debe
 * generar las iniciales a partir de `name`.
 */
export type User = {
  /** Object ID del usuario en Azure AD. */
  id: string;

  /** Nombre display del colaborador. */
  name: string;

  /** Cargo del colaborador (ej. `"Aprendiz TI 2"`). */
  role: string;

  /**
   * Ciudad o sede donde trabaja el colaborador
   * (ej. `"Bogotá"`, `"Medellín"`).
   * `undefined` si no está configurada en Entra ID.
   */
  location?: string;

  /**
   * URL del avatar del colaborador.
   * `undefined` si no tiene foto — el componente genera iniciales
   * a partir de `name` como fallback.
   */
  avatarUrl?: string;

  /**
   * Nombre del departamento u área organizacional del colaborador.
   * `undefined` si no está configurado en Entra ID.
   */
  department?: string;
};

// ── Anuncios ──────────────────────────────────────────────────────────────────

/**
 * Categoría de un anuncio en el homepage.
 *
 * @remarks
 * A diferencia de {@link AnnouncementCategory} en `types/announcement.ts`
 * que se deriva de `DEPARTMENTS` (`lib/config.ts`), este tipo es independiente y
 * está orientado a la clasificación interna del homepage.
 *
 * | Valor         | Descripción                          |
 * |---------------|--------------------------------------|
 * | `general`     | Comunicado general corporativo       |
 * | `rrhh`        | Comunicado de Recursos Humanos       |
 * | `tecnologia`  | Comunicado de Tecnología             |
 * | `finanzas`    | Comunicado de Finanzas               |
 * | `operaciones` | Comunicado de Operaciones            |
 * | `comunicado`  | Comunicado oficial de dirección      |
 */
export type AnnouncementCategory =
  | "general"
  | "rrhh"
  | "tecnologia"
  | "finanzas"
  | "operaciones"
  | "comunicado";

/**
 * Anuncio o noticia corporativa mostrada en el homepage.
 *
 * @remarks
 * Los anuncios del homepage tienen una estructura más rica que los
 * anuncios de departamento — incluyen `isPinned`, `href` y `summary`
 * además de los campos básicos. Los campos opcionales permiten mostrar
 * tarjetas con distintos niveles de detalle según la fuente de datos.
 */
export type Announcement = {
  /** Identificador único del anuncio. */
  id: string;

  /** Título del anuncio. */
  title: string;

  /** Resumen del contenido del anuncio para mostrar en la tarjeta. */
  summary: string;

  /** Fecha de publicación en formato ISO 8601 (ej. `"2026-03-10T00:00:00Z"`). */
  publishedAt: string;

  /** Categoría del anuncio para filtrado y estilo visual. */
  category?: AnnouncementCategory;

  /**
   * URL de imagen de portada del anuncio.
   * `undefined` si no tiene imagen — se muestra un placeholder.
   */
  imageUrl?: string;

  /**
   * Slug o ruta de detalle del anuncio para navegación.
   * `undefined` si el anuncio no tiene página de detalle.
   */
  href?: string;

  /**
   * Si es `true`, el anuncio se ancla en la parte superior de la lista
   * independientemente de su fecha de publicación.
   */
  isPinned?: boolean;
};

// ── Eventos ───────────────────────────────────────────────────────────────────

/**
 * Categoría de un evento del calendario corporativo.
 *
 * | Valor         | Descripción                          |
 * |---------------|--------------------------------------|
 * | `formacion`   | Taller o programa de formación       |
 * | `reunion`     | Reunión de equipo o departamento     |
 * | `social`      | Evento social o de integración       |
 * | `capacitacion`| Capacitación o curso obligatorio     |
 * | `otro`        | Otros tipos de eventos               |
 */
export type EventCategory =
  | "formacion"
  | "reunion"
  | "social"
  | "capacitacion"
  | "otro";

/**
 * Archivo o enlace adjunto a un evento del calendario.
 */
export type EventAttachment = {
  /** Texto descriptivo del adjunto (ej. `"Agenda del evento"`). */
  label: string;

  /** URL de descarga o visualización del adjunto. */
  url: string;
};

/**
 * Estado de asistencia del colaborador autenticado a un evento.
 *
 * | Valor       | Descripción                              |
 * |-------------|------------------------------------------|
 * | `confirmed` | Asistencia confirmada                    |
 * | `declined`  | Asistencia rechazada                     |
 * | `tentative` | Asistencia tentativa o por confirmar     |
 * | `null`      | Sin respuesta del colaborador            |
 */
export type EventAttendance = "confirmed" | "declined" | "tentative" | null;

/**
 * Evento del calendario corporativo mostrado en el homepage.
 *
 * @remarks
 * Los eventos se obtienen desde el calendario personal del colaborador
 * en Microsoft Graph (`/me/events`) en producción. Los campos opcionales
 * enriquecen la tarjeta del evento cuando la información está disponible
 * en Graph o en la fuente de datos del evento.
 */
export type Event = {
  /** Identificador único del evento en Graph o en el sistema de calendarios. */
  id: string;

  /** Título del evento. */
  title: string;

  /** Fecha del evento en formato ISO 8601. */
  date: string;

  /**
   * Hora legible del evento (ej. `"10:00 AM"`).
   * `undefined` para eventos de día completo.
   */
  time?: string;

  /**
   * Lugar físico o virtual del evento (ej. `"Auditorio Principal"`,
   * `"Teams"`).
   * `undefined` si no tiene ubicación configurada.
   */
  location?: string;

  /** Categoría del evento para filtrado y estilo visual. */
  category?: EventCategory;

  /** Descripción detallada del evento para mostrar en el modal de detalle. */
  description?: string;

  /**
   * Persona o área responsable de organizar el evento.
   * `undefined` si no está especificado.
   */
  organizer?: string;

  /**
   * URL de imagen para el banner del modal de detalle del evento.
   * `undefined` si no tiene imagen configurada.
   */
  bannerUrl?: string;

  /**
   * Archivos o enlaces adjuntos al evento (agenda, presentación, etc.).
   * `undefined` o array vacío si no hay adjuntos.
   */
  attachments?: EventAttachment[];

  /**
   * URL de la página de detalle del evento.
   * `undefined` si el evento no tiene página de detalle.
   */
  href?: string;

  /**
   * Estado de asistencia del colaborador autenticado al evento.
   * `undefined` si aún no ha respondido o si el dato no está disponible.
   */
  attendance?: EventAttendance;
};

// ── Accesos rápidos ───────────────────────────────────────────────────────────

/**
 * Acceso rápido del homepage para navegación frecuente.
 *
 * @remarks
 * Los quick links del homepage son distintos a los de los dashboards
 * de departamento — no tienen control de acceso por permiso. Son
 * accesos directos personalizables por el colaborador o configurados
 * por el administrador.
 */
export type QuickLink = {
  /** Texto descriptivo del acceso rápido. */
  label: string;

  /** Ruta interna o URL externa del destino. */
  href: string;

  /**
   * Nombre del ícono de Lucide React a mostrar.
   * `undefined` si se usa `emoji` como fallback.
   */
  icon?: string;

  /**
   * Emoji de fallback cuando no hay ícono de Lucide disponible.
   * `undefined` si se usa `icon`.
   */
  emoji?: string;

  /**
   * Si es `true`, el enlace se abre en una pestaña nueva.
   * Usado para URLs externas fuera de la intranet.
   */
  external?: boolean;
};

// ── Cumpleaños ────────────────────────────────────────────────────────────────

/**
 * Cumpleaños de un colaborador para el widget del homepage.
 *
 * @remarks
 * En producción se obtiene desde el campo `birthday` de `/v1.0/users`
 * en Graph, que requiere el scope `User.ReadBasic.All`. Cuando
 * `avatarUrl` no está disponible, el componente muestra las iniciales
 * del colaborador.
 */
export type Birthday = {
  /** Object ID del colaborador en Azure AD. */
  id: string;

  /** Nombre display del colaborador. */
  name: string;

  /** Fecha de cumpleaños en formato ISO 8601 (ej. `"2026-03-10"`). */
  date: string;

  /**
   * Área o departamento del colaborador.
   * `undefined` si no está configurado en Entra ID.
   */
  area?: string;

  /**
   * URL del avatar del colaborador.
   * `undefined` si no tiene foto — se muestran iniciales como fallback.
   */
  avatarUrl?: string;
};

// ── Tareas ────────────────────────────────────────────────────────────────────

/**
 * Nivel de prioridad de una tarea del colaborador.
 *
 * | Valor  | Descripción        |
 * |--------|--------------------|
 * | `alta` | Prioridad alta     |
 * | `media`| Prioridad media    |
 * | `baja` | Prioridad baja     |
 */
export type TaskPriority = "alta" | "media" | "baja";

/**
 * Estado de una tarea del colaborador.
 *
 * | Valor        | Descripción                              |
 * |--------------|------------------------------------------|
 * | `pendiente`  | Sin iniciar                              |
 * | `en_progreso`| En proceso de realización                |
 * | `completada` | Finalizada                               |
 * | `bloqueada`  | Bloqueada por una dependencia externa    |
 */
export type TaskStatus =
  | "pendiente"
  | "en_progreso"
  | "completada"
  | "bloqueada";

/**
 * Tarea pendiente del colaborador obtenida desde Microsoft To Do.
 *
 * @remarks
 * En producción se obtiene desde `/me/todo/lists/{listId}/tasks` en
 * Graph mediante `getAllPendingTasks` o `getHighPriorityTasks` de
 * `todo.helper.ts`. Los campos `priority`, `status` y `href` son
 * opcionales porque no siempre están disponibles en la respuesta de Graph.
 */
export type Task = {
  /** Identificador único de la tarea en Microsoft To Do. */
  id: string;

  /** Título de la tarea. */
  title: string;

  /** Fecha límite de la tarea en formato ISO 8601. */
  due: string;

  /**
   * Nivel de prioridad de la tarea.
   * `undefined` si no está asignada o no está disponible en Graph.
   */
  priority?: TaskPriority;

  /**
   * Estado actual de la tarea.
   * `undefined` si no está disponible en la fuente de datos.
   */
  status?: TaskStatus;

  /**
   * URL de detalle o edición de la tarea.
   * `undefined` si la tarea no tiene página de detalle.
   */
  href?: string;
};

// ── Líderes ───────────────────────────────────────────────────────────────────

/**
 * Líder o directivo mostrado en el widget de liderazgo del homepage.
 *
 * @remarks
 * Los líderes se configuran manualmente o se obtienen desde Graph
 * filtrando por cargo o grupo de Azure AD. Cuando `avatarUrl` no está
 * disponible, el componente muestra las iniciales del nombre.
 */
export type Leader = {
  /** Object ID del líder en Azure AD. */
  id: string;

  /** Nombre display del líder. */
  name: string;

  /** Cargo del líder (ej. `"Director de TI"`). */
  role: string;

  /**
   * URL del avatar del líder.
   * `undefined` si no tiene foto — se muestran iniciales como fallback.
   */
  avatarUrl?: string;

  /**
   * Departamento del líder.
   * `undefined` si no está configurado.
   */
  department?: string;

  /**
   * URL del perfil del líder en la intranet.
   * `undefined` si no tiene página de perfil.
   */
  href?: string;
};

// ── Stats / KPIs ──────────────────────────────────────────────────────────────

/**
 * Ítem de estadística o KPI para los widgets de métricas del homepage.
 *
 * @remarks
 * Estructura genérica reutilizable en cualquier widget de KPIs.
 * El campo `delta` es la variación en formato legible (ej. `"+8.2%"`,
 * `"−3 tickets"`). El campo `trend` determina el color e ícono de la
 * variación en la UI.
 */
export type StatItem = {
  /** Etiqueta descriptiva del indicador (ej. `"Ventas del mes"`). */
  label: string;

  /** Valor actual del indicador, formateado para mostrar en la UI. */
  value: string | number;

  /**
   * Variación respecto al período anterior en formato legible
   * (ej. `"+8.2%"`, `"−3 tickets"`).
   * `undefined` si no hay dato de comparación disponible.
   */
  delta?: string;

  /**
   * Tendencia de la variación para determinar color e ícono en la UI.
   * `undefined` si no hay dato de tendencia disponible.
   */
  trend?: "up" | "down" | "neutral";
};

// ── HomeData ──────────────────────────────────────────────────────────────────

/**
 * Agregado raíz de datos del homepage de la intranet EDM.
 *
 * @remarks
 * Es el tipo de retorno de `getHomeData` (`home.service.ts`) y el contrato principal
 * entre el service de datos y los componentes del homepage. Todos los
 * campos opcionales (`leaders`, `stats`) se muestran condicionalmente
 * en la UI cuando están disponibles.
 */
export type HomeData = {
  /** Perfil básico del colaborador autenticado. */
  user: User;

  /** Anuncios corporativos recientes para el carrusel del homepage. */
  announcements: Announcement[];

  /** Próximos eventos del calendario personal del colaborador. */
  events: Event[];

  /** Cumpleaños de colaboradores próximos o del día. */
  birthdays: Birthday[];

  /** Tareas pendientes del colaborador desde Microsoft To Do. */
  tasks: Task[];

  /** Accesos rápidos del colaborador para navegación frecuente. */
  quickLinks: QuickLink[];

  /**
   * Líderes o directivos para el widget de liderazgo.
   * `undefined` si el widget no está habilitado o no hay datos.
   */
  leaders?: Leader[];

  /**
   * KPIs o estadísticas para el widget de métricas.
   * `undefined` si el widget no está habilitado o no hay datos.
   */
  stats?: StatItem[];
};