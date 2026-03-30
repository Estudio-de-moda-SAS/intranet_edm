// lib/roles.ts
// ─────────────────────────────────────────────────────────────────────────────
// Sistema de roles y permisos para la intranet.
// Diseñado para escalar hacia Entra ID / Azure AD Groups.
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. Niveles de acceso ──────────────────────────────────────────────────────

export type AccessLevel =
  | 'admin'          // Superadministradores de la plataforma — todo
  | 'finance'        // Equipo de Finanzas
  | 'legal'          // Equipo Jurídico
  | 'logistics'      // Equipo de Logística
  | 'retail'         // Equipo Retail / Comercial
  | 'hr'             // Recursos Humanos
  | 'it'             // Equipo de TI — infraestructura y sistemas
  | 'product'        // Equipo de Producto — colecciones, fichas técnicas, muestras
  | 'admin_services' // Servicios Administrativos / Recepción
  | 'manager'        // Gerencia / Dirección — acceso de lectura cross-departamento
  | 'employee';      // Resto de colaboradores

// Orden jerárquico — solo aplica para permisos con minLevel.
// Los niveles departamentales (finance, legal, it...) están por encima
// de manager porque tienen acceso especializado en su área.
// admin siempre gana — está al final.
const LEVEL_HIERARCHY: AccessLevel[] = [
  'employee',
  'manager',
  'admin_services',
  'hr',
  'retail',
  'product',
  'logistics',
  'it',
  'legal',
  'finance',
  'admin',
];

function levelRank(level: AccessLevel): number {
  return LEVEL_HIERARCHY.indexOf(level);
}

export function atLeast(level: AccessLevel, required: AccessLevel): boolean {
  return levelRank(level) >= levelRank(required);
}

// ── 2. Mapa departamento → nivel base ────────────────────────────────────────

const DEPARTMENT_LEVEL_MAP: Record<string, AccessLevel> = {
  'Finanzas':                  'finance',
  'Jurídica':                  'legal',
  'Legal':                     'legal',
  'Logística':                 'logistics',
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

const ADMIN_ROLE_KEYWORDS = [
  'superadmin',
  'administrador de plataforma',
  'admin intranet',
  'platform admin',
];

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

// ── 3. Permisos granulares ────────────────────────────────────────────────────
//
// Criterio para elegir entre minLevel vs allowedLevels:
//
//   minLevel      → el permiso es "de lectura general" y cualquier nivel
//                   igual o superior puede tenerlo (ej: ver KPIs de su área).
//                   Útil cuando manager/admin siempre deben ver algo.
//
//   allowedLevels → el permiso es sensible y SOLO los niveles listados
//                   explícitamente pueden tenerlo. Usar cuando no queremos
//                   que otros departamentos accedan aunque sean "superiores"
//                   en la jerarquía (ej: facturas de finanzas no las debe
//                   ver el equipo de IT aunque esté más arriba en el ranking).

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
  // Logística
  | 'logistics:view_statbar'
  | 'logistics:view_quicklinks'
  | 'logistics:view_operations'
  | 'logistics:view_shipments'
  | 'logistics:view_kpi_performance'
  | 'logistics:view_warehouses'
  | 'logistics:view_analytics'
  | 'logistics:view_team'
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

type PermissionRule =
  | { minLevel: AccessLevel }
  | { allowedLevels: AccessLevel[] };

const PERMISSION_MAP: Record<Permission, PermissionRule> = {

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

  // ── Logística ─────────────────────────────────────────────────
  'logistics:view_statbar':         { minLevel: 'employee'                              },
  'logistics:view_quicklinks':      { minLevel: 'employee'                              },
  'logistics:view_team':            { minLevel: 'employee'                              },
  'logistics:view_operations':      { allowedLevels: ['logistics', 'manager', 'admin'] },
  'logistics:view_shipments':       { allowedLevels: ['logistics', 'manager', 'admin'] },
  'logistics:view_kpi_performance': { allowedLevels: ['logistics', 'manager', 'admin'] },
  'logistics:view_warehouses':      { allowedLevels: ['logistics', 'admin']             },
  'logistics:view_analytics':       { allowedLevels: ['logistics', 'admin']             },

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

export function can(level: AccessLevel, permission: Permission): boolean {
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