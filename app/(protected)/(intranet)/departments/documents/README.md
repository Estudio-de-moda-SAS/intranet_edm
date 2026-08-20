# Módulo de Documentos

Explorador documental corporativo integrado 100% con **Microsoft 365** (OneDrive, SharePoint y Grupos/Teams). No tiene backend propio: cada navegador habla directamente con **Microsoft Graph** usando el token delegado del usuario autenticado vía MSAL. No hay base de datos ni API intermedia — Supabase existe en el proyecto pero no se usa en este módulo.

Ruta de la app: `/departments/documents`
Ruta en disco: `app/(protected)/(intranet)/departments/documents/`

## 1. Qué hay realmente activo hoy

`page.tsx` (Server Component) resuelve el `accessLevel` del usuario y renderiza `components/DocumentHomePage.tsx`, que a su vez monta **un único componente funcional**: `components/DocumentWorkspace/DocumentWorkspace.tsx`, el explorador real conectado a Graph.

`DocumentHomePage.tsx` tiene dos flags hardcodeados en `false`:

```ts
const SHOW_EXPLORER = false; // oculta DocumentsExplorer.tsx (herramienta interna de dev)
const SHOW_OWNERS   = false; // oculta DocumentOwnersCard aunque el permiso docs:view_owners lo permita
```

Además, existe todo un **dashboard mock desconectado** (no importado desde ninguna ruta, solo referencia a datos hardcodeados en `config/documentData.ts`): `DocumentOpsCenter.tsx`, `DocumentosDashboard.tsx`, `DocumentTable.tsx`, `DocumentQuickLinksStrip.tsx`, `DocumentStatBar.tsx`, `DocumentSidebarCards.tsx` (recientes/responsables). Es un diseño de una iteración anterior/futura (aprobaciones, vencimientos, clasificación de seguridad) que **no opera sobre documentos reales**. Al actualizar el módulo, decidir explícitamente si se retoma o se elimina — no asumir que está "funcionando" solo porque el código existe.

## 2. Arquitectura

```
Usuario → login MSAL (Azure AD) → token delegado
        → DocumentWorkspace (React) → hooks/useDocumentExplorer
        → services/*.service.ts → services/graphClient.ts → Microsoft Graph API
        → SharePoint / OneDrive / Grupos M365
```

- **Auth**: `@azure/msal-browser` + `@azure/msal-react`. Instancia y helpers en `app/api/auth/msal.ts` (a pesar del nombre de carpeta, es 100% cliente). Login por popup con fallback a redirect; maneja `QuotaExceededError` y guards de `handleRedirectPromise`.
- **RBAC de UI** (no de datos): `lib/roles.ts` define `AccessLevel` y permisos `docs:*` (`view_statbar`, `view_repository`, `view_recent`, `view_owners`, `create`, `review_approvals`, `upload`, `delete`). Hoy solo `docs:view_owners` está realmente conectado (y detrás de `SHOW_OWNERS = false`, así que en la práctica no se ve nada distinto por rol todavía).
- **Autorización real de datos**: la impone Graph/SharePoint según los permisos reales del usuario en Azure AD. Un 403 se traduce en el estado `accessDenied` del hook — no es una capa que se pueda "configurar" desde este repo.
- **Middleware** (`proxy.ts`, Edge Runtime): controla acceso por prefijo de ruta usando las cookies `edm_authed` / `edm_access_level` que el cliente escribe tras el login. Es solo para evitar el "flash" de rutas protegidas antes de que MSAL resuelva la sesión; no valida tokens de Graph.

⚠️ **Ojo con la confusión de "dos Graph clients"**: este módulo tiene su propio `services/graphClient.ts` (fetch wrapper simple, cliente). Los widgets documentales de otros departamentos (Legal, Servicios Administrativos, en `lib/graph/departments/*.service.ts`) usan un cliente Graph **server-side distinto** (`lib/graph/graphClient.ts`) y en su mayoría siguen en mock, pendientes de Admin Consent del tenant. No comparten código con este módulo.

## 3. Estructura de archivos

```
page.tsx                                  Server Component, entrada de la ruta

components/
  DocumentHomePage.tsx / .css             Contenedor de la página (SHOW_EXPLORER / SHOW_OWNERS)
  DocumentWorkspace/
    DocumentWorkspace.tsx / .css          ⭐ Explorador real: tabs de fuente, tabla, breadcrumbs, drag&drop
  DepartmentSidebar/                      Sidebar de "Áreas documentales" (catálogo SharePoint)
  DocumentsExplorer.tsx / .css            Herramienta interna de DEV para descubrir siteId de SharePoint
  DocumentOpsCenter.tsx                   (mock, no conectado)
  DocumentosDashboard.tsx                 (mock, no conectado)
  DocumentTable.tsx                       (mock, no conectado)
  DocumentQuickLinksStrip.tsx             (mock, no conectado)
  DocumentStatBar.tsx                     (mock, no conectado)
  DocumentSidebarCards.tsx                DocumentRecentCard / DocumentOwnersCard (mock)

config/
  documentSites.ts                        ⭐ Catálogo de 12 áreas documentales (siteId real de SharePoint)
  documentClassification.ts               Clasificación public/internal/confidential/restricted (solo usado por el mock)
  documentData.ts                         Datos mock del dashboard
  documentQuickLinks.ts / documentTeam.ts Config mock

hooks/
  useDocumentExplorer.ts                  ⭐ Estado y orquestación del explorador (fuente activa, breadcrumbs,
                                           caché en memoria, subida, accessDenied, deep-link)
  useDocumentDepartments.ts               Catálogo de áreas (via documentCatalog.service)

services/
  graphClient.ts                          Cliente Graph mínimo (GET/POST/PUT, paginación @odata.nextLink)
  driveNavigation.service.ts              Navegación de drives, mapeo driveItem → DocumentItem, upload, preview
  documentSource.service.ts               Facade que unifica las 4 fuentes bajo una sola API
  myDriveDiscovery.service.ts             Fuente "Mi unidad" (/me/drive)
  sharedWithMeDiscovery.service.ts        Fuente "Compartidos conmigo" (/me/drive/sharedWithMe)
  sharepointDiscovery.service.ts          Fuente "Áreas corporativas": sitios/bibliotecas/subsitios + upload
  teamsDriveDiscovery.service.ts          Fuente "Mis equipos" (/me/memberOf → /groups/{id}/drive)
  globalDocumentSearch.service.ts         ⭐ Búsqueda global (Microsoft Search API /search/query)
  documentCatalog.service.ts              CRUD de solo lectura sobre documentSites.ts

types/
  document.types.ts                       DocumentItem, DocumentLocation, DocumentSourceType, breadcrumbs
  documentDepartment.types.ts             DocumentDepartment (área documental)

utils/
  formatDocumentMeta.ts                   formatFileSize, formatShortDate, getFileExtension
  getDocumentIcon.ts                      Ícono/color por extensión de archivo
  getDepartmentIcon.ts                    Ícono por área del catálogo
  mapDocumentItemToPdfMetadata.ts         Adaptador DocumentItem → PdfMetadata (visor)
```

Componentes compartidos fuera del módulo:
- `app/api/auth/msal.ts` — sesión MSAL (`getAccessToken`, login/logout, cookies).
- `app/components/pdf/` — `PdfViewerModal` y lógica de previsualización, reutilizado por el explorador.
- `app/hooks/useGlobalSearch.ts` + `GlobalHeader.tsx` + `GlobalSearchResults.tsx` — integran `globalDocumentSearch.service.ts` en el buscador de toda la intranet.

## 4. Modelo de datos

Todo se normaliza a dos tipos (`types/document.types.ts`), y ningún componente de UI toca tipos crudos de Graph directamente:

- `DocumentItem`: `id, name, isFolder, size, mimeType, driveId, downloadUrl, webUrl, sharedBy, source`
- `DocumentLocation`: `{ driveId, itemId | null }`

## 5. Las 4 fuentes documentales (tabs del workspace)

| Fuente | Endpoint Graph | Scope requerido | Subida de archivos |
|---|---|---|---|
| `my-drive` (Mi unidad) | `/me/drive`, `/drives/{id}/root/children` | `Files.Read.All` | No soportada |
| `shared` (Compartidos conmigo) | `/me/drive/sharedWithMe` | `Files.Read.All` | No soportada |
| `corporate-sites` (Áreas corporativas) | `/sites/{siteId}/drives`, subsitios, `/drives/{id}/root/children` | `Sites.Read.All` + `Files.ReadWrite.All` | ✅ Sí |
| `teams` (Mis equipos) | `/me/memberOf` (grupos `Unified`) → `/groups/{id}/drive` | `User.Read` + `Files.Read.All` | No soportada |

Los scopes de Graph están **hardcodeados como constantes** en cada `*.service.ts` (no hay variable de entorno para esto) y se solicitan dinámicamente vía `getAccessToken({ silentExtraScopesToConsent })`.

## 6. Flujos principales

### Navegación y caché
`useDocumentExplorer` mantiene el estado completo del explorador: fuente activa, departamento/biblioteca/equipo seleccionado, `siteTrail` (breadcrumb de subsitios SharePoint), `breadcrumbs` (breadcrumb de carpetas) y una caché en memoria (`Map`, clave `source:driveId:itemId`) para no repetir llamadas a Graph al volver atrás. Distingue "área sin contenido" de "403 sin permiso" (`accessDenied`).

### Subida de archivos
Solo en `corporate-sites`: `uploadDocument` → `uploadSharePointFile` → `PUT /drives/{driveId}/items/{itemId}:/{name}:/content?@microsoft.graph.conflictBehavior=rename`. Soporta drag & drop y selector de archivo. Las demás fuentes lanzan un error explícito de "no disponible todavía".

### Búsqueda — dos niveles distintos
1. **Local**: filtro en cliente (`Array.filter`) sobre `currentItems`, dentro de la carpeta abierta.
2. **Global** (`globalDocumentSearch.service.ts`): usa `POST /search/query` de Microsoft Search API (`entityTypes: ["driveItem"]`), busca en todo lo que el usuario tiene permiso de ver en M365 (no solo el catálogo curado). Si el resultado es del OneDrive propio del usuario, genera un **deep-link** (`/departments/documents?source=my-drive&folder=...&highlight=...`) que abre la carpeta exacta y resalta la fila (`highlightedItemId` + scroll automático, vía `openLocationDirect`). Cualquier otro resultado abre `webUrl` directo en SharePoint/Office. Alimenta el buscador global del `GlobalHeader` (mezclado con navegación estática de la intranet).

### Áreas documentales (catálogo)
El catálogo ya **no** es un array estático por área: `config/documentSites.ts` define un único `DOCUMENTS_ROOT_SITE_ID` (el sitio raíz de SharePoint, `estudiodemoda.sharepoint.com/sites/FS`), y `documentCatalog.service.ts` descubre en tiempo real sus subsitios directos vía `getSharePointSubsites` (`GET /sites/{id}/sites`). Cada subsitio encontrado se convierte automáticamente en un área — no hace falta tocar código para que aparezca una nueva.

`documentSites.ts` solo aporta cosmética opcional por área ya conocida (`DEPARTMENT_OVERRIDES`: ícono, color, descripción, orden — indexado por `normalizeDepartmentKey(nombre)`) y una lista de exclusión (`EXCLUDED_SUBSITE_KEYS`) para subsitios que no deben listarse como área (sistema, pruebas). Un subsitio nuevo sin entrada en `DEPARTMENT_OVERRIDES` se lista igual, con ícono genérico y al final del listado.

El resultado se cachea en memoria por sesión de página (`documentCatalog.service.ts`) para no repetir la llamada a Graph en cada render del sidebar; `useDocumentDepartments().reload()` invalida esa caché y vuelve a consultar Graph.

**Riesgo a validar en el tenant real**: las claves de `DEPARTMENT_OVERRIDES` se derivaron del nombre humano de cada área tal como se mostraba en el catálogo anterior — deben verificarse contra el `displayName` real que devuelve Graph para cada subsitio (puede diferir en tildes/mayúsculas/texto). Si un área conocida no aparece con su ícono curado, ajustar la clave puntual en `documentSites.ts`. El propio comentario de `sharepointDiscovery.service.ts` también advierte que `/sites/{id}/sites` "tiene soporte algo limitado en Graph" y puede omitir subsitios en casos excepcionales — si un área no aparece, `resolveSharePointSiteByUrl` sigue disponible como respaldo manual.

### Vista previa de documentos
`PdfViewerModal` (compartido, `app/components/pdf/`) recibe un `PdfMetadata` mapeado desde `DocumentItem`:
- `.pdf` → iframe nativo.
- Office (`.xlsx/.docx/.pptx`, etc.) → embed vía Office Online o el embed WOPI que ya entrega Graph (`POST /drives/{id}/items/{id}/preview`). **Importante**: las URLs de preview de Graph no deben re-envolverse en Office Online — rompe el token WOPI y da 404 (el código ya lo contempla).
- Otros formatos → estado "no soportado" con enlace de descarga.
- Office Online no soporta modo oscuro (se avisa al usuario en la UI).

No se usa ninguna librería de renderizado (`react-pdf`, `mammoth`, `pdf.js`) — todo se apoya en iframes nativos y Office Online/WOPI.

## 7. Permisos — dos capas independientes

1. **UI/RBAC** (`lib/roles.ts`): gobierna qué bloques se muestran (statbar, repositorio, recientes, responsables, crear, aprobar, subir —`it`+—, borrar —solo `admin`—). Es una capa cosmética: no filtra qué documentos puede ver Graph.
2. **Datos reales**: los impone Microsoft Graph/SharePoint según los permisos del usuario en Azure AD. El resultado de un 403 se refleja como `accessDenied` en el hook.

Existe además un sistema de clasificación documental (`public/internal/confidential/restricted`, `canViewDocument()`, `filterDocsByAccess()` en `config/documentClassification.ts`) completo y bien diseñado, pero **solo lo usa el dashboard mock** — no está conectado al explorador real. No asumir que hoy hay control de acceso por clasificación sobre documentos reales de SharePoint.

## 8. Variables de entorno relevantes

Ninguna es específica del módulo de documentos (los scopes de Graph van hardcodeados en el código), pero estas afectan su funcionamiento:

```
NEXT_PUBLIC_AUTH_BYPASS        # activa sesión de desarrollo en vez de MSAL real
NEXT_PUBLIC_MSAL_CLIENT_ID     # Client ID de la app en Azure AD
NEXT_PUBLIC_MSAL_TENANT_ID     # Tenant ID (authority de MSAL)
NEXT_PUBLIC_REDIRECT_URI       # redirectUri de MSAL tras login
AZURE_GROUP_*                  # Object IDs de grupos Azure AD, usados por lib/roles.ts para resolver AccessLevel
```

`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` existen en el proyecto pero no los usa este módulo.

## 9. Dependencias clave

- `@azure/msal-browser`, `@azure/msal-react` — autenticación.
- `lucide-react` — iconografía por tipo de archivo/área.
- `@microsoft/microsoft-graph-client` está en `package.json` pero **no se usa aquí** — el módulo implementa su propio wrapper de `fetch` en `services/graphClient.ts` (candidato a unificación si se retoma el SDK oficial).
- `@tanstack/react-query`, `zustand` no se usan en este módulo (el estado se maneja con `useState`/`useRef`/`Map` propios en `useDocumentExplorer`).

## 10. Antes de tocar el módulo

- Si vas a extender la UI, decide primero si el "dashboard mock" (sección 1) se retoma, se rediseña o se elimina — mantenerlo sin conectar genera deuda y confusión.
- Si agregas una fuente documental nueva o cambias scopes de Graph, revisa `documentSource.service.ts` (el facade que las unifica) para no duplicar lógica de mapeo ya resuelta en `driveNavigation.service.ts`.
- Si cambias `DOCUMENTS_ROOT_SITE_ID`, valídalo con `DocumentsExplorer.tsx` o `resolveSharePointSiteByUrl` antes de hardcodearlo — un `siteId` mal formado falla en runtime con 400/404 de Graph, no en build. Para agregar cosmética a un área ya existente, basta con una entrada en `DEPARTMENT_OVERRIDES` — no requiere resolver ningún `siteId` nuevo.
- Existe trabajo más reciente sin fusionar en `origin/feat/documents` (posterior al merge actual en `main`) que amplía la búsqueda global con filtros por tipo de archivo y búsqueda de áreas — revisar esa rama antes de iniciar cambios grandes en búsqueda, para no duplicar trabajo.
- El módulo está documentado con TSDoc (`@module`, `@remarks`) pensado para generación automática vía `npm run docs:generate` (typedoc) — mantener esos comentarios al día en vez de duplicar aquí el detalle de cada función.
