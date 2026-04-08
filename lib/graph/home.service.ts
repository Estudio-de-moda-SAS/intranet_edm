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
 * @example
 * ```ts
 * // En un Server Component:
 * const data = await getHomeData();
 * return <HomePage data={data} />;
 * ```
 */

import { getSharedData, getToken } from "@/lib/graph/shared.service";
import { callGraph }               from "@/lib/graph/graphClient";
import type { GraphPage }          from "@/lib/graph/graphClient";
import type { HomeData }           from "@/types/home";

const IS_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

// ── Tipos de Graph ────────────────────────────────────────────────────────────

/**
 * Subconjunto de un evento de calendario devuelto por `/me/events` en Graph.
 * Solo incluye los campos seleccionados en la query (`$select`).
 *
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
 *
 * @internal
 */
type GraphTodoList = {
  id:          string;
  displayName: string;
};

/**
 * Tarea individual de un To-Do list devuelta por
 * `/me/todo/lists/{listId}/tasks` en Graph.
 *
 * @internal
 */
type GraphTask = {
  id:          string;
  title:       string;
  dueDateTime: { dateTime: string } | null;
};

/**
 * Subconjunto del perfil de un usuario del tenant devuelto por `/users`
 * en Graph. Solo incluye los campos seleccionados en la query (`$select`).
 *
 * @internal
 */
type GraphUser = {
  id:          string;
  displayName: string;
  department:  string | null;
  birthday:    string | null;
};

// ── Mock ──────────────────────────────────────────────────────────────────────

/**
 * Datos mock que simulan la respuesta completa de {@link getHomeData} en
 * entorno de desarrollo.
 *
 * @remarks
 * Incluye anuncios, eventos, tareas y cumpleaños con datos representativos
 * del contexto de EDM. Los anuncios también se usan en producción como
 * fallback temporal hasta obtener los permisos necesarios de SharePoint.
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

// ── Helpers internos ──────────────────────────────────────────────────────────

/**
 * Construye una página vacía compatible con {@link GraphPage} para usar
 * como valor de retorno seguro en los `.catch()` de las llamadas a Graph.
 *
 * @remarks
 * Se define como función en lugar de constante para que TypeScript infiera
 * `T[]` como array mutable en cada invocación, evitando errores de tipo
 * al asignar el resultado a variables con tipos específicos.
 *
 * @typeParam T - Tipo de los elementos de la colección vacía.
 * @returns Objeto `{ value: [] }` compatible con {@link GraphPage}`<T>`.
 *
 * @internal
 */
function emptyPage<T>(): GraphPage<T> {
  return { value: [] };
}

/**
 * Obtiene las tareas pendientes del primer To-Do list del usuario
 * autenticado desde Microsoft Graph.
 *
 * @remarks
 * El flujo es de dos pasos:
 * 1. Consulta `/me/todo/lists?$top=1` para obtener el ID del primer list.
 * 2. Consulta `/me/todo/lists/{listId}/tasks` filtrando por
 *    `status ne 'completed'` y limitando a 5 resultados.
 *
 * Si cualquiera de los dos pasos falla, retorna {@link emptyPage} en lugar
 * de propagar el error, evitando que un fallo en las tareas interrumpa la
 * carga completa del homepage.
 *
 * @param token - Token de acceso delegado con scope `Tasks.Read`.
 * @returns Página con hasta 5 tareas pendientes, o página vacía si el
 *   usuario no tiene listas o si Graph devuelve un error.
 *
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

// ── Service principal ─────────────────────────────────────────────────────────

/**
 * Agrega y retorna todos los datos necesarios para renderizar la página de
 * inicio del colaborador autenticado.
 *
 * @remarks
 * Las tres consultas a Graph (eventos, tareas y cumpleaños) se ejecutan en
 * paralelo con {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all | Promise.all}
 * para minimizar la latencia total. Cada consulta tiene su propio `.catch()`
 * que retorna una página vacía, garantizando que el fallo de una fuente de
 * datos no impida mostrar las demás.
 *
 * **Estado actual de los anuncios:**
 * Los anuncios se sirven desde {@link MOCK_DATA} tanto en modo bypass como
 * en producción. Están pendientes de migración a la SharePoint API una vez
 * se obtengan los permisos necesarios (`Sites.Read.All`).
 *
 * **Scopes de Graph requeridos:**
 * | Scope                  | Dato obtenido          |
 * |------------------------|------------------------|
 * | `Calendars.Read`       | Eventos del calendario |
 * | `Tasks.Read`           | Tareas de To-Do        |
 * | `User.ReadBasic.All`   | Cumpleaños del tenant  |
 *
 * @returns Objeto {@link HomeData} con el perfil del usuario, anuncios,
 *   eventos, tareas pendientes y cumpleaños próximos.
 *
 * @example
 * ```tsx
 * // En un Server Component:
 * export default async function HomePage() {
 *   const data = await getHomeData();
 *   return <HomeView data={data} />;
 * }
 * ```
 */
export async function getHomeData(): Promise<HomeData> {
  const shared = await getSharedData();

  if (IS_BYPASS) {
    return {
      user:       shared.user,
      quickLinks: [],
      ...MOCK_DATA,
    };
  }

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
    user:       shared.user,
    quickLinks: [],
    announcements: MOCK_DATA.announcements, // ⏳ Reemplazar con SharePoint API cuando haya permisos
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