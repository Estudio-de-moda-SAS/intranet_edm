// proxy.ts
import { auth }                  from "@/auth";
import { NextResponse }          from "next/server";
import { resolveDevAccessLevel } from "@/lib/devSession";
import { can }                   from "@/lib/roles";
import type { AccessLevel, Permission } from "@/lib/roles";

const LAST_PAGE_COOKIE = "edm_last_page";

const PREFIX_PERMISSIONS: { prefix: string; permission: Permission }[] = [
// ── Finanzas ──────────────────────────────────────────────────
  { prefix: "/finance/reports/new",              permission: "finance:create_report" },
  { prefix: "/finance/reports",                  permission: "finance:view_reports"  },
  { prefix: "/departments/finance/invoices/nueva", permission: "finance:create_invoice"   },
  { prefix: "/departments/finance/invoices",       permission: "finance:view_invoices"    },
  { prefix: "/departments/finance/expenses",       permission: "finance:view_expenses"},
  { prefix: "/departments/finance/budget",         permission: "finance:view_budget"},
  { prefix: "/departments/finance/reports",         permission: "finance:view_reports"},
  { prefix: "/departments/finance/payments",        permission: "finance:view_payments"},
  { prefix: "/departments/finance/vendors",         permission: "finance:view_vendors"},
  
  // ── Jurídica ──────────────────────────────────────────────────
  { prefix: "/legal/contracts",       permission: "legal:view_contracts"   },
  { prefix: "/legal/litigations",     permission: "legal:view_litigation"  },
  { prefix: "/legal/documents",       permission: "legal:view_documents"   },
  { prefix: "/legal/requests",        permission: "legal:view_requests"    },
  { prefix: "/legal",                 permission: "legal:view_kpis"        },

  // ── Retail ────────────────────────────────────────────────────
  { prefix: "/comercial",             permission: "retail:view_commercial"  },
  { prefix: "/ecommerce",             permission: "retail:view_ecommerce"   },
  { prefix: "/tiendas",               permission: "retail:view_stores"      },
  { prefix: "/retail",                permission: "retail:view_kpis"        },

  // ── RRHH ──────────────────────────────────────────────────────
  { prefix: "/rrhh/empleados/nuevo",  permission: "hr:view_recruitment"    },
  { prefix: "/departments/human-resources/employees", permission: "hr:view_headcount" },
  { prefix: "/rrhh/nomina",           permission: "hr:view_requests"       },
  { prefix: "/rrhh/configuracion",    permission: "hr:view_requests"       },
  { prefix: "/rrhh",                  permission: "hr:view_kpis"           },

  // ── TI ────────────────────────────────────────────────────────
  { prefix: "/it/activos",            permission: "it:view_dashboard"      },
  { prefix: "/it/iam",                permission: "it:view_service_status" },
  { prefix: "/it",                    permission: "it:view_kpis"           },

  // ── Servicios Administrativos ─────────────────────────────────
  { prefix: "/administrative/visitors",     permission: "admin_services:view_visitors"     },
  { prefix: "/administrative/access-cards", permission: "admin_services:view_access_cards" },
  { prefix: "/administrative",              permission: "admin_services:view_kpis"         },

  // ── Documentos ────────────────────────────────────────────────
  { prefix: "/documentos/aprobaciones", permission: "docs:review_approvals" },
  { prefix: "/documentos/nuevo",        permission: "docs:create"           },
  { prefix: "/documentos",              permission: "docs:view_statbar"     },

  // ── Admin ─────────────────────────────────────────────────────
  { prefix: "/admin",                   permission: "admin:access"          },
];

const SKIP_LAST_PAGE = [
  "/unauthorized",
  "/login",
  "/api",
  "/_next",
];

export default auth(function proxy(req) {
  const { pathname } = req.nextUrl;

  // Rutas públicas — nunca se protegen
  const isPublic =
    pathname.startsWith("/login")        ||
    pathname.startsWith("/unauthorized") ||
    pathname.startsWith("/api/auth")     ||
    pathname.startsWith("/_next")        ||
    pathname.includes(".");

  if (isPublic) return NextResponse.next();

  // ✅ NUEVO: Sin sesión → redirigir a /login guardando la ruta de origen
  if (
    process.env.NEXT_PUBLIC_AUTH_BYPASS !== "true" &&
    !(req as any).auth?.user
  ) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Buscar el prefijo más específico que coincida
  const route = PREFIX_PERMISSIONS.find(r => pathname.startsWith(r.prefix));

  // Sin restricción → dejar pasar
  if (!route) {
    const res = NextResponse.next();
    if (!SKIP_LAST_PAGE.some(p => pathname.startsWith(p))) {
      res.cookies.set(LAST_PAGE_COOKIE, pathname, {
        httpOnly: true,
        sameSite: "lax",
        path:     "/",
        maxAge:   60 * 60 * 24,
      });
    }
    return res;
  }

  // Resolver accessLevel
  let accessLevel: AccessLevel;

  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") {
    accessLevel = resolveDevAccessLevel();
  } else {
    accessLevel = ((req as any).auth?.user?.accessLevel as AccessLevel) ?? "employee";
  }

  // Con permiso → dejar pasar
  if (can(accessLevel, route.permission)) {
    const res = NextResponse.next();
    if (!SKIP_LAST_PAGE.some(p => pathname.startsWith(p))) {
      res.cookies.set(LAST_PAGE_COOKIE, pathname, {
        httpOnly: true,
        sameSite: "lax",
        path:     "/",
        maxAge:   60 * 60 * 24,
      });
    }
    return res;
  }

  // Sin permiso → última página o /unauthorized
  const lastPage = req.cookies.get(LAST_PAGE_COOKIE)?.value;
  const fallback = new URL("/unauthorized", req.url);
  fallback.searchParams.set("from", pathname);

  if (lastPage && !SKIP_LAST_PAGE.some(p => lastPage.startsWith(p))) {
    return NextResponse.redirect(new URL(lastPage, req.url));
  }

  return NextResponse.redirect(fallback);
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};