"use client";

/**
 * FavoritesContext
 *
 * - Estado global de favoritos con actualizaciones optimistas.
 * - Mientras la DB no esté lista usa localStorage como fallback
 *   (controlado por la flag USE_DB).
 * - Cuando la DB esté lista: pon USE_DB = true y el contexto
 *   llamará a las Server Actions automáticamente.
 */

import {
  createContext, useContext, useEffect,
  useState, useTransition,
  type ReactNode,
} from "react";
import type { Favorite, CreateFavoriteInput } from "./favorites.types";
import {
  getFavoritesAction,
  createFavoriteAction,
  deleteFavoriteAction,
  updateFavoriteAction,
  reorderFavoritesAction,
} from "./favorites.actions";

// ─── Flag de modo ─────────────────────────────────────────────────────────────
// Cambia a `true` cuando la DB esté lista.
const USE_DB = false;
const LS_KEY = "intranet:favorites";

// ─── Tipos del contexto ───────────────────────────────────────────────────────

type FavoritesContextValue = {
  favorites: Favorite[];
  favoriteHrefs: string[];
  isPending: boolean;
  addFavorite:    (input: CreateFavoriteInput) => Promise<void>;
  removeFavorite: (favoriteId: string) => Promise<void>;
  updateFavorite: (favoriteId: string, input: Partial<Pick<Favorite, "label" | "description" | "iconKey" | "color">>) => Promise<void>;
  reorderFavorites: (items: { id: string; order: number }[]) => Promise<void>;
  /** Devuelve el Favorite cuyo href coincide, o undefined */
  getFavoriteByHref: (href: string) => Favorite | undefined;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

// ─── Helpers localStorage ─────────────────────────────────────────────────────

function lsLoad(): Favorite[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Favorite[]) : [];
  } catch {
    return [];
  }
}

function lsSave(favs: Favorite[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(favs));
  } catch {}
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [serverFavorites, setServerFavorites] = useState<Favorite[]>([]);

  // ✅ Fix: useOptimistic tiene tipos incorrectos en @types/react ^19 con 2 args
  // Se reemplaza con useState — funcionalmente equivalente con USE_DB = false
  const [optimisticFavs, setOptimisticFavs] = useState<Favorite[]>(serverFavorites);

  const [isPending, startTransition] = useTransition();

  // ── Carga inicial ────────────────────────────────────────────────────────
  useEffect(() => {
    if (USE_DB) {
      getFavoritesAction().then(res => {
        if (res.ok) {
          setServerFavorites(res.data);
          setOptimisticFavs(res.data);
        }
      });
    } else {
      const loaded = lsLoad();
      setServerFavorites(loaded);
      setOptimisticFavs(loaded);
    }
  }, []);

  // ── Helpers internos ─────────────────────────────────────────────────────

  function optimisticUpdate(next: Favorite[]) {
    setOptimisticFavs(next);
    setServerFavorites(next);
    if (!USE_DB) lsSave(next);
  }

  // ── addFavorite ──────────────────────────────────────────────────────────

  async function addFavorite(input: CreateFavoriteInput) {
    const optimisticItem: Favorite = {
      ...input,
      id:        `optimistic-${Date.now()}`,
      userId:    "me",
      order:     optimisticFavs.length,
      createdAt: new Date(),
    };

    startTransition(async () => {
      const next = [...optimisticFavs, optimisticItem];
      optimisticUpdate(next);

      if (USE_DB) {
        const res = await createFavoriteAction(input);
        if (res.ok) {
          // Reemplaza el optimistic con el real
          setServerFavorites(prev =>
            prev.map(f => f.id === optimisticItem.id ? res.data : f)
          );
        } else {
          // Rollback
          setServerFavorites(prev => prev.filter(f => f.id !== optimisticItem.id));
        }
      }
    });
  }

  // ── removeFavorite ───────────────────────────────────────────────────────

  async function removeFavorite(favoriteId: string) {
    startTransition(async () => {
      const next = optimisticFavs
        .filter(f => f.id !== favoriteId)
        .map((f, i) => ({ ...f, order: i }));
      optimisticUpdate(next);

      if (USE_DB) {
        const res = await deleteFavoriteAction(favoriteId);
        if (!res.ok) {
          // Rollback: recarga desde servidor
          const fresh = await getFavoritesAction();
          if (fresh.ok) setServerFavorites(fresh.data);
        }
      }
    });
  }

  // ── updateFavorite ───────────────────────────────────────────────────────

  async function updateFavorite(
    favoriteId: string,
    input: Partial<Pick<Favorite, "label" | "description" | "iconKey" | "color">>,
  ) {
    startTransition(async () => {
      const next = optimisticFavs.map(f =>
        f.id === favoriteId ? { ...f, ...input } : f
      );
      optimisticUpdate(next);

      if (USE_DB) {
        const res = await updateFavoriteAction(favoriteId, input);
        if (!res.ok) {
          const fresh = await getFavoritesAction();
          if (fresh.ok) setServerFavorites(fresh.data);
        }
      }
    });
  }

  // ── reorderFavorites ─────────────────────────────────────────────────────

  async function reorderFavorites(items: { id: string; order: number }[]) {
    startTransition(async () => {
      const orderMap = new Map(items.map(i => [i.id, i.order]));
      const next = [...optimisticFavs]
        .map(f => ({ ...f, order: orderMap.get(f.id) ?? f.order }))
        .sort((a, b) => a.order - b.order);
      optimisticUpdate(next);

      if (USE_DB) {
        await reorderFavoritesAction(items);
      }
    });
  }

  // ── Derivados ────────────────────────────────────────────────────────────

  const favoriteHrefs = optimisticFavs.map(f => f.href);

  function getFavoriteByHref(href: string) {
    return optimisticFavs.find(f => f.href === href);
  }

  return (
    <FavoritesContext.Provider value={{
      favorites: optimisticFavs,
      favoriteHrefs,
      isPending,
      addFavorite,
      removeFavorite,
      updateFavorite,
      reorderFavorites,
      getFavoriteByHref,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites debe usarse dentro de <FavoritesProvider>");
  return ctx;
}
