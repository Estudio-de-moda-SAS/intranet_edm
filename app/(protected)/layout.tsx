import Providers from "@/providers";
import GlobalHeader from "@/app/components/header/GlobalHeader";
import { AnimatedShell } from "@/app/components/ui/animated/AnimatedShell";
import { FavoritesProvider } from "@/features/favorites/FavoritesContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <FavoritesProvider>
        <AnimatedShell>
          <GlobalHeader />

          <main className="flex-1 w-full">
            {children}
          </main>

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