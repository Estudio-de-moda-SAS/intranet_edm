# Intranet EDM — Documentación Técnica

Bienvenido a la documentación técnica del código fuente de la **Intranet Corporativa de Estudio de Moda S.A.S.**

---

## ¿Qué encontrarás aquí?

| Módulo | Descripción |
|---|---|
| **Roles y Permisos** | Sistema RBAC · AccessLevel · función `can()` |
| **Microsoft Graph** | Cliente Graph · perfil de usuario · consultas paralelas |
| **Servicios · Homepage** | Tipos Graph · `emptyPage<T>()` · `getHomePageData()` |
| **Servicios · Compartidos** | Helpers compartidos entre módulos |
| **Hooks** | `useSettings` · `useApplySettings` · `useAnimationsEnabled` |
| **Tipos y Modelos** | Interfaces de configuración · tickets · integraciones |
| **Solicitudes y Tickets** | Data layer · `TicketDetail` · `STATUS_CONFIG` · `buildDetail()` |

---

## Stack

Next.js 15 · TypeScript Strict · Tailwind CSS v4 · NextAuth v5 · Microsoft Graph API · Azure App Service

---

## Comandos

```bash
npm run docs:generate   # Regenera esta documentación
```