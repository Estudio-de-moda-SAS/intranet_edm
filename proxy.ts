/**
 * @module proxy
 * Middleware de autenticación y control de acceso basado en rutas para
 * la intranet EDM.
 *
 * @remarks
 * Actúa como punto de control central para todas las peticiones entrantes,
 * aplicando tres capas de seguridad en orden:
 *
 * 1. **Rutas públicas** — `/login`, `/unauthorized`, `/api/auth` y assets
 *    estáticos pasan sin ninguna comprobación.
 * 2. **Autenticación** — cualquier ruta protegida sin sesión activa redirige
 *    a `/login` con el `callbackUrl` original para recuperar la navegación
 *    tras el login.
 * 3. **Autorización** — cada ruta protegida se compara contra
 *    {@link PREFIX_PERMISSIONS} para determinar el permiso requerido.
 *    Si el `accessLevel` del colaborador no tiene ese permiso, se redirige
 *    a la última página visitada o a `/unauthorized`.
 *
 * **Cookie `edm_last_page`:**
 * Se actualiza en cada navegación exitosa para implementar el patrón
 * "volver a donde estabas" cuando un colaborador intenta acceder a una
 * ruta sin permiso. La cookie es `httpOnly` con TTL de 24 horas.
 *
 * **Modo bypass:**
 * Cuando `NEXT_PUBLIC_AUTH_BYPASS === "true"`, el `accessLevel` se
 * resuelve desde {@link resolveDevAccessLevel} en lugar de la sesión
 * de NextAuth, permitiendo simular cualquier nivel de acceso en
 * desarrollo local sin autenticación con Entra ID.
 *
* @see `roles` (`lib/roles.ts`) — definición de permisos y niveles de acceso
 * @see `auth` (`auth.ts`) — configuración de NextAuth con Entra ID *
 * @example
 * ```
 * // Flujo de una petición a /departments/finance/invoices:
 * // 1. No es ruta pública → continúa
 * // 2. Tiene sesión activa → continúa
 * // 3. Coincide con prefix "/departments/finance/invoices"
 * //    → requiere permiso "finance:view_invoices"
 * // 4. accessLevel "finance" tiene ese permiso → NextResponse.next()
 * //    + actualiza cookie edm_last_page
 * ```
 */

import { auth }                  from "@/auth";
import { NextResponse }          from "next/server";
import { resolveDevAccessLevel } from "@/lib/devSession";
import { can }                   from "@/lib/roles";
import type { AccessLevel, Permission } from "@/lib/roles";

// ── Constantes ────────────────────────────────────────────────────────────────

/**
 * Nombre de la cookie que persiste la última ruta visitada con éxito.
 *
 * @remarks
 * Se usa como fallback de navegación cuando un colaborador intenta
 * acceder a una ruta sin permiso — en lugar de mostrar directamente
 * `/unauthorized`, se le redirige a su última página accesible.
 */
export const LAST_PAGE_COOKIE = "edm_last_page";

/**
 * Mapa de prefijos de ruta a permisos requeridos para acceder a ellas.
 *
 * @remarks
 * El orden de las entradas es crítico — el middleware selecciona el
 * **primer prefijo que coincida** con `pathname.startsWith()`. Por ello,
 * las rutas más específicas deben preceder a las más generales dentro
 * de cada sección. Por ejemplo, `/departments/finance/invoices/nueva`
 * debe ir antes que `/departments/finance/invoices`.
 *
 * Rutas sin entrada en este array se consideran de acceso libre para
 * cualquier colaborador autenticado (ej. `/home`, `/profile`,
 * `/directory`).
 *
 * Para agregar una nueva ruta protegida, añadir una entrada con el
 * prefijo más específico posible y el permiso correspondiente definido
 * en `roles.ts`.
 */
export const PREFIX_PERMISSIONS: { prefix: string; permission: Permission }[] = [
  // ── Finanzas ────────────────────────────────────────────────────────────
  { prefix: "/finance/reports/new",                permission: "finance:create_report"  },
  { prefix: "/finance/reports",                    permission: "finance:view_reports"   },
  { prefix: "/departments/finance/invoices/nueva", permission: "finance:create_invoice" },
  { prefix: "/departments/finance/invoices",       permission: "finance:view_invoices"  },
  { prefix: "/departments/finance/expenses",       permission: "finance:view_expenses"  },
  { prefix: "/departments/finance/budget",         permission: "finance:view_budget"    },
  { prefix: "/departments/finance/reports",        permission: "finance:view_reports"   },
  { prefix: "/departments/finance/payments",       permission: "finance:view_payments"  },
  { prefix: "/departments/finance/vendors",        permission: "finance:view_vendors"   },

  // ── Jurídica ────────────────────────────────────────────────────────────
  { prefix: "/legal/contracts",   permission: "legal:view_contracts"  },
  { prefix: "/legal/litigations", permission: "legal:view_litigation" },
  { prefix: "/legal/documents",   permission: "legal:view_documents"  },
  { prefix: "/legal/requests",    permission: "legal:view_requests"   },
  { prefix: "/legal",             permission: "legal:view_kpis"       },

  // ── Retail ──────────────────────────────────────────────────────────────
  { prefix: "/comercial",         permission: "retail:view_commercial" },
  { prefix: "/ecommerce",         permission: "retail:view_ecommerce"  },
  { prefix: "/tiendas",           permission: "retail:view_stores"     },
  { prefix: "/retail",            permission: "retail:view_kpis"       },

  // ── RRHH ────────────────────────────────────────────────────────────────
  { prefix: "/rrhh/empleados/nuevo",                          permission: "hr:view_recruitment" },
  { prefix: "/departments/human-resources/employees",         permission: "hr:view_headcount"   },
  { prefix: "/rrhh/nomina",                                   permission: "hr:view_requests"    },
  { prefix: "/rrhh/configuracion",                            permission: "hr:view_requests"    },
  { prefix: "/rrhh",                                          permission: "hr:view_kpis"        },

  // ── TI ──────────────────────────────────────────────────────────────────
  { prefix: "/it/activos", permission: "it:view_dashboard"      },
  { prefix: "/it/iam",     permission: "it:view_service_status" },
  { prefix: "/it",         permission: "it:view_kpis"           },

  // ── Servicios Administrativos ────────────────────────────────────────────
  { prefix: "/administrative/visitors",     permission: "admin_services:view_visitors"     },
  { prefix: "/administrative/access-cards", permission: "admin_services:view_access_cards" },
  { prefix: "/administrative",              permission: "admin_services:view_kpis"         },

  // ── Documentos ──────────────────────────────────────────────────────────
  { prefix: "/documentos/aprobaciones", permission: "docs:review_approvals" },
  { prefix: "/documentos/nuevo",        permission: "docs:create"           },
  { prefix: "/documentos",              permission: "docs:view_statbar"     },

  // ── Admin ────────────────────────────────────────────────────────────────
  { prefix: "/admin", permission: "admin:access" },
];

/**
 * Prefijos de ruta que nunca deben guardarse en la cookie
 * {@link LAST_PAGE_COOKIE}.
 *
 * @remarks
 * Evita que páginas de error, autenticación o internas de Next.js
 * queden como "última página visitada" y se usen como destino de
 * redirección tras un acceso denegado.
 */
export const SKIP_LAST_PAGE = [
  "/unauthorized",
  "/login",
  "/api",
  "/_next",
];

// ── Middleware ────────────────────────────────────────────────────────────────

/**
 * Función principal del middleware de Next.js, envuelta con `auth` de
 * NextAuth para tener acceso a la sesión en el contexto del Edge Runtime.
 *
 * @remarks
 * El middleware se ejecuta en el **Edge Runtime** de Next.js — no tiene
 * acceso a Node.js APIs ni a las funciones de servidor. Por ello, la
 * resolución del `accessLevel` se lee directamente desde la sesión de
 * NextAuth (ya calculada en el callback `jwt` de `auth.ts`) en lugar
 * de recalcularse aquí.
 *
 * **Orden de evaluación:**
 * 1. Si la ruta es pública → `NextResponse.next()` sin comprobaciones.
 * 2. Si no hay sesión y no hay bypass → redirige a `/login?callbackUrl=...`.
 * 3. Busca el prefijo más específico en {@link PREFIX_PERMISSIONS}.
 * 4. Si no hay prefijo → ruta libre, actualiza cookie y deja pasar.
 * 5. Si hay prefijo → evalúa `can(accessLevel, permission)`.
 * 6. Con permiso → actualiza cookie y deja pasar.
 * 7. Sin permiso → redirige a última página conocida o `/unauthorized`.
 *
 * @param req - Request de Next.js enriquecida por `auth` con la sesión
 *   del colaborador en `req.auth`.
 */
export default auth(function proxy(req) {
  const { pathname } = req.nextUrl;

  // ── 1. Rutas públicas ────────────────────────────────────────────────────
  const isPublic =
    pathname.startsWith("/login")        ||
    pathname.startsWith("/unauthorized") ||
    pathname.startsWith("/api/auth")     ||
    pathname.startsWith("/_next")        ||
    pathname.includes(".");

  if (isPublic) return NextResponse.next();

  // ── 2. Sin sesión → redirigir a login ────────────────────────────────────
  if (
    process.env.NEXT_PUBLIC_AUTH_BYPASS !== "true" &&
    !(req as any).auth?.user
  ) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 3. Buscar prefijo más específico ─────────────────────────────────────
  const route = PREFIX_PERMISSIONS.find((r) => pathname.startsWith(r.prefix));

  // ── 4. Sin restricción → dejar pasar y actualizar cookie ─────────────────
  if (!route) {
    const res = NextResponse.next();
    if (!SKIP_LAST_PAGE.some((p) => pathname.startsWith(p))) {
      res.cookies.set(LAST_PAGE_COOKIE, pathname, {
        httpOnly: true,
        sameSite: "lax",
        path:     "/",
        maxAge:   60 * 60 * 24,
      });
    }
    return res;
  }

  // ── 5. Resolver accessLevel ───────────────────────────────────────────────
  let accessLevel: AccessLevel;

  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") {
    accessLevel = resolveDevAccessLevel();
  } else {
    accessLevel = ((req as any).auth?.user?.accessLevel as AccessLevel) ?? "employee";
  }

  // ── 6. Con permiso → dejar pasar y actualizar cookie ─────────────────────
  if (can(accessLevel, route.permission)) {
    const res = NextResponse.next();
    if (!SKIP_LAST_PAGE.some((p) => pathname.startsWith(p))) {
      res.cookies.set(LAST_PAGE_COOKIE, pathname, {
        httpOnly: true,
        sameSite: "lax",
        path:     "/",
        maxAge:   60 * 60 * 24,
      });
    }
    return res;
  }

  // ── 7. Sin permiso → última página conocida o /unauthorized ──────────────
  const lastPage = req.cookies.get(LAST_PAGE_COOKIE)?.value;
  const fallback = new URL("/unauthorized", req.url);
  fallback.searchParams.set("from", pathname);

  if (lastPage && !SKIP_LAST_PAGE.some((p) => lastPage.startsWith(p))) {
    return NextResponse.redirect(new URL(lastPage, req.url));
  }

  return NextResponse.redirect(fallback);
});

// ── Configuración del matcher ─────────────────────────────────────────────────

/**
 * Configuración del matcher de Next.js para el middleware.
 *
 * @remarks
 * Excluye archivos estáticos (`_next/static`, `_next/image`,
 * `favicon.ico`) para evitar que el middleware se ejecute en peticiones
 * de assets que no necesitan control de acceso, optimizando el
 * rendimiento en el Edge Runtime.
 *
 * El patrón `/((?!_next/static|_next/image|favicon.ico).*)` cubre
 * todas las rutas de la aplicación excepto los assets mencionados.
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};