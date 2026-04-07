// lib/devSession.ts
// ─────────────────────────────────────────────────────────────────────────────
// Sesión de desarrollo para bypass de Entra ID.
// Sin 'use client' — accesible desde Server y Client Components.
//
// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  🔧 DOS MODOS DE DESARROLLO — cambia DEV_MODE:                          ║
// ║                                                                          ║
// ║  MODO 'direct' (por defecto) — una línea:                               ║
// ║     accessLevel: 'admin'      → Todo                                    ║
// ║     accessLevel: 'finance'    → + Módulos y panel financiero            ║
// ║     accessLevel: 'legal'      → + Contratos, litigios, docs             ║
// ║     accessLevel: 'it'         → + Infra, servidores, dashboards         ║
// ║     accessLevel: 'logistics'  → + Almacenes, analítica logíst.          ║
// ║     accessLevel: 'retail'     → + Paneles comercial/ecomm/tienda        ║
// ║     accessLevel: 'hr'         → + Headcount, nómina, reclut.            ║
// ║     accessLevel: 'admin_services' → + Visitantes, tarjetas acceso       ║
// ║     accessLevel: 'manager'    → + KPIs, repositorios, tickets           ║
// ║     accessLevel: 'employee'   → Mínimos por área                        ║
// ║                                                                          ║
// ║  MODO 'groups' — simula grupos de Azure AD sin tenerlos creados:        ║
// ║     1. Cambia DEV_MODE a 'groups'                                        ║
// ║     2. Añade nombres de grupo en DEV_MOCK_GROUPS                        ║
// ║     El sistema los resuelve igual que en producción con Azure real      ║
// ╚══════════════════════════════════════════════════════════════════════════╝

import { resolveAccessLevel, type AccessLevel, type AppUser } from './roles';
import { resolveAccessLevelFromGroups }                        from './microsoft-graph';

// ── Modo activo ───────────────────────────────────────────────────────────────
// 👇 Cambia entre 'direct' y 'groups'
const DEV_MODE: 'direct' | 'groups' = 'groups';

// ── Grupos simulados (solo aplica cuando DEV_MODE = 'groups') ─────────────────
// 👇 Descomenta el grupo que quieras simular
const DEV_MOCK_GROUPS: string[] = [
  // 'Finanzas-EDM-Intranet',
  // 'Juridica-EDM-Intranet',
  // 'Logistica-EDM-Intranet',
  // 'RRHH-EDM-Intranet',
  // 'TI-EDM-Intranet',
  // 'Retail-EDM-Intranet',
  // 'Servicios-Administrativos-EDM-Intranet',
  // 'Gerencia-EDM-Intranet',
  // 'Producto-EDM-Intranet',
   'Admin-EDM-Intranet',
];

// ── Usuario base ──────────────────────────────────────────────────────────────

const DEV_USER_RAW = {
  id:          'dev-user-id',
  name:        'Juan Esteban Avendaño Gómez',
  email:       'aprendizti2@estudiodemoda.com.co',
  image:       null,
  role:        'Aprendiz TI 2',
  department:  'Tecnologia',
  location:    'Medellín, Colombia',
  employeeId:  'EMP-00142',
  joined:      'marzo 2024',
  phone:       '+57 310 555 0192',
  // 👇 Solo aplica cuando DEV_MODE = 'direct'
  accessLevel: 'employee' as AccessLevel | undefined,
};

// ── Resolución del nivel — función exportada para uso en proxy ────────────────
// Se llama en cada request, no se cachea como constante

export function resolveDevAccessLevel(): AccessLevel {
  if (DEV_MODE === 'groups') {
    const mockGroups = DEV_MOCK_GROUPS.map((name, i) => ({
      id:          `mock-group-${i}`,
      displayName: name,
    }));
    return resolveAccessLevelFromGroups(
      mockGroups,
      DEV_USER_RAW.department,
      DEV_USER_RAW.role,
    );
  }
  return DEV_USER_RAW.accessLevel
    ?? resolveAccessLevel(DEV_USER_RAW.department, DEV_USER_RAW.role);
}

const resolvedLevel: AccessLevel = resolveDevAccessLevel();

export const DEV_USER: AppUser = {
  ...DEV_USER_RAW,
  accessLevel: resolvedLevel,
};

export const DEV_SESSION = {
  user:        DEV_USER,
  accessToken: 'dev-token',
  expires:     '2099-01-01',
};

// ── Presets de usuarios de prueba ─────────────────────────────────────────────

export const DEV_USERS: Record<string, AppUser> = {
  employee: {
    ...DEV_USER,
    name:        'Carlos Ríos',
    role:        'Auxiliar Administrativo',
    department:  'Servicios Administrativos',
    accessLevel: 'employee',
  },
  manager: {
    ...DEV_USER,
    name:        'Andrea Morales',
    role:        'Directora General',
    department:  'Gerencia',
    accessLevel: 'manager',
  },
  admin_services: {
    ...DEV_USER,
    name:        'Luisa Fernanda Pérez',
    role:        'Coordinadora de Recepción',
    department:  'Servicios Administrativos',
    accessLevel: 'admin_services',
  },
  hr: {
    ...DEV_USER,
    name:        'Daniela Quintero',
    role:        'Coordinadora de Talento Humano',
    department:  'Recursos Humanos',
    accessLevel: 'hr',
  },
  retail: {
    ...DEV_USER,
    name:        'Mateo Londoño',
    role:        'Gerente Comercial',
    department:  'Retail',
    accessLevel: 'retail',
  },
  logistics: {
    ...DEV_USER,
    name:        'Felipe Castaño',
    role:        'Coordinador de Logística',
    department:  'Logística',
  },
  it: {
    ...DEV_USER,
    name:        'Juan Esteban Avendaño Gómez',
    role:        'Aprendiz TI 2',
    department:  'Tecnología',
    accessLevel: 'it',
  },
  legal: {
    ...DEV_USER,
    name:        'Valentina Ospina',
    role:        'Abogada Corporativa Senior',
    department:  'Jurídica',
    accessLevel: 'legal',
  },
  finance: {
    ...DEV_USER,
    name:        'Camila Torres',
    role:        'Analista Financiera Senior',
    department:  'Finanzas',
    accessLevel: 'finance',
  },
  admin: {
    ...DEV_USER,
    name:        'Sebastián Vargas',
    role:        'Administrador de Plataforma',
    department:  'Tecnología',
    accessLevel: 'admin',
  },
};