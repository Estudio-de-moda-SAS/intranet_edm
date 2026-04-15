/**
 * @module ClientLayout
 * Layout principal del lado cliente para la aplicación.
 *
 * @remarks
 * Este componente actúa como contenedor global de la interfaz,
 * envolviendo toda la aplicación con:
 *
 * - proveedores de estado global
 * - layout visual base
 * - header corporativo
 * - footer institucional
 *
 * Es un **Client Component** porque:
 *
 * - utiliza providers que dependen de contexto React
 * - maneja lógica compartida entre múltiples vistas
 *
 * @architecture
 * Jerarquía del layout:
 *
 * Providers
 * └── FavoritesProvider
 *     └── AnimatedShell
 *         ├── GlobalHeader
 *         ├── main (contenido dinámico por ruta)
 *         └── footer
 *
 * Esto permite centralizar:
 *
 * - estado global
 * - animaciones de navegación
 * - estructura visual consistente
 *
 * @example
 * ```tsx
 * <ClientLayout>
 *   <PageContent />
 * </ClientLayout>
 * ```
 */

import Providers from "@/providers"; 
import GlobalHeader from "@/app/components/header/GlobalHeader";
import { AnimatedShell } from "@/app/components/ui/animated/AnimatedShell";
import { FavoritesProvider } from "@/features/favorites/FavoritesContext";

/**
 * Layout cliente que envuelve todas las páginas protegidas.
 *
 * @param props.children Contenido dinámico de cada ruta.
 * @returns Estructura base de la aplicación con header, contenido y footer.
 *
 * @remarks
 * - `Providers`: inyecta contextos globales (auth, tema, etc.)
 * - `FavoritesProvider`: maneja estado de favoritos del usuario
 * - `AnimatedShell`: controla animaciones de transición entre vistas
 * - `GlobalHeader`: navegación principal de la intranet
 *
 * El `main` renderiza el contenido específico de cada página.
 */
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <FavoritesProvider>
        <AnimatedShell>
          <GlobalHeader />

          <main className="flex-1 w-full">
            {children}
          </main>

          {/* Footer corporativo */}
          <footer className="mt-12 border-t border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl px-6 py-6">
              <p className="text-xs text-slate-400 text-center">
                <span className="text-violet-500">
                  © {new Date().getFullYear()} Estudio de Moda S.A.S.
                </span>{" "}
                · Plataforma interna corporativa
              </p>
            </div>
          </footer>
        </AnimatedShell>
      </FavoritesProvider>
    </Providers>
  );
}