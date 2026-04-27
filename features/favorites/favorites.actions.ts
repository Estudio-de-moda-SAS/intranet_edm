"use server";

import { revalidatePath } from "next/cache";
import { cookies }        from "next/headers";
import type {
  Favorite,
  CreateFavoriteInput,
  UpdateFavoriteInput,
  FavoriteActionResult,
} from "./favorites.types";

// ─── Helper de autenticación ──────────────────────────────────────────────────

/**
 * Obtiene el email del colaborador autenticado desde la cookie `edm_user_email`
 * que `LoginPage` escribe tras el login exitoso de MSAL.
 *
 * @remarks
 * Se usa como `userId` estable hasta tener una tabla `users` en DB.
 * Cuando exista, reemplazar por el Object ID de Azure AD.
 *
 * @throws Si la cookie no existe — el colaborador no está autenticado.
 */
async function getCurrentUserId(): Promise<string> {
  const cookieStore = await cookies();
  const email       = cookieStore.get("edm_user_email")?.value;

  if (!email) {
    throw new Error("No autenticado");
  }

  return email;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function getFavoritesAction(): Promise<FavoriteActionResult<Favorite[]>> {
  try {
    const userId = await getCurrentUserId();

    // TODO — Prisma:
    // const rows = await prisma.favorite.findMany({
    //   where: { userId },
    //   orderBy: { order: "asc" },
    // });
    // return { ok: true, data: rows };

    void userId;
    return { ok: true, data: [] };
  } catch (err) {
    console.error("[getFavoritesAction]", err);
    return { ok: false, error: "No se pudieron cargar los favoritos" };
  }
}

export async function createFavoriteAction(
  input: CreateFavoriteInput,
): Promise<FavoriteActionResult<Favorite>> {
  try {
    const userId = await getCurrentUserId();

    // TODO — Prisma:
    // const maxOrder = await prisma.favorite.aggregate({
    //   where: { userId },
    //   _max: { order: true },
    // });
    // const created = await prisma.favorite.create({
    //   data: { ...input, userId, order: (maxOrder._max.order ?? -1) + 1 },
    // });
    // revalidatePath("/");
    // return { ok: true, data: created };

    const stub: Favorite = {
      ...input,
      id:        `temp-${Date.now()}`,
      userId,
      order:     0,
      createdAt: new Date(),
    };
    revalidatePath("/");
    return { ok: true, data: stub };
  } catch (err) {
    console.error("[createFavoriteAction]", err);
    return { ok: false, error: "No se pudo crear el favorito" };
  }
}

export async function deleteFavoriteAction(
  favoriteId: string,
): Promise<FavoriteActionResult<{ id: string }>> {
  try {
    const userId = await getCurrentUserId();

    // TODO — Prisma:
    // await prisma.favorite.deleteMany({
    //   where: { id: favoriteId, userId },
    // });

    void userId;
    revalidatePath("/");
    return { ok: true, data: { id: favoriteId } };
  } catch (err) {
    console.error("[deleteFavoriteAction]", err);
    return { ok: false, error: "No se pudo eliminar el favorito" };
  }
}

export async function updateFavoriteAction(
  favoriteId: string,
  input: UpdateFavoriteInput,
): Promise<FavoriteActionResult<Favorite>> {
  try {
    const userId = await getCurrentUserId();

    // TODO — Prisma:
    // const updated = await prisma.favorite.update({
    //   where: { id: favoriteId, userId },
    //   data: input,
    // });
    // revalidatePath("/");
    // return { ok: true, data: updated };

    void userId; void favoriteId; void input;
    throw new Error("updateFavoriteAction: pendiente de implementar");
  } catch (err) {
    console.error("[updateFavoriteAction]", err);
    return { ok: false, error: "No se pudo actualizar el favorito" };
  }
}

export async function reorderFavoritesAction(
  items: { id: string; order: number }[],
): Promise<FavoriteActionResult<{ count: number }>> {
  try {
    const userId = await getCurrentUserId();

    // TODO — Prisma (transaction):
    // await prisma.$transaction(
    //   items.map(({ id, order }) =>
    //     prisma.favorite.updateMany({ where: { id, userId }, data: { order } })
    //   )
    // );

    void userId;
    revalidatePath("/");
    return { ok: true, data: { count: items.length } };
  } catch (err) {
    console.error("[reorderFavoritesAction]", err);
    return { ok: false, error: "No se pudo reordenar los favoritos" };
  }
}