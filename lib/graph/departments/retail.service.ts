/**
 * @module graph/departments/retail.service
 * Service agregador de datos para el departamento de Retail de la
 * intranet EDM.
 *
 * @remarks
 * Agrega en una sola llamada paralela los datos de los tres canales
 * de venta de EDM, delegando en cada service de canal existente sin
 * duplicar lógica:
 *
 * | Canal        | Service delegado           |
 * |--------------|----------------------------|
 * | Comercial    | {@link getCommercialData}  |
 * | Ecommerce    | {@link getEcommerceData}   |
 * | Tiendas      | {@link getStoresData}      |
 *
 * Los datos compartidos del usuario y la organización (`user`, `shared`)
 * ya están incluidos dentro de cada service individual a través de
 * {@link getSharedData} — no se duplican en este agregador.
 *
 * Las tres consultas se ejecutan en paralelo con `Promise.all` para
 * minimizar la latencia total del dashboard de Retail.
 *
 * @example
 * ```tsx
 * // En un Server Component:
 * export default async function RetailPage() {
 *   const data = await getRetailData();
 *   return <RetailDashboard data={data} />;
 * }
 * ```
 */

import { getCommercialData } from "@/lib/graph/departments/commercial.service";
import { getEcommerceData }  from "@/lib/graph/departments/ecommerce.service";
import { getStoresData }     from "@/lib/graph/departments/stores.service";

// ── Service principal ─────────────────────────────────────────────────────────

/**
 * Agrega y retorna los datos de los tres canales de venta de Retail en
 * una sola llamada paralela.
 *
 * @remarks
 * Ejecuta {@link getCommercialData}, {@link getEcommerceData} y
 * {@link getStoresData} en paralelo mediante `Promise.all`. Si alguno
 * de los tres services falla, la promesa completa rechazará — cada
 * service individual ya implementa su propio manejo de errores con
 * fallback a mock data, por lo que en la práctica este agregador
 * no debería fallar en condiciones normales.
 *
 * Si en el futuro se requiere resiliencia ante fallos individuales de
 * canal (mostrar los canales disponibles aunque uno falle), reemplazar
 * `Promise.all` por `Promise.allSettled` y manejar los casos de rechazo
 * en el componente consumidor.
 *
 * @returns Objeto con los datos de los tres canales:
 *   - `commercial` — datos del canal Comercial ({@link CommercialData})
 *   - `ecommerce`  — datos del canal Ecommerce ({@link EcommerceData})
 *   - `stores`     — datos del canal Tiendas ({@link StoresData})
 *
 * @example
 * ```ts
 * const { commercial, ecommerce, stores } = await getRetailData();
 *
 * console.log(commercial.kpis.ventasMes);   // "$284K"
 * console.log(ecommerce.kpis.gmvMes);       // "$198K"
 * console.log(stores.kpis.ventasTotales);   // según StoresData
 * ```
 */
export async function getRetailData() {
  const [commercial, ecommerce, stores] = await Promise.all([
    getCommercialData(),
    getEcommerceData(),
    getStoresData(),
  ]);

  return {
    commercial,
    ecommerce,
    stores,
  };
}

// ── Tipos exportados ──────────────────────────────────────────────────────────

/**
 * Tipo inferido del valor resuelto por {@link getRetailData}.
 *
 * @remarks
 * Declarado con `Awaited<ReturnType<...>>` para que cualquier cambio en
 * la estructura de retorno de los services individuales (comercial,
 * ecommerce o tiendas) se propague automáticamente a todos los componentes
 * que consumen este tipo, sin necesidad de actualizarlo manualmente.
 *
 * @example
 * ```tsx
 * interface RetailDashboardProps {
 *   data: RetailData;
 * }
 * ```
 */
export type RetailData = Awaited<ReturnType<typeof getRetailData>>;