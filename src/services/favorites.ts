import { api } from "../lib/api"

import type { FavoriteItem } from "../types"

export async function getFavorites(): Promise<FavoriteItem[]> {
  return api<FavoriteItem[]>("/favorites")
}

export async function addFavorite(
  item: Omit<FavoriteItem, "savedAt">,
): Promise<void> {
  return api("/favorites", { method: "POST", body: JSON.stringify(item) })
}

export async function removeFavorite(id: string): Promise<void> {
  return api(`/favorites/${id}`, { method: "DELETE" })
}

export async function checkFavorite(id: string): Promise<boolean> {
  const result = await api<{ isFavorite: boolean }>(`/favorites/${id}/check`)

  return result.isFavorite
}
