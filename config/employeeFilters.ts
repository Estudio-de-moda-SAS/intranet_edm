/**
 * @module config/employeeFilters
 * Mapeos y opciones de filtro para el directorio de colaboradores
 * de la intranet EDM.
 *
 * @remarks
 * Centraliza dos responsabilidades relacionadas con el directorio:
 *
 * 1. **{@link GRAPH_DEPT_TO_ID}** — mapea los nombres de departamento
 *    que devuelve Microsoft Graph (en distintos idiomas y formatos) a
 *    los `id` de {@link DEPARTMENTS} en `lib/config.ts`. Es el puente
 *    entre los datos crudos de Entra ID y el modelo interno de la intranet.
 *
 * 2. **{@link DEPT_FILTER_OPTIONS} y {@link STATUS_FILTER_OPTIONS}** —
 *    opciones listas para usar en los selectores del toolbar del
 *    directorio, derivadas de {@link DEPARTMENTS} para mantener una
 *    única fuente de verdad.
 *
 * Para agregar soporte a un nuevo nombre de departamento de Graph,
 * basta con añadir una entrada a {@link GRAPH_DEPT_TO_ID} sin tocar
 * ningún otro archivo.
 */

import { DEPARTMENTS } from "@/config/config";
import type { EmployeeStatus } from "@/types/employee";

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Opción de un selector de filtro en el toolbar del directorio.
 */
export type FilterOption = {
  /** Valor interno usado en la lógica de filtrado (ej. `"rrhh"`, `"active"`). */
  value: string;

  /** Texto visible en el selector (ej. `"RRHH"`, `"Activo"`). */
  label: string;
};

// ── Mapeo Graph → ID interno ──────────────────────────────────────────────────

/**
 * Mapa del nombre display de departamento en Entra ID al `id` interno
 * de {@link DEPARTMENTS} en `lib/config.ts`.
 *
 * @remarks
 * Microsoft Graph devuelve el campo `department` del perfil de usuario
 * tal como está configurado en Entra ID — sin normalización de idioma,
 * mayúsculas ni acentos. Este mapa cubre las variantes más comunes para
 * garantizar que todos los colaboradores sean clasificados correctamente
 * independientemente de cómo esté configurado su perfil en Azure AD.
 *
 * Si un departamento no está en el mapa, `mapUser` en
 * `employees.service.ts` asigna `"other"` como `departmentId`.
 *
 * Para agregar una nueva variante de nombre:
 * ```ts
 * "Nuevo Nombre en Graph": "id-existente-en-departments"
 * ```
 *
 * | Nombre en Graph              | ID interno               |
 * |------------------------------|--------------------------|
 * | `"Recursos Humanos"` / `"RRHH"` / `"Human Resources"` | `"rrhh"` |
 * | `"Finanzas"` / `"Finance"`   | `"finanzas"`             |
 * | `"Jurídica"` / `"Juridica"` / `"Legal"` | `"juridica"` |
 * | `"Retail"`                   | `"retail"`               |
 * | `"Servicios Administrativos"` / `"Administrative Services"` | `"administrative-services"` |
 * | `"TI"` / `"IT"` / `"Tecnología"` / `"Technology"` | `"ti"` |
 */
export const GRAPH_DEPT_TO_ID: Record<string, string> = {
  "Recursos Humanos":          "rrhh",
  "RRHH":                      "rrhh",
  "Human Resources":           "rrhh",
  "Finanzas":                  "finanzas",
  "Finance":                   "finanzas",
  "Jurídica":                  "juridica",
  "Juridica":                  "juridica",
  "Legal":                     "juridica",
  "Logística":                 "logistica",
  "Logistica":                 "logistica",
  "Logistics":                 "logistica",
  "Retail":                    "retail",
  "Servicios Administrativos": "administrative-services",
  "Administrative Services":   "administrative-services",
  "TI":                        "ti",
  "IT":                        "ti",
  "Tecnología":                "ti",
  "Technology":                "ti",
};

// ── Opciones de filtro ────────────────────────────────────────────────────────

/**
 * Opciones de filtro de departamento para el toolbar del directorio,
 * derivadas dinámicamente de {@link DEPARTMENTS}.
 *
 * @remarks
 * Solo incluye los departamentos con `show: true` — los departamentos
 * ocultos en la navegación tampoco aparecen como opción de filtro en
 * el directorio. Al derivarse de {@link DEPARTMENTS}, cualquier cambio
 * en la configuración se refleja automáticamente aquí sin modificar
 * este archivo.
 */
export const DEPT_FILTER_OPTIONS: FilterOption[] = DEPARTMENTS
  .filter((d) => d.show)
  .map((d) => ({ value: d.id, label: d.label }));

/**
 * Opciones de filtro de estado de presencia para el toolbar del
 * directorio.
 *
 * @remarks
 * Cubre todos los valores posibles de {@link EmployeeStatus}.
 * Definido como `as const` para que TypeScript infiera los valores
 * literales exactos en lugar de `string`.
 */
export const STATUS_FILTER_OPTIONS = [
  { value: "active",   label: "Activo"      },
  { value: "remote",   label: "Remoto"      },
  { value: "leave",    label: "En licencia" },
  { value: "inactive", label: "Inactivo"    },
] as const;