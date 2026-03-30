// ─── Tipos de Favoritos ───────────────────────────────────────────────────────

export type Favorite = {
  id: string;
  userId: string;
  href: string;
  label: string;
  description?: string;
  iconKey: string;
  color: string;
  order: number;
  createdAt: Date;
};

/** Lo que viaja desde el cliente para crear un favorito */
export type CreateFavoriteInput = Omit<Favorite, "id" | "userId" | "createdAt" | "order">;

/** Lo que viaja para actualizar (label, color, icon) */
export type UpdateFavoriteInput = Partial<Pick<Favorite, "label" | "description" | "iconKey" | "color" | "order">>;

export type FavoriteActionResult<T = Favorite> =
  | { ok: true;  data: T }
  | { ok: false; error: string };
