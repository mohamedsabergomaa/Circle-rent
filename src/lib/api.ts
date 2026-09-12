const BASE = import.meta.env.VITE_API_URL ?? ''
const DEMO = !import.meta.env.VITE_API_URL

const DEMO_USER = {
  id: 'demo-1',
  fullName: 'مستخدم تجريبي',
  phoneNumber: '+201000000000',
  email: 'demo@circle.app',
  city: 'القاهرة',
  neighborhood: 'الزمالك',
  bio: 'مستخدم تجريبي في سيركل.',
  avatarUrl: null,
  phoneVerified: true,
  identityVerified: false,
  onboardingCompleted: true,
  isAdmin: true,
  rating: 4.8,
  reviewCount: 12,
  rentalCount: 7,
  createdAt: '2026-01-01T00:00:00Z',
}

const DEMO_SESSION = { user: DEMO_USER, token: 'demo-token', createdAt: '2026-01-01T00:00:00Z' }

function demoResponse(path: string, init: RequestInit): unknown {
  const method = (init.method ?? 'GET').toUpperCase()
  const seg = path.split('?')[0].replace(/^\//, '').split('/')

  if (seg[0] === 'auth') {
    if (seg[1] === 'sign-in') return { otpSent: true }
    if (seg[1] === 'sign-up') return DEMO_SESSION
    if (seg[1] === 'verify-otp') return DEMO_SESSION
    if (seg[1] === 'me') return DEMO_USER
    if (seg[1] === 'sign-out') return undefined
    if (seg[1] === 'onboarding') return DEMO_SESSION
  }
  if (seg[0] === 'listings') {
    if (method === 'GET' && seg.length === 1) return []
    if (method === 'GET' && seg[2] === 'reviews') return []
    if (method === 'GET' && seg[2] === 'availability') return []
    if (method === 'GET' && seg.length === 2) return null
    if (method === 'POST') return { id: `lst-${Date.now()}` }
    if (method === 'PUT') return { id: seg[1] }
    if (method === 'DELETE') return undefined
  }
  if (seg[0] === 'bookings') {
    if (method === 'GET' && seg.length === 1) return []
    if (method === 'GET' && seg.length === 2) return null
    if (method === 'POST') return { id: `bk-${Date.now()}`, status: 'pending' }
    if (method === 'PUT') return { id: seg[1], status: 'approved' }
  }
  if (seg[0] === 'conversations') {
    if (method === 'GET' && seg.length === 1) return []
    if (method === 'GET' && seg[2] === 'messages') return []
    if (method === 'POST' && seg.length === 1) return { id: `cv-${Date.now()}` }
    if (method === 'POST' && seg[2] === 'messages') return { id: `msg-${Date.now()}`, sender: 'me', body: JSON.parse(init.body as string)?.body ?? '', createdAt: new Date().toISOString() }
    if (method === 'PUT') return undefined
  }
  if (seg[0] === 'favorites') {
    if (method === 'GET' && seg.length === 1) return []
    if (method === 'GET' && seg[2] === 'check') return { isFavorite: false }
    return undefined
  }
  if (seg[0] === 'saved-searches') {
    if (method === 'GET') return []
    if (method === 'POST') return { id: `ss-${Date.now()}`, ...JSON.parse(init.body as string ?? '{}'), createdAt: new Date().toISOString() }
    return undefined
  }
  if (seg[0] === 'users') {
    if (seg[1] === 'me') return DEMO_USER
    return { id: seg[1], name: 'مستخدم', initials: 'م', city: 'القاهرة', neighborhood: '', joined: '2026', bio: '', rating: 4.5, reviews: 0, rentals: 0, response: 'سريع', responseRate: 95, identityVerified: false, listings: [] }
  }
  if (seg[0] === 'admin') {
    if (seg[1] === 'stats') return { totalUsers: 0, activeListings: 0, bookingsThisMonth: 0, revenueThisMonth: 0, usersDelta: 0, listingsDelta: 0, bookingsDelta: 0, revenueDelta: 0 }
    if (seg[1] === 'users') {
      if (method === 'DELETE') return undefined
      if (method === 'PUT') return { id: seg[2], status: seg[3] === 'suspend' ? 'suspended' : 'active' }
      return { items: [], total: 0, page: 1, pages: 0 }
    }
    if (seg[1] === 'listings') {
      if (method === 'DELETE') return undefined
      if (method === 'PUT') return { id: seg[2], status: seg[3] === 'approve' ? 'active' : 'rejected' }
      return { items: [], total: 0, page: 1, pages: 0 }
    }
    if (seg[1] === 'bookings') return { items: [], total: 0, page: 1, pages: 0 }
    if (seg[1] === 'reports') {
      if (method === 'DELETE') return undefined
      if (method === 'PUT') return { id: seg[2], status: 'resolved' }
      return { items: [], total: 0, page: 1, pages: 0 }
    }
  }
  return undefined
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public offline = false) {
    super(message)
    this.name = 'ApiError'
  }
}

export function friendlyError(err: unknown, fallback = 'حدث خطأ غير متوقع. حاول مرة أخرى.'): string {
  if (err instanceof ApiError) {
    if (err.offline) return 'الخدمة غير متاحة حاليًا. تحقق من اتصالك أو حاول لاحقًا.'
    if (err.status === 401 || err.status === 403) return 'غير مصرح لك بتنفيذ هذا الإجراء.'
    if (err.status === 404) return 'العنصر المطلوب غير موجود.'
    if (err.status >= 500) return 'خطأ في الخادم. حاول لاحقًا.'
    if (err.message) return err.message
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (DEMO) return demoResponse(path, init) as T

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
      throw new ApiError(response.status, 'Backend not available', true)
    }
    throw new ApiError(response.status, 'Failed to parse JSON response')
  }
}
