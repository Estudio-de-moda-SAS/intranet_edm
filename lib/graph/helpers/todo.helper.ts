// lib/graph/helpers/todo.helper.ts
// ─────────────────────────────────────────────────────────────────────────────
// Helper compartido para obtener tareas de Microsoft To Do.
// Reemplaza el patrón .then((lists: any) => ...) que tenían todos
// los services de departamento.
//
// Uso:
//   import { getHighPriorityTasks } from "@/lib/graph/helpers/todo.helper"
//   const tasks = await getHighPriorityTasks(token)
//   const alerts = tasks.map(t => ({ id: t.id, message: t.title, severity: "high" as const }))
// ─────────────────────────────────────────────────────────────────────────────

import { callGraph }      from "@/lib/graph/graphClient"
import type { GraphPage } from "@/lib/graph/graphClient"

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type GraphTask = {
  id:               string
  title:            string
  importance:       "low" | "normal" | "high"
  status:           string
  createdDateTime?: string
  dueDateTime?:     { dateTime: string; timeZone: string } | null
}

type GraphTodoList = {
  id:          string
  displayName: string
}

// ── Helper principal ──────────────────────────────────────────────────────────

/**
 * Retorna las tareas de alta prioridad sin completar de la primera lista
 * de Microsoft To Do del usuario autenticado.
 *
 * Retorna [] si el usuario no tiene listas, si el token no tiene permiso,
 * o si Graph falla — nunca lanza.
 */
export async function getHighPriorityTasks(token: string): Promise<GraphTask[]> {
  // Paso 1: obtener las listas — tipado explícito, sin any
  const listsPage = await callGraph<GraphPage<GraphTodoList>>(
    "/me/todo/lists?$top=1",
    token,
  ).catch((): GraphPage<GraphTodoList> => ({ value: [] }))

  const listId = listsPage.value[0]?.id
  if (!listId) return []

  // Paso 2: obtener tareas de la primera lista
  const tasksPage = await callGraph<GraphPage<GraphTask>>(
    `/me/todo/lists/${listId}/tasks?$filter=status ne 'completed'&$top=10&$select=title,importance,dueDateTime,createdDateTime`,
    token,
  ).catch((): GraphPage<GraphTask> => ({ value: [] }))

  return tasksPage.value.filter(t => t.importance === "high")
}

export async function getAllPendingTasks(token: string): Promise<GraphTask[]> {
  const listsPage = await callGraph<GraphPage<GraphTodoList>>(
    "/me/todo/lists?$top=1",
    token,
  ).catch((): GraphPage<GraphTodoList> => ({ value: [] }))

  const listId = listsPage.value[0]?.id
  if (!listId) return []

  const tasksPage = await callGraph<GraphPage<GraphTask>>(
    `/me/todo/lists/${listId}/tasks?$filter=status ne 'completed'&$top=20&$select=title,importance,dueDateTime,createdDateTime`,
    token,
  ).catch((): GraphPage<GraphTask> => ({ value: [] }))

  return tasksPage.value
}
