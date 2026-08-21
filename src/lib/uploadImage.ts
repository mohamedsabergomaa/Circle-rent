import { api } from './api'

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const result = await api<{ url: string }>('/uploads', { method: 'POST', body: form })
  return result.url
}
