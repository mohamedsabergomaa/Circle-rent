const BASE = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('circle_token')
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${BASE}${path}`, { ...init, headers })

  if (!response.ok) {
    let message = response.statusText
    try {
      const body = await response.json()
      message = body?.message ?? message
    } catch { /* non-JSON error body */ }
    throw new ApiError(response.status, message)
  }

  if (response.status === 204) return undefined as T
  const text = await response.text()
  try {
    return text ? JSON.parse(text) : (undefined as unknown as T)
  } catch (err) {
    if (text.trim().startsWith('<')) {
      throw new ApiError(response.status, 'Received HTML instead of JSON. The backend is likely not running.')
    }
    throw new ApiError(response.status, 'Failed to parse JSON response')
  }
}
