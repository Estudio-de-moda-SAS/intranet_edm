/**
 * @module roles
 * Define el sistema RBAC de la intranet EDM: niveles de acceso, permisos
 * granulares y las funciones de verificación que los consumen.
 *
 * @remarks
 * La resolución del nivel de acceso sigue un orden de prioridad estricto
 * que se distribuye entre este módulo y `microsoft-graph.ts`:
 *
 * 1. Grupos de Azure AD (Object ID exacto) — ver `resolveAccessLevelFromGroups`
 * 2. Nombre del grupo de Azure AD — ver `resolveAccessLevelFromGroups`
 * 3. Departamento / cargo del perfil de Entra ID — ver `resolveAccessLevel`
 * 4. Fallback seguro → `'employee'`
 */

/**
 * Niveles de acceso del sistema.
 *
 * Los niveles **no** son estrictamente ascendentes en todos los casos:
 * algunos niveles departamentales (`finance`, `legal`, `it`, etc.) tienen
 * permisos que `manager` no posee, y viceversa. La jerarquía lineal de
 * {@link LEVEL_HIERARCHY} se usa únicamente para {@link atLeast}; la
 * autorización granular se resuelve con {@link can} y {@link PERMISSION_MAP}.
 */
export type AccessLevel =
  | 'admin'          // Superadministradores de la plataforma — acceso total
  | 'finance'        // Equipo de Finanzas
  | 'legal'          // Equipo Jurídico
  | 'retail'         // Equipo Retail / Comercial
  | 'hr'             // Recursos Humanos
  | 'it'             // Equipo de TI — infraestructura y sistemas
  | 'product'        // Equipo de Producto — colecciones, fichas técnicas, muestras
  | 'admin_services' // Servicios Administrativos / Recepción
  | 'manager'        // Gerencia / Dirección — lectura cross-departamento
  | 'employee';      // Resto de colaboradores

/**
 * Orden jerárquico ascendente de los niveles de acceso.
 * La posición en el array determina el rango — mayor índice, mayor acceso.
 *
 * @remarks
 * Este array es la **única fuente de verdad** para la jerarquía lineal.
 * `microsoft-graph.ts` mantiene su propio array `HIERARCHY` con un orden
 * distinto (usado para resolver el nivel de mayor rango ante membresías
 * múltiples en Azure AD) — si se agregan niveles aquí, deben añadirse
 * allá también.
 *
 * Agregar un nivel aquí es suficiente para que {@link levelRank},
 * {@link atLeast} y {@link can} lo evalúen correctamente.
 */
 export const LEVEL_HIERARCHY: AccessLevel[] = [
  'employee',
  'manager',
  'admin_services',
  'hr',
  'retail',
  'product',
  'it',
  'legal',
  'finance',
  'admin',
];

/**
 * Devuelve la posición de un nivel en {@link LEVEL_HIERARCHY}.
 *
 * @param level - Nivel de acceso a consultar.
 * @returns Índice entero ≥ 0. Retorna `-1` si el nivel no existe en la
 *   jerarquía (no debería ocurrir con el tipo {@link AccessLevel} correctamente
 *   tipado).
 *
 * @internal
 */
export function levelRank(level: AccessLevel): number {
  return LEVEL_HIERARCHY.indexOf(level);
}

/**
 * Verifica si un nivel de acceso cumple o supera un nivel requerido.
 *
 * @param level    - Nivel de acceso del usuario autenticado.
 * @param required - Nivel mínimo requerido para la acción.
 * @returns `true` si el nivel del usuario es igual o superior al requerido
 *   según {@link LEVEL_HIERARCHY}.
 *
 * @example
 * ```ts
 * atLeast('finance', 'manager')  // true
 * atLeast('employee', 'hr')      // false
 * atLeast('admin', 'admin')      // true
 * ```
 */
export function atLeast(level: AccessLevel, required: AccessLevel): boolean {
  return levelRank(level) >= levelRank(required);
}

/**
 * Mapeo de nombres de departamento de EDM a su {@link AccessLevel} base.
 *
 * Se usa en {@link resolveAccessLevel} cuando el usuario no pertenece a
 * ningún grupo de Azure AD conocido.
 *
 * @remarks
 * Incluye variantes de nombre para cubrir inconsistencias en los perfiles
 * de Entra ID (ej. `"RRHH"`, `"Recursos Humanos"` y `"Talento Humano"`
 * mapean al mismo nivel `'hr'`). La comparación es case-insensitive y por
 * substring.
 */
export const DEPARTMENT_LEVEL_MAP: Record<string, AccessLevel> = {
  'Finanzas':                  'finance',
  'Jurídica':                  'legal',
  'Legal':                     'legal',
  'Retail':                    'retail',
  'Comercial':                 'retail',
  'E-Commerce':                'retail',
  'Tiendas':                   'retail',
  'RRHH':                      'hr',
  'Recursos Humanos':          'hr',
  'Talento Humano':            'hr',
  'Tecnología':                'it',
  'TI':                        'it',
  'Producto':                  'product',
  'Desarrollo de Producto':    'product',
  'Diseño de Producto':        'product',
  'Colecciones':               'product',
  'Servicios Administrativos': 'admin_services',
  'Administrativo':            'admin_services',
  'Recepción':                 'admin_services',
  'Gerencia':                  'manager',
  'Dirección':                 'manager',
};

/**
 * Palabras clave que identifican roles de administrador de plataforma.
 *
 * Si el `jobTitle` del usuario en Entra ID contiene alguna de estas cadenas
 * (comparación case-insensitive), se asigna el nivel `'admin'` directamente,
 * ignorando departamento y grupos de Azure AD.
 */
export const ADMIN_ROLE_KEYWORDS = [
  'superadmin',
  'administrador de plataforma',
  'admin intranet',
  'platform admin',
];

/**
 * Resuelve el {@link AccessLevel} de un usuario a partir de su departamento
 * y cargo en Entra ID.
 *
 * Es el **fallback de último recurso** en la cadena de resolución de acceso.
 * Para la resolución primaria basada en grupos de Azure AD, ver
 * {@link resolveAccessLevelFromGroups} en `microsoft-graph.ts`.
 *
 * @param department - Nombre del departamento según el perfil de Entra ID.
 * @param role       - Cargo del usuario (`jobTitle`). Si contiene alguna
 *   cadena de {@link ADMIN_ROLE_KEYWORDS}, retorna `'admin'` directamente
 *   sin evaluar el departamento.
 * @returns El {@link AccessLevel} correspondiente, o `'employee'` si ninguna
 *   regla coincide.
 *
 * @see {@link resolveAccessLevelFromGroups} — resolución primaria vía grupos
 *
 * @example
 * ```ts
 * resolveAccessLevel('Finanzas')                        // 'finance'
 * resolveAccessLevel('Tecnología', 'Admin Intranet')    // 'admin'
 * resolveAccessLevel('Área desconocida')                // 'employee'
 * ```
 */
export function resolveAccessLevel(
  department?: string | null,
  role?: string | null,
): AccessLevel {
  if (role) {
    const roleLower = role.toLowerCase();
    if (ADMIN_ROLE_KEYWORDS.some((kw) => roleLower.includes(kw))) return 'admin';
  }
  if (department) {
    const match = Object.entries(DEPARTMENT_LEVEL_MAP).find(([key]) =>
      department.toLowerCase().includes(key.toLowerCase()),
    );
    if (match) return match[1];
  }
  return 'employee';
}

/**
 * Permisos granulares del sistema en formato `módulo:acción`.
 *
 * Cada permiso está asociado a un nivel mínimo requerido o a una lista de
 * niveles permitidos en {@link PERMISSION_MAP}.
 *
 * @example
 * ```ts
 * 'retail:view_kpis'
 * 'finance:export'
 * 'admin:view'
 * ```
 */
export type Permission =
  // Finanzas
  | 'finance:view_kpis'
  | 'finance:view_modules'
  | 'finance:view_alerts'
  | 'finance:view_tools'
  | 'finance:view_dashboard'
  | 'finance:view_team'
  | 'finance:view_reports'
  | 'finance:view_invoices'
  | 'finance:approve_invoices'
  | 'finance:create_invoice'
  | 'finance:create_report'
  | 'finance:view_expenses'
  | 'finance:approve_expenses'
  | 'finance:view_budget'
  | 'finance:view_payments'
  | 'finance:approve_payments'
  | 'finance:view_vendors'
  | 'finance:manage_vendors'
  // Jurídica
  | 'legal:view_kpis'
  | 'legal:view_calendar'
  | 'legal:view_regulatory'
  | 'legal:view_quicklinks'
  | 'legal:view_contracts'
  | 'legal:view_requests'
  | 'legal:view_litigation'
  | 'legal:view_documents'
  | 'legal:manage_documents'
  | 'legal:view_team'
  // Retail
  | 'retail:view_kpis'
  | 'retail:view_quicklinks'
  | 'retail:view_commercial'
  | 'retail:view_ecommerce'
  | 'retail:view_stores'
  | 'retail:view_analytics'
  | 'retail:view_team'
  // RRHH
  | 'hr:view_kpis'
  | 'hr:view_apps'
  | 'hr:view_quicklinks'
  | 'hr:view_anniversaries'
  | 'hr:view_training'
  | 'hr:view_headcount'
  | 'hr:view_requests'
  | 'hr:view_recruitment'
  | 'hr:view_analytics'
  | 'hr:view_team'
  // TI
  | 'it:view_kpis'
  | 'it:view_quicklinks'
  | 'it:view_tickets'
  | 'it:view_dashboard'
  | 'it:view_service_status'
  | 'it:view_server_monitor'
  | 'it:view_team'
  // Servicios Administrativos
  | 'admin_services:view_kpis'
  | 'admin_services:view_quicklinks'
  | 'admin_services:view_calendar'
  | 'admin_services:view_announcements'
  | 'admin_services:view_requests'
  | 'admin_services:view_documents'
  | 'admin_services:view_visitors'
  | 'admin_services:view_access_cards'
  | 'admin_services:view_team'
  // Producto
  | 'product:view_kpis'
  | 'product:view_collections'
  | 'product:view_techsheets'
  | 'product:view_samples'
  | 'product:view_stores'
  | 'product:view_alerts'
  | 'product:view_quicklinks'
  | 'product:view_tools'
  | 'product:view_calendar'
  | 'product:view_dashboard'
  | 'product:view_team'
  | 'product:create_techsheet'
  | 'product:approve_sample'
  | 'product:create_report'
  // Documentos
  | 'docs:view_statbar'
  | 'docs:view_repository'
  | 'docs:view_recent'
  | 'docs:view_owners'
  | 'docs:create'
  | 'docs:review_approvals'
  | 'docs:upload'
  | 'docs:delete'
  // Admin
  | 'admin:access'
  | 'admin:manage_roles'
  | 'admin:view_audit_log';

/**
 * Define la forma de una regla de permiso en {@link PERMISSION_MAP}.
 *
 * Existen dos formas mutuamente excluyentes:
 * - `minLevel` — el usuario debe tener al menos ese nivel según
 *   {@link LEVEL_HIERARCHY}. Equivale a usar {@link atLeast}.
 * - `allowedLevels` — el usuario debe pertenecer **exactamente** a uno de
 *   los niveles listados. No aplica jerarquía.
 *
 * @remarks
 * Usar `allowedLevels` cuando el permiso debe estar acotado a roles
 * específicos sin importar la jerarquía (ej. `finance` puede ver facturas
 * pero `it`, que es jerárquicamente superior, no debe verlas).
 */
export type PermissionRule =
  | { minLevel: AccessLevel }
  | { allowedLevels: AccessLevel[] };

/**
 * Mapa que asocia cada {@link Permission} con su {@link PermissionRule}.
 *
 * @remarks
 * Agregar un nuevo permiso aquí es suficiente para que {@link can} lo evalúe
 * automáticamente. No requiere cambios en los componentes consumidores.
 *
 * Convenciones de diseño:
 * - `view_team` de cualquier módulo usa `minLevel: 'employee'` — el equipo
 *   es visible para todos.
 * - Acciones transaccionales (`approve_*`, `create_*`, `manage_*`) usan
 *   `allowedLevels` para evitar escalada involuntaria por jerarquía.
 * - `manager` se incluye explícitamente en `allowedLevels` cuando necesita
 *   visibilidad de KPIs o alertas cross-departamento.
 */
export const PERMISSION_MAP: Record<Permission, PermissionRule> = {
  // ── Finanzas ──────────────────────────────────────────────────
  'finance:view_kpis':        { allowedLevels: ['finance', 'manager', 'admin'] },
  'finance:view_dashboard':   { allowedLevels: ['finance', 'manager', 'admin'] },
  'finance:view_reports':     { allowedLevels: ['finance', 'manager', 'admin'] },
  'finance:view_invoices':    { allowedLevels: ['finance', 'admin']            },
  'finance:approve_invoices': { allowedLevels: ['finance', 'admin']            },
  'finance:create_invoice':   { allowedLevels: ['finance', 'admin']            },
  'finance:create_report':    { allowedLevels: ['finance', 'admin']            },
  'finance:view_modules':     { allowedLevels: ['finance', 'admin']            },
  'finance:view_alerts':      { allowedLevels: ['finance', 'manager', 'admin'] },
  'finance:view_tools':       { allowedLevels: ['finance', 'admin']            },
  'finance:view_team':        { minLevel: 'employee'                           },
  'finance:view_expenses':    { allowedLevels: ['finance', 'admin']            },
  'finance:approve_expenses': { allowedLevels: ['finance', 'admin']            },
  'finance:view_budget':      { allowedLevels: ['finance', 'manager', 'admin'] },
  'finance:view_payments':    { allowedLevels: ['finance', 'admin']            },
  'finance:approve_payments': { allowedLevels: ['finance', 'admin']            },
  'finance:view_vendors':     { allowedLevels: ['finance', 'manager', 'admin'] },
  'finance:manage_vendors':   { allowedLevels: ['finance', 'admin']            },

  // ── Jurídica ──────────────────────────────────────────────────
  'legal:view_kpis':          { allowedLevels: ['legal', 'manager', 'admin']  },
  'legal:view_calendar':      { allowedLevels: ['legal', 'manager', 'admin']  },
  'legal:view_regulatory':    { allowedLevels: ['legal', 'manager', 'admin']  },
  'legal:view_quicklinks':    { allowedLevels: ['legal', 'manager', 'admin']  },
  'legal:view_contracts':     { allowedLevels: ['legal', 'admin']             },
  'legal:view_requests':      { allowedLevels: ['legal', 'admin']             },
  'legal:view_litigation':    { allowedLevels: ['legal', 'admin']             },
  'legal:view_documents':     { allowedLevels: ['legal', 'admin']             },
  'legal:manage_documents':   { allowedLevels: ['legal', 'admin']             },
  'legal:view_team':          { minLevel: 'employee'                          },

  // ── Retail ────────────────────────────────────────────────────
  'retail:view_kpis':         { allowedLevels: ['retail', 'manager', 'admin'] },
  'retail:view_quicklinks':   { minLevel: 'employee'                          },
  'retail:view_team':         { minLevel: 'employee'                          },
  'retail:view_commercial':   { allowedLevels: ['retail', 'admin']            },
  'retail:view_ecommerce':    { allowedLevels: ['retail', 'admin']            },
  'retail:view_stores':       { allowedLevels: ['retail', 'admin']            },
  'retail:view_analytics':    { allowedLevels: ['retail', 'manager', 'admin'] },

  // ── RRHH ──────────────────────────────────────────────────────
  'hr:view_kpis':             { allowedLevels: ['hr', 'manager', 'admin']     },
  'hr:view_apps':             { allowedLevels: ['hr', 'manager', 'admin']     },
  'hr:view_quicklinks':       { allowedLevels: ['hr', 'manager', 'admin']     },
  'hr:view_anniversaries':    { allowedLevels: ['hr', 'manager', 'admin']     },
  'hr:view_training':         { allowedLevels: ['hr', 'manager', 'admin']     },
  'hr:view_team':             { minLevel: 'employee'                          },
  'hr:view_headcount':        { allowedLevels: ['hr', 'admin']                },
  'hr:view_requests':         { allowedLevels: ['hr', 'admin']                },
  'hr:view_recruitment':      { allowedLevels: ['hr', 'admin']                },
  'hr:view_analytics':        { allowedLevels: ['hr', 'admin']                },

  // ── TI ────────────────────────────────────────────────────────
  'it:view_kpis':             { allowedLevels: ['it', 'manager', 'admin']     },
  'it:view_quicklinks':       { minLevel: 'employee'                          },
  'it:view_team':             { minLevel: 'employee'                          },
  'it:view_tickets':          { allowedLevels: ['it', 'manager', 'admin']     },
  'it:view_dashboard':        { allowedLevels: ['it', 'admin']                },
  'it:view_service_status':   { allowedLevels: ['it', 'admin']                },
  'it:view_server_monitor':   { allowedLevels: ['it', 'admin']                },

  // ── Servicios Administrativos ─────────────────────────────────
  'admin_services:view_kpis':          { minLevel: 'employee'                       },
  'admin_services:view_quicklinks':    { minLevel: 'employee'                       },
  'admin_services:view_calendar':      { minLevel: 'employee'                       },
  'admin_services:view_announcements': { minLevel: 'employee'                       },
  'admin_services:view_requests':      { minLevel: 'employee'                       },
  'admin_services:view_documents':     { minLevel: 'employee'                       },
  'admin_services:view_team':          { minLevel: 'employee'                       },
  'admin_services:view_visitors':      { allowedLevels: ['admin_services', 'admin'] },
  'admin_services:view_access_cards':  { allowedLevels: ['admin_services', 'admin'] },

  // ── Producto ──────────────────────────────────────────────────
  //
  // Separación de responsabilidades:
  //   view_kpis         → manager puede ver indicadores de colección
  //   view_collections  → product + manager: colecciones activas y temporadas
  //   view_techsheets   → solo product + admin: fichas técnicas son IP sensible
  //   view_samples      → product + manager: estado de muestras y aprobaciones
  //   view_stores       → product + retail + manager: distribución por punto de venta
  //   view_alerts       → product + manager: retrasos, rechazos, vencimientos
  //   view_quicklinks   → product + manager: accesos rápidos del área
  //   view_tools        → solo product + admin: acceso a PLM y herramientas internas
  //   view_calendar     → product + manager: calendario de temporadas y entregas
  //   view_dashboard    → product + manager + admin: panel de lanzamientos por tienda
  //   view_team         → todos los empleados
  //   create_techsheet  → solo product + admin: crear / editar fichas técnicas
  //   approve_sample    → solo product + admin: acción transaccional
  //   create_report     → solo product + admin: exportar reportes
  'product:view_kpis':        { allowedLevels: ['product', 'manager', 'admin']           },
  'product:view_collections': { allowedLevels: ['product', 'manager', 'admin']           },
  'product:view_techsheets':  { allowedLevels: ['product', 'admin']                      },
  'product:view_samples':     { allowedLevels: ['product', 'manager', 'admin']           },
  'product:view_stores':      { allowedLevels: ['product', 'retail', 'manager', 'admin'] },
  'product:view_alerts':      { allowedLevels: ['product', 'manager', 'admin']           },
  'product:view_quicklinks':  { allowedLevels: ['product', 'manager', 'admin']           },
  'product:view_tools':       { allowedLevels: ['product', 'admin']                      },
  'product:view_calendar':    { allowedLevels: ['product', 'manager', 'admin']           },
  'product:view_dashboard':   { allowedLevels: ['product', 'manager', 'admin']           },
  'product:view_team':        { minLevel: 'employee'                                     },
  'product:create_techsheet': { allowedLevels: ['product', 'admin']                      },
  'product:approve_sample':   { allowedLevels: ['product', 'admin']                      },
  'product:create_report':    { allowedLevels: ['product', 'admin']                      },

  // ── Documentos ────────────────────────────────────────────────
  'docs:view_statbar':     { minLevel: 'employee' },
  'docs:view_repository':  { minLevel: 'employee' },
  'docs:view_recent':      { minLevel: 'employee' },
  'docs:view_owners':      { minLevel: 'manager'  },
  'docs:create':           { minLevel: 'manager'  },
  'docs:review_approvals': { minLevel: 'manager'  },
  'docs:upload':           { minLevel: 'it'       },
  'docs:delete':           { allowedLevels: ['admin'] },

  // ── Admin ─────────────────────────────────────────────────────
  'admin:access':        { allowedLevels: ['admin'] },
  'admin:manage_roles':  { allowedLevels: ['admin'] },
  'admin:view_audit_log':{ allowedLevels: ['admin'] },
};

/**
 * Verifica si un usuario tiene permiso para ejecutar una acción específica.
 *
 * Evalúa la {@link PermissionRule} asociada al permiso en {@link PERMISSION_MAP}:
 * - Si la regla es `allowedLevels`, comprueba pertenencia exacta al array.
 * - Si la regla es `minLevel`, delega en {@link atLeast}.
 *
 * @remarks
 * Los elementos sin acceso deben **ocultarse del DOM completamente** —
 * no mostrarse deshabilitados o bloqueados visualmente.
 *
 * @param level      - Nivel de acceso del usuario autenticado.
 * @param permission - Permiso requerido en formato `módulo:acción`.
 * @returns `true` si el nivel del usuario satisface la regla del permiso.
 *
 * @example
 * ```ts
 * can('manager', 'retail:view_kpis')   // true
 * can('employee', 'finance:export')    // false
 * can('admin', 'admin:access')         // true
 * can('it', 'finance:view_invoices')   // false — it es jerárquicamente
 *                                      // superior a finance pero no está
 *                                      // en su allowedLevels
 * ```
 */
export function can(level: AccessLevel, permission: Permission): boolean {
  const rule = PERMISSION_MAP[permission];
  if ('allowedLevels' in rule) return rule.allowedLevels.includes(level);
  return atLeast(level, rule.minLevel);
}

/**
 * Representa al usuario autenticado con todos sus atributos de identidad
 * y acceso resueltos.
 *
 * Se construye durante el callback `jwt` de `auth.ts` combinando los datos
 * de la sesión de NextAuth con el perfil de Microsoft Graph.
 *
 * @remarks
 * El campo `accessLevel` se resuelve una sola vez en el callback `jwt` y
 * queda almacenado en el token, evitando consultas adicionales a Graph en
 * cada request.
 */
export interface AppUser {
  /** Identificador único del usuario en Azure AD. */
  id: string;
  /** Nombre completo del colaborador. */
  name: string;
  /** Correo corporativo del colaborador. */
  email: string;
  /** URL de la foto de perfil obtenida desde Microsoft Graph. */
  image?: string | null;
  /** Cargo del colaborador según su perfil en Entra ID (`jobTitle`). */
  role: string;
  /** Nombre del departamento según su perfil en Entra ID. */
  department: string;
  /** Nivel de acceso resuelto a partir del departamento y grupos de Azure AD. */
  accessLevel: AccessLevel;
  /** Sede o ciudad donde trabaja el colaborador. */
  location?: string;
  /** Identificador del empleado en el sistema de RRHH de EDM. */
  employeeId?: string;
  /** Fecha de ingreso a la empresa en formato legible (ej. `"marzo 2024"`). */
  joined?: string;
  /** Teléfono de contacto del colaborador. */
  phone?: string;
}