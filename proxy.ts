/**
 * @module proxy
 * Middleware de autenticación y control de acceso basado en rutas para
 * la intranet EDM.
 *
 * @remarks
 * Actúa como punto de control central para todas las peticiones entrantes,
 * aplicando tres capas de seguridad en orden:
 *
 * 1. **Rutas públicas** — `/login`, `/unauthorized`, `/api` y assets
 *    estáticos pasan sin ninguna comprobación.
 * 2. **Autenticación** — cualquier ruta protegida sin la cookie
 *    `edm_authed` redirige a `/login` con el `callbackUrl` original.
 * 3. **Autorización** — cada ruta protegida se compara contra
 *    {@link PREFIX_PERMISSIONS} para determinar el permiso requerido.
 *    Si el `accessLevel` de la cookie no tiene ese permiso, se redirige
 *    a la última página visitada o a `/unauthorized`.
 *
 * **Cambio respecto a la versión NextAuth:**
 * Ya no se usa `auth()` de NextAuth para envolver el middleware — MSAL
 * es 100% cliente y no puede verificar tokens en el Edge Runtime.
 * En su lugar se usa una cookie `edm_authed` que el cliente escribe tras
 * el login exitoso de MSAL, y una cookie `edm_access_level` que persiste
 * el nivel de acceso resuelto desde Graph.
 *
 * ⚠️ **Seguridad:** Las cookies `edm_authed` y `edm_access_level` son
 * `httpOnly: false` porque el cliente de MSAL (navegador) debe poder
 * escribirlas. La verificación real de identidad ocurre en el cliente
 * con MSAL — el middleware solo actúa como primera línea de defensa para
 * la UX (evitar flashes de rutas protegidas). Las llamadas a Graph desde
 * los services siempre requieren un access token válido de MSAL.
 *
 * **Cookie `edm_last_page`:**
 * Sin cambios respecto a la versión anterior — se actualiza en cada
 * navegación exitosa para el patrón "volver a donde estabas".
 *
 * **Modo bypass:**
 * Cuando `NEXT_PUBLIC_AUTH_BYPASS === "true"`, el `accessLevel` se
 * resuelve desde {@link resolveDevAccessLevel} en lugar de la cookie,
 * permitiendo simular cualquier nivel de acceso en desarrollo.
 *
 * @see `roles` (`lib/roles.ts`) — definición de permisos y niveles de acceso
 */

import { NextResponse, type NextRequest } from "next/server";
import { resolveDevAccessLevel }          from "@/lib/devSession";
import { can }                            from "@/lib/roles";
import type { AccessLevel, Permission }   from "@/lib/roles";

// ── Constantes ────────────────────────────────────────────────────────────────

/**
 * Cookie que el cliente escribe tras un login exitoso de MSAL.
 * Su presencia indica que hay una sesión activa en el navegador.
 *
 * @remarks
 * No es `httpOnly` porque el cliente JavaScript de MSAL debe poder
 * escribirla. No contiene datos sensibles — solo indica si hay sesión.
 */
export const AUTH_COOKIE = "edm_authed";

/**
 * Cookie que persiste el `AccessLevel` resuelto desde Microsoft Graph.
 * Se escribe junto con {@link AUTH_COOKIE} tras el login exitoso.
 *
 * @remarks
 * El middleware la lee para evaluar permisos de ruta sin llamadas
 * adicionales a Graph. Si no existe, el nivel por defecto es `'employee'`.
 */
export const ACCESS_LEVEL_COOKIE = "edm_access_level";

/**
 * Nombre de la cookie que persiste la última ruta visitada con éxito.
 *
 * @remarks
 * Se usa como fallback de navegación cuando un colaborador intenta
 * acceder a una ruta sin permiso.
 */
export const LAST_PAGE_COOKIE = "edm_last_page";

/**
 * Mapa de prefijos de ruta a permisos requeridos para acceder a ellas.
 *
 * @remarks
 * El orden es crítico — se selecciona el **primer prefijo que coincida**.
 * Las rutas más específicas deben preceder a las más generales.
 *
 * Rutas sin entrada se consideran de acceso libre para cualquier
 * colaborador autenticado.
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
  { prefix: "/rrhh/empleados/nuevo",                  permission: "hr:view_recruitment" },
  { prefix: "/departments/human-resources/employees", permission: "hr:view_headcount"   },
  { prefix: "/rrhh/nomina",                           permission: "hr:view_requests"    },
  { prefix: "/rrhh/configuracion",                    permission: "hr:view_requests"    },
  { prefix: "/rrhh",                                  permission: "hr:view_kpis"        },

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
 * Prefijos que nunca deben guardarse en {@link LAST_PAGE_COOKIE}.
 */
export const SKIP_LAST_PAGE = [
  "/unauthorized",
  "/login",
  "/api",
  "/_next",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Escribe la cookie `edm_last_page` en la respuesta dada.
 * @internal
 */
function setLastPageCookie(res: NextResponse, pathname: string): void {
  if (SKIP_LAST_PAGE.some((p) => pathname.startsWith(p))) return;
  res.cookies.set(LAST_PAGE_COOKIE, pathname, {
    httpOnly: true,
    sameSite: "lax",
    path:     "/",
    maxAge:   60 * 60 * 24,
  });
}

// ── Middleware ────────────────────────────────────────────────────────────────

/**
 * Función principal del middleware de Next.js.
 *
 * @remarks
 * A diferencia de la versión anterior con NextAuth, esta función ya no
 * está envuelta con `auth()` — MSAL corre exclusivamente en el cliente
 * y no puede verificar tokens en el Edge Runtime.
 *
 * La verificación de sesión se basa en la cookie {@link AUTH_COOKIE} que
 * el cliente escribe tras un login exitoso de MSAL. La autorización usa
 * la cookie {@link ACCESS_LEVEL_COOKIE} para evitar llamadas a Graph.
 *
 * **Orden de evaluación:**
 * 1. Si la ruta es pública → `NextResponse.next()`.
 * 2. Si no hay `edm_authed` y no hay bypass → redirige a `/login`.
 * 3. Busca el prefijo más específico en {@link PREFIX_PERMISSIONS}.
 * 4. Sin restricción → deja pasar y actualiza cookie.
 * 5. Con restricción → evalúa `can(accessLevel, permission)`.
 * 6. Con permiso → deja pasar y actualiza cookie.
 * 7. Sin permiso → redirige a última página conocida o `/unauthorized`.
 *
 * @param req - Request de Next.js.
 */
export default function proxy(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  // ── 1. Rutas públicas ──────────────────────────────────────────────────
  const isPublic =
    pathname.startsWith("/login")        ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/unauthorized") ||
    pathname.startsWith("/api")          ||
    pathname.startsWith("/_next")        ||
    pathname.includes(".");

  if (isPublic) return NextResponse.next();

  // ── 2. Sin sesión → redirigir a login ─────────────────────────────────
  const isAuthenticated =
    process.env.NEXT_PUBLIC_AUTH_BYPASS === "true" ||
    req.cookies.get(AUTH_COOKIE)?.value === "1";

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 3. Buscar prefijo más específico ──────────────────────────────────
  const route = PREFIX_PERMISSIONS.find((r) => pathname.startsWith(r.prefix));

  // ── 4. Sin restricción → dejar pasar ──────────────────────────────────
  if (!route) {
    const res = NextResponse.next();
    setLastPageCookie(res, pathname);
    return res;
  }

  // ── 5. Resolver accessLevel ───────────────────────────────────────────
  let accessLevel: AccessLevel;

  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") {
    accessLevel = resolveDevAccessLevel();
  } else {
    const cookieLevel = req.cookies.get(ACCESS_LEVEL_COOKIE)?.value;
    accessLevel = (cookieLevel as AccessLevel | undefined) ?? "employee";
  }

  // ── 6. Con permiso → dejar pasar ──────────────────────────────────────
  if (can(accessLevel, route.permission)) {
    const res = NextResponse.next();
    setLastPageCookie(res, pathname);
    return res;
  }

  // ── 7. Sin permiso → última página conocida o /unauthorized ───────────
  const lastPage = req.cookies.get(LAST_PAGE_COOKIE)?.value;
  const fallback  = new URL("/unauthorized", req.url);
  fallback.searchParams.set("from", pathname);

  if (lastPage && !SKIP_LAST_PAGE.some((p) => lastPage.startsWith(p))) {
    return NextResponse.redirect(new URL(lastPage, req.url));
  }

  return NextResponse.redirect(fallback);
}

// ── Configuración del matcher ─────────────────────────────────────────────────

/**
 * Excluye assets estáticos para no ejecutar el middleware en cada imagen
 * o chunk de JS, optimizando el rendimiento en el Edge Runtime.
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};