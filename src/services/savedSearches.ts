import { api } from '../lib/api'
import type { SavedSearch } from '../types'

export async function getSavedSearches(): Promise<SavedSearch[]> {
  return api<SavedSearch[]>('/saved-searches')
}

export async function createSavedSearch(data: Omit<SavedSearch, 'id' | 'createdAt'>): Promise<SavedSearch> {
  return api<SavedSearch>('/saved-searches', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateSavedSearch(id: string, name: string): Promise<SavedSearch> {
  return api<SavedSearch>(`/saved-searches/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  })
}

export async function deleteSavedSearch(id: string): Promise<void> {
  return api(`/saved-searches/${id}`, { method: 'DELETE' })
}
