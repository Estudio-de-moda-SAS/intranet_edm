"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth"; // ← NextAuth v5: exportas `auth` directamente
import type {
  Favorite,
  CreateFavoriteInput,
  UpdateFavoriteInput,
  FavoriteActionResult,
} from "./favorites.types";

// ─── Helper de autenticación ──────────────────────────────────────────────────

async function getCurrentUserId(): Promise<string> {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("No autenticado");
  }

  // Email como userId estable hasta tener DB con id propio.
  // Cuando tengas tabla users, cámbialo por session.user.id
  return session.user.email;
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

// ✅ Fix: agregado favoriteId como primer argumento separado
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