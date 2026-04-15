/**
 * @module Loading
 * Componente de carga global de la aplicación.
 *
 * @remarks
 * Este componente se renderiza automáticamente en rutas de Next.js
 * cuando un Server Component está en proceso de carga.
 *
 * Su objetivo es:
 *
 * - mejorar la percepción de rendimiento
 * - evitar pantallas en blanco
 * - mantener consistencia visual con el layout real
 *
 * Implementa un skeleton UI que simula:
 *
 * - hero/banner superior
 * - strip de KPIs
 * - layout principal de contenido (grid)
 *
 * Utiliza `animate-pulse` para indicar estado de carga.
 *
 * @example
 * ```tsx
 * <Loading />
 * ```
 */
export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-[#f4f6f9] animate-pulse">
      {/* Hero skeleton */}
      {/* 
        Simula el banner principal de la página.
        Se usa un gradiente suave para mantener coherencia visual.
      */}
      <div className="h-48 bg-gradient-to-br from-white via-violet-50/60 to-purple-100/70 border-b border-violet-100/80" />
      
      {/* KPI strip skeleton */}
      {/* 
        Representa los indicadores principales (KPIs).
        Se renderizan 8 bloques simulando tarjetas métricas.
      */}
      <div className="px-4 lg:px-14 -mt-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-7">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-white border border-slate-200 shadow-sm" />
          ))}
        </div>

        {/* Content skeleton */}
        {/* 
          Simula la estructura principal del contenido:
          
          - columna izquierda: contenido principal (cards grandes)
          - columna derecha: sidebar (cards más pequeñas)
        */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="h-64 rounded-2xl bg-white border border-slate-200" />
            <div className="h-48 rounded-2xl bg-white border border-slate-200" />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-5">
            <div className="h-40 rounded-2xl bg-white border border-slate-200" />
            <div className="h-40 rounded-2xl bg-white border border-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}