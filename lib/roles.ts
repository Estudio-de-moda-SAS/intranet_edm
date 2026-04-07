/**
 * Define la jerarquía de niveles de acceso del sistema RBAC de la intranet EDM.
 *
 * Los niveles son ascendentes: un nivel superior incluye todos los permisos
 * de los niveles inferiores.
 *
 * - `employee` — colaborador base
 * - `manager` — jefatura o coordinación de área
 * - `finance` — acceso a módulos financieros sensibles
 * - `product` — acceso al módulo de producto y portafolio de marcas
 * - `admin` — acceso completo al portal y configuración
 */

/**
 * Permisos granulares del sistema en formato `módulo:acción`.
 *
 * Cada permiso está asociado a un nivel mínimo requerido en {@link PERMISSION_MAP}.
 *
 * @example
 * ```ts
 * 'retail:view_kpis'
 * 'finance:export'
 * 'admin:view'
 * ```
 */
export type AccessLevel =
/**
 * Permisos granulares del sistema en formato `módulo:acción`.
 *
 * Cada permiso está asociado a un nivel mínimo requerido en {@link PERMISSION_MAP}.
 *
 * @example
 * ```ts
 * 'retail:view_kpis'
 * 'finance:export'
 * 'admin:view'
 * ```
 */
  | 'admin'          // Superadministradores de la plataforma — todo
  | 'finance'        // Equipo de Finanzas
  | 'legal'          // Equipo Jurídico
  | 'retail'         // Equipo Retail / Comercial
  | 'hr'             // Recursos Humanos
  | 'it'             // Equipo de TI — infraestructura y sistemas
  | 'product'        // Equipo de Producto — colecciones, fichas técnicas, muestras
  | 'admin_services' // Servicios Administrativos / Recepción
  | 'manager'        // Gerencia / Dirección — acceso de lectura cross-departamento
  | 'employee';      // Resto de colaboradores

/**
 * Orden jerárquico ascendente de los niveles de acceso del sistema.
 * La posición en el array determina el rango — mayor índice, mayor acceso.
 *
 * @remarks
 * Agregar un nuevo nivel aquí es suficiente para que {@link levelRank},
 * {@link atLeast} y {@link can} lo evalúen correctamente.
 */
const LEVEL_HIERARCHY: AccessLevel[] = [
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

function levelRank(level: AccessLevel): number {
  return LEVEL_HIERARCHY.indexOf(level);
}

/**
 * Verifica si un nivel de acceso cumple o supera un nivel requerido.
 *
 * @param level - Nivel de acceso del usuario autenticado
 * @param required - Nivel mínimo requerido para la acción
 * @returns `true` si el nivel del usuario es igual o superior al requerido
 *
 * @example
 * ```ts
 * atLeast('finance', 'manager')  // true
 * atLeast('employee', 'hr')      // false
 * ```
 */
export function atLeast(level: AccessLevel, required: AccessLevel): boolean {
  return levelRank(level) >= levelRank(required);
}

/**
 * Mapeo de nombres de departamento de EDM a su nivel de acceso base.
 *
 * Se usa en {@link resolveAccessLevel} para asignar el nivel correcto
 * cuando el usuario no pertenece a ningún grupo de Azure AD explícito.
 *
 * @remarks
 * Incluye variantes de nombre para cubrir inconsistencias en los perfiles
 * de Entra ID (ej. "RRHH", "Recursos Humanos" y "Talento Humano" mapean
 * al mismo nivel `hr`).
 */
const DEPARTMENT_LEVEL_MAP: Record<string, AccessLevel> = {
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
 * (comparación case-insensitive), se le asigna el nivel `admin` directamente,
 * sin importar su departamento o grupos de Azure AD.
 */
const ADMIN_ROLE_KEYWORDS = [
  'superadmin',
  'administrador de plataforma',
  'admin intranet',
  'platform admin',
];

/**
 * Resuelve el {@link AccessLevel} de un usuario a partir de sus grupos de Azure AD.
 *
 * Consulta los grupos del usuario en Microsoft Entra ID y los mapea al nivel
 * correspondiente. Si el usuario no pertenece a ningún grupo conocido, retorna
 * `'employee'` como fallback seguro.
 *
 * @param groups - Lista de IDs o nombres de grupos obtenidos desde Microsoft Graph
 * @returns El nivel de acceso correspondiente al grupo de mayor jerarquía encontrado
 *
 * @remarks
 * Este mapeo se ejecuta en el callback `jwt` de `auth.ts` durante el login,
 * por lo que el `accessLevel` queda almacenado en el token y no requiere
 * consultas adicionales a Graph en cada request.
 */
export function resolveAccessLevel(
  // ...implementación existente
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
 * Cada permiso está asociado a un nivel mínimo requerido en {@link PERMISSION_MAP}.
 *
 * @example
 * ```ts
 * 'retail:view_kpis'
 * 'finance:export'
 * 'admin:view'
 * ```
 */
export type Permission =
/**
 * Mapa que asocia cada permiso con el nivel mínimo de acceso requerido.
 *
 * @remarks
 * Agregar un nuevo permiso aquí es suficiente para que {@link can} lo evalúe
 * automáticamente. No requiere cambios en los componentes consumidores.
 */
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
  | 'finance:view_expenses'      // gastos operativos
  | 'finance:approve_expenses'   // aprobar/rechazar gastos
  | 'finance:view_budget'        // presupuesto por departamento
  | 'finance:view_payments'      // pagos salientes
  | 'finance:approve_payments'   // ejecutar/programar pagos
  | 'finance:view_vendors'       // proveedores y suministradores
  | 'finance:manage_vendors'     // crear/editar/bloquear proveedores
  // Jurídica
  | 'legal:view_kpis'
  | 'legal:view_calendar'
  | 'legal:view_regulatory'
  | 'legal:view_quicklinks'
  | 'legal:view_contracts'
  | 'legal:view_requests'
  | 'legal:view_litigation'
  | 'legal:view_documents'
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
  // Producto — Estudio de Moda SAS
  | 'product:view_kpis'           // KPIs de colección: referencias activas, muestras aprobadas, etc.
  | 'product:view_collections'    // Colecciones y temporadas vigentes
  | 'product:view_techsheets'     // Fichas técnicas de prendas
  | 'product:view_samples'        // Estado de muestras y aprobaciones
  | 'product:view_stores'         // Distribución por tienda
  | 'product:view_alerts'         // Alertas: retrasos, rechazos, vencimientos
  | 'product:view_quicklinks'     // Accesos rápidos del área
  | 'product:view_tools'          // Herramientas del equipo (PLM, Centric, etc.)
  | 'product:view_calendar'       // Calendario de temporadas y entregas
  | 'product:view_dashboard'      // Panel de lanzamientos y estado de tiendas
  | 'product:view_team'           // Equipo visible para todos
  | 'product:create_techsheet'    // Crear / editar fichas técnicas
  | 'product:approve_sample'      // Aprobar o rechazar muestras
  | 'product:create_report'       // Exportar reportes de colección
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
 * Representa al usuario autenticado dentro del portal con todos sus atributos
 * de identidad y acceso resueltos.
 *
 * Se construye durante el callback `jwt` de `auth.ts` combinando los datos
 * de la sesión de NextAuth con el perfil de Microsoft Graph.
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
  /** Cargo del colaborador según su perfil en Entra ID. */
  role: string;
  /** Nombre del departamento según su perfil en Entra ID. */
  department: string;
  /** Nivel de acceso resuelto a partir del departamento y grupos de Azure AD. */
  accessLevel: AccessLevel;
  /** Sede o ciudad donde trabaja el colaborador. */
  location?: string;
  /** Identificador del empleado en el sistema de RRHH de EDM. */
  employeeId?: string;
  /** Fecha de ingreso a la empresa en formato legible. */
  joined?: string;
  /** Teléfono de contacto del colaborador. */
  phone?: string;
}

/**
 * Define la forma de una regla de permiso en {@link PERMISSION_MAP}.
 *
 * - `minLevel` — el usuario debe tener al menos ese nivel en la jerarquía
 * - `allowedLevels` — el usuario debe pertenecer a uno de los niveles listados exactamente
 */
type PermissionRule =
  | { minLevel: AccessLevel }
  | { allowedLevels: AccessLevel[] };

const PERMISSION_MAP: Record<Permission, PermissionRule> = {
  // ...valores existentes
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
  'admin_services:view_kpis':          { minLevel: 'employee'                               },
  'admin_services:view_quicklinks':    { minLevel: 'employee'                               },
  'admin_services:view_calendar':      { minLevel: 'employee'                               },
  'admin_services:view_announcements': { minLevel: 'employee'                               },
  'admin_services:view_requests':      { minLevel: 'employee'                               },
  'admin_services:view_documents':     { minLevel: 'employee'                               },
  'admin_services:view_team':          { minLevel: 'employee'                               },
  'admin_services:view_visitors':      { allowedLevels: ['admin_services', 'admin']         },
  'admin_services:view_access_cards':  { allowedLevels: ['admin_services', 'admin']         },

  // ── Producto — Estudio de Moda SAS ────────────────────────────
  //
  // Separación de responsabilidades:
  //   view_kpis         → manager puede ver indicadores de colección (% desarrollo, muestras OK)
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
  'product:view_kpis':          { allowedLevels: ['product', 'manager', 'admin']          },
  'product:view_collections':   { allowedLevels: ['product', 'manager', 'admin']          },
  'product:view_techsheets':    { allowedLevels: ['product', 'admin']                     },
  'product:view_samples':       { allowedLevels: ['product', 'manager', 'admin']          },
  'product:view_stores':        { allowedLevels: ['product', 'retail', 'manager', 'admin']},
  'product:view_alerts':        { allowedLevels: ['product', 'manager', 'admin']          },
  'product:view_quicklinks':    { allowedLevels: ['product', 'manager', 'admin']          },
  'product:view_tools':         { allowedLevels: ['product', 'admin']                     },
  'product:view_calendar':      { allowedLevels: ['product', 'manager', 'admin']          },
  'product:view_dashboard':     { allowedLevels: ['product', 'manager', 'admin']          },
  'product:view_team':          { minLevel: 'employee'                                    },
  'product:create_techsheet':   { allowedLevels: ['product', 'admin']                     },
  'product:approve_sample':     { allowedLevels: ['product', 'admin']                     },
  'product:create_report':      { allowedLevels: ['product', 'admin']                     },

  // ── Documentos ────────────────────────────────────────────────
  'docs:view_statbar':        { minLevel: 'employee'   },
  'docs:view_repository':     { minLevel: 'employee'   },
  'docs:view_recent':         { minLevel: 'employee'   },
  'docs:view_owners':         { minLevel: 'manager'    },
  'docs:create':              { minLevel: 'manager'    },
  'docs:review_approvals':    { minLevel: 'manager'    },
  'docs:upload':              { minLevel: 'it'         },
  'docs:delete':              { allowedLevels: ['admin'] },

  // ── Admin ─────────────────────────────────────────────────────
  'admin:access':             { allowedLevels: ['admin'] },
  'admin:manage_roles':       { allowedLevels: ['admin'] },
  'admin:view_audit_log':     { allowedLevels: ['admin'] },
};

/**
 * Verifica si un usuario tiene permiso para ejecutar una acción específica.
 *
 * Compara el nivel del usuario contra el nivel mínimo requerido por el permiso
 * en {@link PERMISSION_MAP}. Los elementos sin acceso deben ocultarse del DOM
 * completamente — no mostrarse bloqueados.
 *
 * @param userLevel - Nivel de acceso del usuario autenticado
 * @param permission - Permiso requerido en formato `módulo:acción`
 * @returns `true` si el nivel del usuario es suficiente, `false` en caso contrario
 *
 * @example
 * ```ts
 * can('manager', 'retail:view_kpis')  // true
 * can('employee', 'finance:export')   // false
 * can('admin', 'admin:view')          // true
 * ```
 */
export function can(level: AccessLevel, permission: Permission): boolean {
  // ...implementación existente
  const rule = PERMISSION_MAP[permission];
  if ('allowedLevels' in rule) return rule.allowedLevels.includes(level);
  return atLeast(level, rule.minLevel);
}

// ── 4. AppUser ────────────────────────────────────────────────────────────────

export interface AppUser {
  id:          string;
  name:        string;
  email:       string;
  image?:      string | null;
  role:        string;
  department:  string;
  accessLevel: AccessLevel;
  location?:   string;
  employeeId?: string;
  joined?:     string;
  phone?:      string;
}