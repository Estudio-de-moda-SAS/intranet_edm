/**
 * @module RetailDashboard
 * Wrapper del dashboard analítico cross-canal del módulo de Retail.
 *
 * @remarks
 * Este componente actúa como contenedor principal del sistema
 * de dashboards analíticos del módulo de Retail.
 *
 * Su responsabilidad es:
 * - mantener la capa de renderizado en servidor (Server Component)
 * - delegar la interacción de usuario al componente cliente
 *   {@link RetailDashboardTabs}
 *
 * Este patrón permite separar:
 * - la carga y preparación de datos (lado servidor)
 * - la interacción y navegación (lado cliente)
 *
 * Actualmente, el componente no realiza data-fetching directo,
 * pero está preparado para evolucionar hacia un modelo donde:
 * - se obtengan datos analíticos centralizados (ej: getRetailAnalytics)
 * - se distribuyan a los dashboards de canal
 *
 * Esto lo convierte en el punto natural para integrar:
 * - agregaciones cross-canal
 * - métricas consolidadas
 * - caching y optimización SSR
 *
 * ### Relación con otros componentes
 *
 * - {@link RetailDashboardTabs}: maneja el estado del canal activo (cliente)
 * - Dashboards de canal: renderizan la analítica específica (comercial, e-commerce, tiendas)
 *
 * @example
 * ```tsx
 * <RetailDashboard />
 * ```
 */

// ✅ SERVER COMPONENT — sin "use client"
//
// RetailDashboard.tsx
// Wrapper Server Component del dashboard analítico cross-canal.
// Delega la selección de canal al Client Component RetailDashboardTabs.
// Aquí se puede añadir data-fetching SSR en el futuro (getRetailAnalytics()).

import { RetailDashboardTabs } from "./RetailDashboardTabs";

/**
 * Componente wrapper del dashboard analítico de Retail.
 *
 * @returns El sistema de dashboards con navegación por canal.
 *
 * @remarks
 * Este componente no contiene lógica de estado ni interacción.
 * Su único propósito es servir como capa de integración entre:
 * - la renderización en servidor
 * - el componente cliente encargado de la navegación
 *
 * En implementaciones futuras, este componente puede:
 * - obtener datos agregados del backend
 * - pasar dichos datos a los dashboards hijos
 * - centralizar la lógica de analítica del módulo
 *
 * @future
 * ```ts
 * const analytics = await getRetailAnalytics();
 * return <RetailDashboardTabs analytics={analytics} />;
 * ```
 */
export default function RetailDashboard() {
  // En el futuro: const analytics = await getRetailAnalytics();
  // Por ahora los dashboards de canal tienen sus propios datos internos.
  return <RetailDashboardTabs />;
}