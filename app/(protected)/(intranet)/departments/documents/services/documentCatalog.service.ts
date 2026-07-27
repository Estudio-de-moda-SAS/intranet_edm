/**
 * @module documentCatalog.service
 *
 * Servicios del catálogo documental corporativo.
 *
 * @remarks
 * Este módulo constituye la única puerta de acceso al catálogo de áreas
 * documentales de la Intranet.
 *
 * Actualmente consume un catálogo estático definido dentro de la aplicación,
 * pero su diseño permite reemplazar esta fuente de datos por un repositorio
 * remoto (Supabase, SQL Server, Microsoft Lists, etc.) sin afectar los
 * componentes de interfaz ni los hooks consumidores.
 */

import { DOCUMENT_SITES } from "../config/documentSites";
import type { DocumentDepartment } from "../types/documentDepartment.types";

/**
 * Obtiene todas las áreas documentales habilitadas.
 *
 * @returns Colección ordenada de áreas disponibles.
 *
 * @remarks
 * El resultado contiene únicamente los sitios marcados como habilitados
 * (`enabled = true`) y se devuelve ordenado según la propiedad `order`.
 *
 * Este método representa la fuente oficial de información utilizada por
 * el Sidebar del módulo documental.
 */
export async function getDocumentDepartments(): Promise<
  readonly DocumentDepartment[]
> {
  return [...DOCUMENT_SITES]
    .filter((department) => department.enabled)
    .sort((left, right) => left.order - right.order);
}

/**
 * Obtiene una única área documental mediante su identificador.
 *
 * @param id Identificador interno del departamento.
 *
 * @returns Área encontrada o `null` si no existe.
 */
export async function getDocumentDepartmentById(
  id: string
): Promise<DocumentDepartment | null> {
  const department =
    DOCUMENT_SITES.find((item) => item.id === id && item.enabled) ?? null;

  return department;
}

/**
 * Busca áreas documentales utilizando coincidencias parciales.
 *
 * @param searchTerm Texto ingresado por el usuario.
 *
 * @returns Áreas cuyo nombre contiene el texto buscado.
 *
 * @remarks
 * La búsqueda es insensible a mayúsculas y minúsculas.
 */
export async function searchDocumentDepartments(
  searchTerm: string
): Promise<readonly DocumentDepartment[]> {
  const normalizedTerm = searchTerm.trim().toLowerCase();

  if (!normalizedTerm) {
    return getDocumentDepartments();
  }

  return DOCUMENT_SITES.filter(
    (department) =>
      department.enabled &&
      department.name.toLowerCase().includes(normalizedTerm)
  ).sort((left, right) => left.order - right.order);
}