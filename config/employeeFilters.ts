// config/employeeFilters.ts
//
// Mapeo entre el campo `department` que devuelve Microsoft Graph
// y los ids definidos en lib/config.ts → DEPARTMENTS.
//
// Solo se exponen los departamentos marcados show: true.

import { DEPARTMENTS } from "@/lib/config";

/** Mapa Graph-display-name → DEPARTMENTS id */
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

/** Opciones de filtro de departamento para el toolbar.
 *  Se genera desde DEPARTMENTS para mantener una sola fuente de verdad. */
export const DEPT_FILTER_OPTIONS = DEPARTMENTS.filter((d) => d.show).map(
  (d) => ({ value: d.id, label: d.label })
);

export const STATUS_FILTER_OPTIONS = [
  { value: "active",   label: "Activo" },
  { value: "remote",   label: "Remoto" },
  { value: "leave",    label: "En licencia" },
  { value: "inactive", label: "Inactivo" },
] as const;
