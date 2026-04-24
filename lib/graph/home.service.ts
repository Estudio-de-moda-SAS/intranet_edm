/**
 * @module graph/getHomeData
 * Service principal de la página de inicio de la intranet EDM.
 *
 * @remarks
 * Agrega en una sola llamada todos los datos necesarios para renderizar
 * el homepage del colaborador autenticado:
 *
 * - **Perfil de usuario** — obtenido desde {@link getSharedData}.
 * - **Anuncios** — mock temporal hasta obtener permisos de SharePoint.
 * - **Eventos** — próximos eventos del calendario personal desde `/me/events`.
 * - **Tareas** — tareas pendientes del primer To-Do list desde `/me/todo`.
 * - **Cumpleaños** — colaboradores con cumpleaños próximos desde `/users`.
 *
 * En modo bypass retorna todos los datos desde {@link MOCK_DATA} sin
 * realizar ninguna llamada a Microsoft Graph, permitiendo el desarrollo
 * local sin autenticación con Entra ID.
 *
 * **Estado actual en producción:**
 * Mientras no se implemente el Route Handler que recibe el token de MSAL
 * del cliente y lo reenvía a Graph, la función retorna {@link MOCK_DATA}
 * también en producción. Las llamadas reales a Graph se activarán cuando
 * se complete la integración con el Route Handler correspondiente.
 *
 * @example
 * ```ts
 * // En un Server Component:
 * const data = await getHomeData();
 * return <HomePage data={data} />;
 * ```
 */

import { getSharedData }  from "@/lib/graph/shared.service";
import { callGraph }      from "@/lib/graph/graphClient";
import type { GraphPage } from "@/lib/graph/graphClient";
import type { HomeData }  from "@/types/home";

const IS_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

// -- Tipos de Graph ------------------------------------------------------------

/**
 * Subconjunto de un evento de calendario devuelto por `/me/events` en Graph.
 * @internal
 */
type GraphEvent = {
  id:       string;
  subject:  string;
  start:    { dateTime: string };
  location: { displayName: string };
};

/**
 * Representación de un To-Do list devuelto por `/me/todo/lists` en Graph.
 * @internal
 */
type GraphTodoList = {
  id:          string;
  displayName: string;
};

/**
 * Tarea individual de un To-Do list devuelta por
 * `/me/todo/lists/{listId}/tasks` en Graph.
 * @internal
 */
type GraphTask = {
  id:          string;
  title:       string;
  dueDateTime: { dateTime: string } | null;
};

/**
 * Subconjunto del perfil de un usuario del tenant devuelto por `/users`.
 * @internal
 */
type GraphUser = {
  id:          string;
  displayName: string;
  department:  string | null;
  birthday:    string | null;
};

// -- Mock ---------------------------------------------------------------------

/**
 * Datos mock que simulan la respuesta completa de {@link getHomeData}.
 *
 * @remarks
 * Se usan tanto en modo bypass como en producción mientras el Route Handler
 * que pasa el token de MSAL al servidor no esté implementado.
 *
 * @internal
 */
const MOCK_DATA = {
  announcements: [
    {
      id: "a1", title: "Mantenimiento programado de POS",
      summary: "Sábado 9:00–11:00 habrá indisponibilidad parcial.",
      publishedAt: new Date().toISOString(), imageUrl: "https://picsum.photos/800/600?1",
    },
    {
      id: "a2", title: "Actualización de seguridad en red",
      summary: "Se aplicarán nuevas reglas de firewall.",
      publishedAt: new Date().toISOString(), imageUrl: "https://picsum.photos/800/600?2",
    },
    {
      id: "a3", title: "Nueva política de teletrabajo",
      summary: "Cambios en lineamientos para trabajo remoto.",
      publishedAt: new Date().toISOString(), imageUrl: "https://picsum.photos/800/600?3",
    },
    {
      id: "a4", title: "Implementación de autenticación MFA",
      summary: "MFA será obligatorio para todas las cuentas.",
      publishedAt: new Date().toISOString(), imageUrl: "https://picsum.photos/800/600?4",
    },
    {
      id: "a5", title: "Evento anual corporativo 2026",
      summary: "Encuentro presencial con líderes regionales.",
      publishedAt: new Date().toISOString(), imageUrl: "https://picsum.photos/800/600?5",
    },
    {
      id: "a6", title: "Optimización de infraestructura cloud",
      summary: "Mejoras en rendimiento y reducción de costos.",
      publishedAt: new Date().toISOString(), imageUrl: "https://picsum.photos/800/600?6",
    },
    {
      id: "a7", title: "Lanzamiento de nuevo portal interno",
      summary: "Nueva experiencia digital para colaboradores.",
      publishedAt: new Date().toISOString(), imageUrl: "https://picsum.photos/800/600?7",
    },
  ],
  events: [
    {
      id: "e1", title: "Capacitación M365",
      date: new Date(Date.now() + 86400000).toISOString(),
      location: "Teams",
    },
    {
      id: "e2", title: "Workshop Seguridad TI",
      date: new Date(Date.now() + 172800000).toISOString(),
      location: "Auditorio Principal",
    },
  ],
  tasks: [
    { id: "t1", title: "Aprobar acceso SharePoint",     due: "2026-03-05" },
    { id: "t2", title: "Revisión de permisos en Azure", due: "2026-03-07" },
  ],
  birthdays: [
    { id: "b1", name: "Laura Torres",  date: "2026-03-04", area: "Ecommerce" },
    { id: "b2", name: "Carlos Méndez", date: "2026-03-06", area: "Retail"    },
  ],
};

// -- Helpers internos ----------------------------------------------------------

/**
 * Construye una página vacía compatible con {@link GraphPage}.
 * @internal
 */
function emptyPage<T>(): GraphPage<T> {
  return { value: [] };
}

/**
 * Obtiene las tareas pendientes del primer To-Do list del usuario.
 * @internal
 */
async function getTasks(token: string): Promise<GraphPage<GraphTask>> {
  const lists = await callGraph<GraphPage<GraphTodoList>>(
    "/me/todo/lists?$top=1",
    token,
  ).catch(() => emptyPage<GraphTodoList>());

  const listId = lists.value[0]?.id;
  if (!listId) return emptyPage<GraphTask>();

  return callGraph<GraphPage<GraphTask>>(
    `/me/todo/lists/${listId}/tasks?$filter=status ne 'completed'&$top=5&$select=title,dueDateTime`,
    token,
  ).catch(() => emptyPage<GraphTask>());
}

// -- Service principal --------------------------------------------------------

/**
 * Agrega y retorna todos los datos necesarios para renderizar la página de
 * inicio del colaborador autenticado.
 *
 * @remarks
 * En modo bypass y en producción sin Route Handler activo, retorna
 * {@link MOCK_DATA} directamente desde {@link getSharedData}.
 *
 * Cuando se implemente el Route Handler que recibe el token de MSAL,
 * el bloque de producción activará las llamadas reales a Graph para
 * eventos, tareas y cumpleaños.
 *
 * @returns Objeto {@link HomeData} con perfil, anuncios, eventos, tareas
 *   y cumpleaños.
 */
export async function getHomeData(): Promise<HomeData> {
  const shared = await getSharedData();

  // En bypass y en producción sin token disponible desde servidor,
  // retornar mock data. Las llamadas reales a Graph se activarán
  // cuando el Route Handler correspondiente pase el token al service.
  if (IS_BYPASS || process.env.NEXT_PUBLIC_AUTH_BYPASS !== "true") {
    return {
      user:       shared.user,
      quickLinks: [],
      ...MOCK_DATA,
    };
  }

  // -- Producción con Route Handler activo ------------------------------------
  // Este bloque se activa cuando getHomeData() se llama desde un Route Handler
  // que recibe el token de MSAL del cliente via Authorization header.

  const { getToken } = await import("@/lib/graph/shared.service");
  const token = await getToken();

  const [eventsRes, tasksRes, membersRes] = await Promise.all([
    callGraph<GraphPage<GraphEvent>>(
      `/me/events?$select=subject,start,location&$orderby=start/dateTime&$top=5&$filter=start/dateTime ge '${new Date().toISOString()}'`,
      token,
    ).catch(() => emptyPage<GraphEvent>()),

    getTasks(token),

    callGraph<GraphPage<GraphUser>>(
      "/users?$select=id,displayName,department,birthday&$top=10",
      token,
    ).catch(() => emptyPage<GraphUser>()),
  ]);

  return {
    user:          shared.user,
    quickLinks:    [],
    announcements: MOCK_DATA.announcements,
    events: eventsRes.value.map((e) => ({
      id:       e.id,
      title:    e.subject,
      date:     e.start?.dateTime ?? new Date().toISOString(),
      location: e.location?.displayName ?? "Sin ubicación",
    })),
    tasks: tasksRes.value.map((t) => ({
      id:    t.id,
      title: t.title,
      due:   t.dueDateTime?.dateTime?.split("T")[0] ?? "",
    })),
    birthdays: membersRes.value
      .filter((u) => u.birthday !== null)
      .map((u) => ({
        id:   u.id,
        name: u.displayName,
        date: (u.birthday ?? "").split("T")[0] ?? "",
        area: u.department ?? "",
      })),
  };
}