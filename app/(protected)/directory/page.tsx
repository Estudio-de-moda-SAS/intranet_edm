/**
 * @module DirectoryPage
 * Página principal del directorio de empleados.
 *
 * @remarks
 * Este archivo representa el punto de entrada del módulo de directorio
 * dentro de la intranet.
 *
 * Es un **Server Component**, responsable de:
 *
 * - definir metadata SEO de la página
 * - obtener los datos de empleados (mock o API)
 * - delegar la renderización interactiva al componente cliente {@link DirectoryClient}
 *
 * Actualmente utiliza datos mock, pero está preparado para integrarse
 * con Microsoft Graph API (`/v1.0/users`).
 */

// app/(protected)/(intranet)/directory/page.tsx

import { Metadata } from "next";
import { MOCK_EMPLOYEES } from "./mockEmployees";
import { DirectoryClient } from "./components/DirectoryHomePage";

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Metadata de la página del directorio.
 *
 * @remarks
 * Define el título y descripción utilizados por el navegador
 * y motores de búsqueda.
 */
export const metadata: Metadata = {
  title: "Directorio | Intranet",
  description: "Directorio corporativo de empleados",
};

/* -------------------------------------------------------------------------- */
/* Data fetching                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Obtiene la lista de empleados.
 *
 * @returns Lista de empleados disponibles en el directorio.
 *
 * @remarks
 * Actualmente retorna datos mock desde {@link MOCK_EMPLOYEES}.
 *
 * En una integración futura, esta función debe:
 *
 * - consumir Microsoft Graph API (`/v1.0/users`)
 * - aplicar `$select` para optimizar payload
 * - opcionalmente incluir `$expand=manager`
 *
 * @example
 * ```ts
 * const employees = await getEmployees();
 * ```
 */
async function getEmployees() {
  // 🔄 TODO: Reemplazar con Microsoft Graph API
  return MOCK_EMPLOYEES;
}

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Página del directorio de empleados.
 *
 * @returns Layout completo del directorio con header y contenido.
 *
 * @remarks
 * Flujo de ejecución:
 *
 * 1. Se obtienen los empleados en el servidor (`getEmployees`)
 * 2. Se renderiza el header visual del módulo
 * 3. Se delega la lógica interactiva a {@link DirectoryClient}
 *
 * Separación de responsabilidades:
 *
 * - Server Component → obtención de datos + layout base
 * - Client Component → interacción, filtros, UI dinámica
 *
 * @example
 * ```tsx
 * export default function Page() {
 *   return <DirectoryPage />;
 * }
 * ```
 */
export default async function DirectoryPage() {
  const employees = await getEmployees();

  return (
    <main
      className="min-h-screen w-full"
      style={{ backgroundColor: "var(--bg-base)" }}
    >

      {/* ============================================================ */}
      {/* Header del módulo                                            */}
      {/* ============================================================ */}
      <div
        className="bg-gradient-to-br from-[#1e3a5f] via-[#1e40af] to-[#1d4ed8]
                   dark:from-[#0d1829] dark:via-[#111d3a] dark:to-[#0f2347]
                   px-4 lg:px-14 py-10 relative overflow-hidden"
      >
        {/* Decoración visual */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)",
          }}
        />

        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5" />

        <div className="relative">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-1">
            Intranet · Directorio
          </p>

          <h1
            className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Directorio de Empleados
          </h1>

          <p
            className="text-sm text-white/60 mt-1"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Encuentra información de contacto de todos los colaboradores
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* Contenido principal                                          */}
      {/* ============================================================ */}
      <div className="px-4 lg:px-14 py-7 pb-12">
        <DirectoryClient employees={employees} />
      </div>

    </main>
  );
}