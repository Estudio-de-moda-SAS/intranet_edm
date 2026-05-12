/**
 * @module config/config
 * Configuración central de departamentos y marca de la intranet EDM.
 *
 * @remarks
 * Fuente única de verdad para la lista de departamentos disponibles
 * en la intranet y los assets de marca corporativa. Cualquier componente
 * que necesite iterar departamentos, construir navegación o validar
 * rutas debe importar desde este módulo.
 *
 * El campo `show` de cada departamento controla su visibilidad en la
 * navegación principal — los departamentos con `show: false` existen
 * en el sistema pero no aparecen en el menú lateral ni en el selector
 * de departamentos.
 *
 * @example
 * ```ts
 * // Obtener solo los departamentos visibles en la navegación:
 * const visible = DEPARTMENTS.filter(d => d.show);
 *
 * // Derivar tipos desde la configuración:
 * type DepartmentId = typeof DEPARTMENTS[number]["id"];
 * ```
 */

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Departamento corporativo registrado en la intranet EDM.
 *
 * @remarks
 * El campo `show` permite mantener departamentos en la configuración
 * sin exponerlos en la navegación — útil para departamentos en
 * construcción o con acceso restringido que aún no están listos para
 * todos los colaboradores.
 */
export type Department = {
  /**
   * Identificador único del departamento en minúsculas sin espacios
   * (ej. `"rrhh"`, `"ti"`, `"administrative-services"`).
   * Se usa como valor en filtros, rutas y mapeos de tipos.
   */
  id: string;

  /**
   * Nombre display del departamento tal como aparece en la UI
   * (ej. `"Finanzas"`, `"TI"`, `"Servicios Administrativos"`).
   * Se usa como valor de `AnnouncementCategory` en
   * `types/announcement.ts`.
   */
  label: string;

  /**
   * Ruta interna de la página principal del departamento
   * (ej. `"/departments/finance"`).
   */
  href: string;

  /**
   * Controla si el departamento aparece en la navegación principal.
   * `true` → visible en el menú lateral y selector de departamentos.
   * `false` → oculto en la navegación pero accesible por URL directa.
   */
  show: boolean;
};

// ── Flags de desarrollo ───────────────────────────────────────────────────────

/**
 * Desactiva el sistema de roles durante el desarrollo, otorgando nivel
 * `'admin'` a cualquier usuario autenticado.
 *
 * Cuando es `true`:
 * - El middleware (`proxy.ts`) omite la verificación de permisos por ruta.
 * - El hook `useAppSession` devuelve `level: 'admin'` y `can()` siempre `true`.
 *
 * @remarks
 * Para restaurar el sistema de roles en producción, eliminar esta
 * constante o asignarle `false`. No requiere cambios en ningún otro archivo.
 *
 * @example
 * ```ts
 * // Activado — roles desactivados, todos ven todo:
 * export const DEV_DISABLE_ROLES = true;
 *
 * // Desactivado — comportamiento real de producción:
 * export const DEV_DISABLE_ROLES = false;
 * ```
 */
export const DEV_DISABLE_ROLES = true; // TODO: asignar false antes de producción

// ── Departamentos ─────────────────────────────────────────────────────────────

/**
 * Lista completa de departamentos registrados en la intranet EDM.
 *
 * @remarks
 * Para agregar un nuevo departamento:
 * 1. Añadir una entrada a este array con `show: false` inicialmente.
 * 2. Crear la página en `app/(protected)/(intranet)/departments/{id}/`.
 * 3. Crear el service de datos en `lib/graph/departments/{id}.service.ts`.
 * 4. Agregar las rutas al middleware en `proxy.ts`.
 * 5. Cambiar `show: true` cuando el departamento esté listo.
 *
 * | `id`                      | `label`                  | Visible |
 * |---------------------------|--------------------------|---------|
 * | `finanzas`                | Finanzas                 | ✅      |
 * | `juridica`                | Juridica                 | ✅      |
 * | `producto`                | Producto                 | ✅      |
 * | `retail`                  | Retail                   | ✅      |
 * | `rrhh`                    | RRHH                     | ✅      |
 * | `administrative-services` | Servicios Administrativos| ✅      |
 * | `ti`                      | TI                       | ✅      |
 * | `documentos`              | Documentos               | ❌      |
 */
export const DEPARTMENTS: Department[] = [
  {
    id:    "finanzas",
    label: "Finanzas",
    href:  "/departments/finance",
    show:  true,
  },
  {
    id:    "juridica",
    label: "Juridica",
    href:  "/departments/legal",
    show:  true,
  },
  {
    id:    "producto",
    label: "Producto",
    href:  "/departments/product",
    show:  true,
  },
  {
    id:    "retail",
    label: "Retail",
    href:  "/departments/retail",
    show:  true,
  },
  {
    id:    "rrhh",
    label: "RRHH",
    href:  "/departments/human-resources",
    show:  true,
  },
  {
    id:    "administrative-services",
    label: "Servicios Administrativos",
    href:  "/departments/administrative-services",
    show:  true,
  },
  {
    id:    "ti",
    label: "TI",
    href:  "/departments/it",
    show:  true,
  },
  {
    id:    "documentos",
    label: "Documentos",
    href:  "/departments/documents",
    show:  false,
  },
  {
    id:    "ticket-systems",
    label: "Tickets",
    href:  "/departments/ticket-systems",
    show:  true,
  },
  {
    id:    "tableros",
    label: "Tableros",
    href:  "/departments/boards",
    show:  false,
  },
];

// ── Marca ─────────────────────────────────────────────────────────────────────

/**
 * Assets y configuración de marca corporativa de EDM.
 *
 * @remarks
 * Centraliza las referencias a los assets de marca para evitar strings
 * hardcodeados en los componentes. Al ser `as const`, TypeScript infiere
 * los valores exactos como tipos literales en lugar de `string`.
 *
 * Para agregar nuevos assets de marca (favicon, logo oscuro, etc.),
 * añadirlos aquí en lugar de referenciarlos directamente en los
 * componentes.
 */
export const BRAND = {
  /** URL del logotipo principal de EDM en formato PNG. */
  logoUrl: "/brand/edmIcon.png",
} as const;