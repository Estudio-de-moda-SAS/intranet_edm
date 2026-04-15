# Intranet EDM — Documentación Técnica

Bienvenido a la documentación técnica del código fuente de la **Intranet Corporativa de Estudio de Moda S.A.S.**

---

## ¿Qué encontrarás aquí?

| Módulo | Descripción |
|---|---|
| **Roles y Permisos** | Sistema RBAC · `AccessLevel` · función `can()` · `atLeast()` · `levelRank()` · `resolveAccessLevel()` |
| **Microsoft Graph** | Cliente Graph · perfil de usuario · consultas paralelas · `microsoft-graph` module |
| **Servicios · Homepage** | Tipos Graph · `emptyPage<T>()` · `getHomePageData()` |
| **Servicios · Compartidos** | Helpers compartidos entre módulos · `format` · `avatar` · `news.utils` |
| **Hooks** | `useSettings` · `useApplySettings` · `useAnimationsEnabled` · `useGlobalSearch` · `useSearchFilter` · `useAppSession` · `useDevSession` |
| **Tipos y Modelos** | Interfaces de configuración · tickets · integraciones · `Employee` · `FinanceKPIs` · `HomeData` · tipos HR |
| **Solicitudes y Tickets** | Data layer · `TicketDetail` · `STATUS_CONFIG` · `buildDetail()` |
| **Configuración** | `APPS_CATALOG` · `CONFIG` · `DARK` · `EMPLOYEEFILTERS` · `SETTINGS` · valores por defecto |
| **Auth & Sesión** | NextAuth v5 · `auth` · `handlers` · `signIn` · `signOut` · `AppSession` · `DEV_SESSION` |
| **Componentes UI** | `Header` · `Dashboard` · `Home` · `Auth` · `Team` · `UI` · `PDF/PdfViewerModal` |
| **Settings Shell** | `ConfigSidebar` · `SaveBar` · `SettingsShell` · tabs · `SettingsInitializer` |
| **Proxy & Middleware** | `LAST_PAGE_COOKIE` · `PREFIX_PERMISSIONS` · `SKIP_LAST_PAGE` · `apiGet` |
| **Stores** | `ChatbotStore` · `DashboardStore` |
| **Documentos Legales** | `getLegalDocuments` · `Documents.Provider` |
| **Finanzas** | `financeApi` · `FinanceCategory` · `FinanceDashboard` · `FinanceKPIs` · `FinanceSummary` · `FinanceTransaction` |

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript (`strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`) |
| Estilos | Tailwind CSS v4 |
| Animaciones | Framer Motion |
| Autenticación | NextAuth v5 + Microsoft Entra ID |
| API corporativa | Microsoft Graph API |
| Infraestructura | Azure App Service |
| Documentación | TypeDoc v0.1.0 |

---

Variables requeridas en `.env.local`:

| Variable | Descripción |
|---|---|
| `AUTH_SECRET` | Secret para NextAuth (genera con `openssl rand -base64 32`) |
| `AUTH_MICROSOFT_ENTRA_ID_ID` | Client ID de la app en Azure |
| `AUTH_MICROSOFT_ENTRA_ID_SECRET` | Client Secret de la app en Azure |
| `AUTH_MICROSOFT_ENTRA_ID_ISSUER` | Tenant endpoint (`https://login.microsoftonline.com/<tenant-id>/v2.0`) |
| `NEXTAUTH_URL` | URL base de la app (ej. `http://localhost:3000`) |

---

> **v0.1.0** — Generado con [TypeDoc](https://typedoc.org)