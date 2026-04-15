/**
 * @module graph/helpers/todo.helper
 * Helper compartido para consultar tareas de Microsoft To Do desde
 * los services de departamento de la intranet EDM.
 *
 * @remarks
 * Centraliza el patrón de dos pasos necesario para acceder a las tareas
 * de Graph (obtener lista → obtener tareas), evitando duplicarlo en cada
 * service de departamento.
 *
 * Todas las funciones de este módulo son tolerantes a fallos: ante
 * cualquier error de Graph retornan un array vacío en lugar de propagar
 * la excepción, permitiendo que los services que las consumen continúen
 * su ejecución con datos parciales.
 *
 * **Scope de Graph requerido:** `Tasks.Read`
 *
 * @example
 * ```ts
 * import { getHighPriorityTasks } from "@/lib/graph/helpers/todo.helper";
 *
 * const tasks  = await getHighPriorityTasks(token);
 * const alerts = tasks.map(t => ({
 *   id:       t.id,
 *   message:  t.title,
 *   severity: "high" as const,
 * }));
 * ```
 */

import { callGraph }      from "@/lib/graph/graphClient";
import type { GraphPage } from "@/lib/graph/graphClient";

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Tarea de Microsoft To Do devuelta por
 * `/me/todo/lists/{listId}/tasks` en Graph.
 *
 * @remarks
 * Solo incluye los campos seleccionados en las queries de este módulo
 * (`$select=title,importance,dueDateTime,createdDateTime`). Campos no
 * seleccionados llegarán como `undefined` aunque existan en Graph.
 */
export type GraphTask = {
  /** Identificador único de la tarea en Graph. */
  id: string;

  /** Título de la tarea tal como aparece en Microsoft To Do. */
  title: string;

  /**
   * Nivel de importancia asignado a la tarea.
   *
   * | Valor    | Descripción                              |
   * |----------|------------------------------------------|
   * | `low`    | Prioridad baja                           |
   * | `normal` | Prioridad normal (valor por defecto)     |
   * | `high`   | Prioridad alta — marcada con estrella    |
   */
  importance: "low" | "normal" | "high";

  /**
   * Estado actual de la tarea.
   * Los valores posibles de Graph son `"notStarted"`, `"inProgress"`,
   * `"completed"`, `"waitingOnOthers"` y `"deferred"`.
   */
  status: string;

  /**
   * Fecha y hora de creación de la tarea en formato ISO 8601.
   * `undefined` si no se incluyó en el `$select`.
   */
  createdDateTime?: string;

  /**
   * Fecha límite de la tarea.
   * `null` si la tarea no tiene fecha límite asignada.
   * `undefined` si no se incluyó en el `$select`.
   */
  dueDateTime?: { dateTime: string; timeZone: string } | null;
};

/**
 * Representación de un To-Do list devuelto por `/me/todo/lists` en Graph.
 *
 * @internal
 */
type GraphTodoList = {
  /** Identificador único de la lista en Graph. */
  id: string;

  /** Nombre de la lista tal como aparece en Microsoft To Do. */
  displayName: string;
};

// ── Helpers internos ──────────────────────────────────────────────────────────

/**
 * Obtiene el ID de la primera lista de Microsoft To Do del usuario
 * autenticado.
 *
 * @param token - Token de acceso delegado con scope `Tasks.Read`.
 * @returns ID de la primera lista, o `null` si el usuario no tiene listas
 *   o si Graph devuelve un error.
 *
 * @internal
 */
async function getFirstListId(token: string): Promise<string | null> {
  const listsPage = await callGraph<GraphPage<GraphTodoList>>(
    "/me/todo/lists?$top=1",
    token,
  ).catch((): GraphPage<GraphTodoList> => ({ value: [] }));

  return listsPage.value[0]?.id ?? null;
}

// ── Funciones exportadas ──────────────────────────────────────────────────────

/**
 * Obtiene las tareas de alta prioridad sin completar de la primera lista
 * de Microsoft To Do del usuario autenticado.
 *
 * @remarks
 * El flujo interno es de dos pasos:
 * 1. Obtiene el ID de la primera lista mediante {@link getFirstListId}.
 * 2. Consulta hasta 10 tareas pendientes (`status ne 'completed'`) y
 *    filtra en memoria las que tienen `importance === "high"`.
 *
 * El filtro de importancia se aplica en memoria porque la API de To Do
 * no soporta `$filter` por el campo `importance` de forma fiable.
 *
 * Ante cualquier error de Graph retorna `[]` sin propagar la excepción,
 * permitiendo que los services consumidores continúen con datos parciales.
 *
 * @param token - Token de acceso delegado con scope `Tasks.Read`.
 * @returns Array de {@link GraphTask} con `importance === "high"` y
 *   `status !== "completed"`, o `[]` si no hay tareas, no hay listas,
 *   o si Graph devuelve un error.
 *
 * @example
 * ```ts
 * const tasks = await getHighPriorityTasks(token);
 * // → [{ id: "abc", title: "Aprobar acceso", importance: "high", ... }]
 *
 * // Sin tareas de alta prioridad o sin listas:
 * // → []
 * ```
 */
export async function getHighPriorityTasks(token: string): Promise<GraphTask[]> {
  const listId = await getFirstListId(token);
  if (!listId) return [];

  const tasksPage = await callGraph<GraphPage<GraphTask>>(
    `/me/todo/lists/${listId}/tasks?$filter=status ne 'completed'&$top=10&$select=title,importance,dueDateTime,createdDateTime`,
    token,
  ).catch((): GraphPage<GraphTask> => ({ value: [] }));

  return tasksPage.value.filter((t) => t.importance === "high");
}

/**
 * Obtiene todas las tareas pendientes de la primera lista de Microsoft
 * To Do del usuario autenticado, independientemente de su prioridad.
 *
 * @remarks
 * A diferencia de {@link getHighPriorityTasks}, no aplica ningún filtro
 * de importancia — retorna todas las tareas con `status !== "completed"`,
 * hasta un máximo de 20.
 *
 * Ante cualquier error de Graph retorna `[]` sin propagar la excepción.
 *
 * @param token - Token de acceso delegado con scope `Tasks.Read`.
 * @returns Array de hasta 20 {@link GraphTask} pendientes ordenadas por
 *   Graph, o `[]` si no hay tareas, no hay listas, o si Graph falla.
 *
 * @example
 * ```ts
 * const tasks = await getAllPendingTasks(token);
 * const mapped = tasks.map((t) => ({
 *   id:    t.id,
 *   title: t.title,
 *   due:   t.dueDateTime?.dateTime?.split("T")[0] ?? "",
 * }));
 * ```
 */
export async function getAllPendingTasks(token: string): Promise<GraphTask[]> {
  const listId = await getFirstListId(token);
  if (!listId) return [];

  const tasksPage = await callGraph<GraphPage<GraphTask>>(
    `/me/todo/lists/${listId}/tasks?$filter=status ne 'completed'&$top=20&$select=title,importance,dueDateTime,createdDateTime`,
    token,
  ).catch((): GraphPage<GraphTask> => ({ value: [] }));

  return tasksPage.value;
}