/**
 * @module stores/dashboard
 * Store de Zustand para el estado global del dashboard de la intranet EDM.
 *
 * @remarks
 * Gestiona los datos de revenue compartidos entre los widgets del
 * dashboard principal. Permite que múltiples componentes accedan y
 * actualicen los datos de ingresos sin prop drilling.
 *
 * @example
 * ```tsx
 * const { revenue, setRevenue } = useDashboardStore();
 *
 * // Leer datos actuales
 * <RevenueChart data={revenue} />
 *
 * // Actualizar con datos reales desde la API
 * useEffect(() => {
 *   financeApi.getKPIs().then(d => setRevenue(d.revenueByMonth));
 * }, []);
 * ```
 */

import { create } from "zustand";

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Estado y acciones del store del dashboard.
 */
interface DashboardState {
  /**
   * Serie de datos de ingresos mensuales para la gráfica del dashboard.
   *
   * @remarks
   * Inicializado con datos mock representativos para mostrar la gráfica
   * antes de que lleguen los datos reales desde la API. Cada valor
   * representa el ingreso de un mes en la unidad definida por la API
   * (actualmente sin unidad específica — pendiente de integración).
   *
   * ⏳ Pendiente de reemplazar con datos reales desde `financeApi.getKPIs()`
   * cuando la integración con el ERP esté disponible.
   */
  revenue: number[];

  /**
   * Actualiza la serie de datos de ingresos del dashboard.
   *
   * @param data - Nueva serie de datos de ingresos mensuales.
   *
   * @example
   * ```ts
   * setRevenue([120_000, 98_000, 145_000, 132_000, 160_000, 178_000]);
   * ```
   */
  setRevenue: (data: number[]) => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────

/**
 * Store global del dashboard de la intranet EDM.
 *
 * @remarks
 * Los datos de `revenue` se inicializan con valores mock y deben
 * actualizarse con datos reales desde la API en el componente
 * que monta el dashboard, usando `setRevenue` en un `useEffect`.
 *
 * Para evitar re-renders innecesarios en componentes que solo necesitan
 * actualizar los datos sin leerlos, usar el selector de acción:
 *
 * ```tsx
 * // ✅ Solo suscribe a la acción
 * const setRevenue = useDashboardStore(s => s.setRevenue);
 *
 * // ✅ Solo suscribe a los datos
 * const revenue = useDashboardStore(s => s.revenue);
 * ```
 */
export const useDashboardStore = create<DashboardState>((set) => ({
  revenue: [400, 300, 500, 700, 600, 800],

  setRevenue: (data) => set({ revenue: data }),
}));