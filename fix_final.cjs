const fs = require("fs")

function apply(f, replacements) {
  let c = fs.readFileSync(f, "utf8")

  for (const [from, to] of replacements) {
    if (typeof from === "string") {
      c = c.split(from).join(to)
    } else {
      c = c.replace(from, to)
    }
  }

  // add useEffect if not there and used

  if (c.includes("useEffect(") && !c.includes("useEffect")) {
    c = c.replace("import { useState", "import { useState, useEffect")
  }

  fs.writeFileSync(f, c)
}

// 1. Favorites

apply("src/pages/Favorites.tsx", [
  [
    "import { getFavorites, saveFavorites, type FavoriteItem } from '../lib/mockFavorites'",
    "import { getFavorites, removeFavorite } from '../services/favorites'\nimport type { FavoriteItem } from '../types'",
  ],

  [
    "const [items, setItems] = useState(() => getFavorites())",
    "const [items, setItems] = useState<FavoriteItem[]>([]); import('react').then(React => React.useEffect(() => { getFavorites().then(setItems).catch(console.error) }, []))",
  ],

  [
    "const remove = (id: string) => { const next = items.filter(item => item.id !== id); setItems(next); saveFavorites(next) }",
    "const remove = async (id: string) => { try { await removeFavorite(id); setItems(prev => prev.filter(item => item.id !== id)) } catch (e) { console.error(e) } }",
  ],
])

// 2. SavedSearches

apply("src/pages/SavedSearches.tsx", [
  [
    "import { getSavedSearches, saveSavedSearches, type SavedSearch } from '../lib/mockSavedSearches'",
    "import { getSavedSearches, deleteSavedSearch, updateSavedSearch } from '../services/savedSearches'\nimport type { SavedSearch } from '../types'",
  ],

  [
    "const [searches, setSearches] = useState(() => getSavedSearches())",
    "const [searches, setSearches] = useState<SavedSearch[]>([]); import('react').then(React => React.useEffect(() => { getSavedSearches().then(setSearches).catch(console.error) }, []))",
  ],

  [
    "const removeSearch = (id: string) => { const next = searches.filter(s => s.id !== id); saveSavedSearches(next); setSearches(next) }",
    "const removeSearch = async (id: string) => { try { await deleteSavedSearch(id); setSearches(prev => prev.filter(s => s.id !== id)) } catch (e) { console.error(e) } }",
  ],

  [
    "const applyNameEdit = () => { if (!editingId) return; const next = searches.map(s => (s.id === editingId ? { ...s, name: editName } : s)); saveSavedSearches(next); setSearches(next); setEditingId(null) }",
    "const applyNameEdit = async () => { if (!editingId) return; try { await updateSavedSearch(editingId, editName); setSearches(prev => prev.map(s => s.id === editingId ? { ...s, name: editName } : s)); setEditingId(null) } catch (e) { console.error(e) } }",
  ],
])

// 3. Profiles

apply("src/pages/Profiles.tsx", [
  [
    "import { getBookings, type MockBooking } from '../lib/mockBookings'",
    "import { getMyBookings as getBookings } from '../services/bookings'\nimport type { MockBooking } from '../types'",
  ],

  [
    "const [bookings, setBookings] = useState(() => getBookings())",
    "const [bookings, setBookings] = useState<MockBooking[]>([]); import('react').then(React => React.useEffect(() => { getBookings().then(setBookings).catch(console.error) }, []))",
  ],

  [
    "const [bookings] = useState(() => getBookings())",
    "const [bookings, setBookings] = useState<MockBooking[]>([]); import('react').then(React => React.useEffect(() => { getBookings().then(setBookings).catch(console.error) }, []))",
  ],
])

// 4. OwnerBookings

apply("src/pages/OwnerBookings.tsx", [
  [
    "import { getBookings, saveBookings, type BookingStatus, type MockBooking } from '../lib/mockBookings'",
    "import { getOwnerBookings as getBookings, updateBookingStatus } from '../services/bookings'\nimport type { BookingStatus, MockBooking } from '../types'",
  ],

  [
    "const [bookings, setBookings] = useState(() => getBookings())",
    "const [bookings, setBookings] = useState<MockBooking[]>([]); import('react').then(React => React.useEffect(() => { getBookings().then(setBookings).catch(console.error) }, []))",
  ],

  [
    "const updateStatus = (id: string, status: BookingStatus, message: string) => { const next = bookings.map(b => (b.id === id ? { ...b, status } : b)); saveBookings(next); setBookings(next) }",
    "const updateStatus = async (id: string, status: BookingStatus, message: string) => { try { await updateBookingStatus(id, status); setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b)) } catch (e) { console.error(e) } }",
  ],
])

// 5. MyBookings

apply("src/pages/MyBookings.tsx", [
  [
    "import { getBookings, saveBookings, type BookingStatus, type MockBooking } from '../lib/mockBookings'",
    "import { getMyBookings as getBookings, updateBookingStatus } from '../services/bookings'\nimport type { BookingStatus, MockBooking } from '../types'",
  ],

  [
    "const [bookings] = useState(() => getBookings())",
    "const [bookings, setBookings] = useState<MockBooking[]>([]); import('react').then(React => React.useEffect(() => { getBookings().then(setBookings).catch(console.error) }, []))",
  ],

  [
    "const [bookings, setBookings] = useState(() => getBookings())",
    "const [bookings, setBookings] = useState<MockBooking[]>([]); import('react').then(React => React.useEffect(() => { getBookings().then(setBookings).catch(console.error) }, []))",
  ],

  [
    "const cancel = () => { const updated = bookings.map(item => item.id === booking.id ? { ...item, status: 'cancelled' as const } : item); setBookings(updated); saveBookings(updated); setNotice('تم إلغاء الطلب التجريبي.') }",
    "const cancel = async () => { try { await updateBookingStatus(booking.id, 'cancelled'); setBookings(prev => prev.map(item => item.id === booking.id ? { ...item, status: 'cancelled' } : item)); setNotice('تم الإلغاء.') } catch (e) { console.error(e) } }",
  ],
])

// 6. RentalReturn

apply("src/pages/RentalReturn.tsx", [
  [
    "import { getBookings, saveBookings } from '../lib/mockBookings'",
    "import { getMyBookings as getBookings, updateBookingStatus } from '../services/bookings'\nimport type { MockBooking } from '../types'",
  ],

  [
    "const [booking] = useState(() => getBookings().find(item => item.id === id))",
    "const [booking, setBooking] = useState<MockBooking | null>(null); import('react').then(React => React.useEffect(() => { getBookings().then(b => setBooking(b.find(x => x.id === id) || null)).catch(console.error) }, [id]))",
  ],

  [
    "const submit = (event: FormEvent) => { event.preventDefault(); if (checks.some(value => !value)) return; const updated = getBookings().map(item => item.id === booking.id ? { ...item, status: 'return_pending' as const } : item); saveBookings(updated); setDone(true) }",
    "const submit = async (event: FormEvent) => { event.preventDefault(); if (checks.some(value => !value)) return; try { await updateBookingStatus(booking.id, 'return_pending'); setDone(true) } catch (e) { console.error(e) } }",
  ],
])

// 7. Messages

apply("src/pages/Messages.tsx", [
  [
    "import { ensureConversation, getConversations, getMessages, saveConversations, saveMessages, type Conversation, type Message } from '../lib/mockMessages'",
    "import { getConversations, getMessages, sendMessage } from '../services/messages'\nimport type { Conversation, Message } from '../types'",
  ],

  [
    "import { getBookings } from '../lib/mockBookings'",
    "import { getMyBookings as getBookings } from '../services/bookings'",
  ],

  [
    "const [conversations, setConversations] = useState(() => getConversations())",
    "const [conversations, setConversations] = useState<Conversation[]>([]); import('react').then(React => React.useEffect(() => { getConversations().then(setConversations).catch(console.error) }, []))",
  ],

  [
    "const [messages, setMessages] = useState(() => getMessages())",
    "const [messages, setMessages] = useState<Message[]>([]); import('react').then(React => React.useEffect(() => { getMessages().then(setMessages).catch(console.error) }, []))",
  ],

  [
    "useEffect(() => { const bookingId = params.get('booking'); if (!bookingId) return; const booking = getBookings().find(item => item.id === bookingId); if (!booking) return; const conversation = ensureConversation({ bookingId, listingName: booking.listingName, listingImage: booking.listingImage, ownerName: booking.ownerName, ownerInitial: booking.ownerName.charAt(0), context: booking.status === 'active' ? 'تأجير جارٍ الآن' : 'طلب حجز' }); setConversations(getConversations()); setSelectedId(conversation.id); setMobileOpen(true) }, [params])",
    "useEffect(() => { const bookingId = params.get('booking'); if (!bookingId) return; getBookings().then(b => { const booking = b.find(item => item.id === bookingId); if (booking) { getConversations().then(c => { setConversations(c); const match = c.find(x => x.bookingId === bookingId); if (match) { setSelectedId(match.id); setMobileOpen(true) } }) } }).catch(console.error) }, [params])",
  ],

  [
    "const select = (id: string) => { setSelectedId(id); setMobileOpen(true); const updated = conversations.map(item => item.id === id ? { ...item, unread: 0 } : item); setConversations(updated); saveConversations(updated); navigate(`/messages?conversation=${id}`, { replace: true }) }",
    "const select = (id: string) => { setSelectedId(id); setMobileOpen(true); navigate(`/messages?conversation=${id}`, { replace: true }) }",
  ],

  [
    "const send = (body: string) => { if (!selected || !body.trim()) return; const now = new Date().toISOString(); const next = [...messages, { id: `msg-${Date.now()}`, conversationId: selected.id, sender: 'me' as const, body: body.trim(), createdAt: now }]; setMessages(next); saveMessages(next); const nextConversations = conversations.map(item => item.id === selected.id ? { ...item, updatedAt: now } : item).sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)); setConversations(nextConversations); saveConversations(nextConversations) }",
    "const send = async (body: string) => { if (!selected || !body.trim()) return; try { const newMsg = await sendMessage(selected.id, body.trim()); setMessages(prev => [...prev, newMsg]); setConversations(prev => prev.map(c => c.id === selected.id ? { ...c, updatedAt: newMsg.createdAt, context: newMsg.body } : c).sort((a,b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))); } catch(e) { console.error(e) } }",
  ],

  [
    "const messages = getMessages().filter(item => item.conversationId === conversation.id); const last = messages.at(-1);",
    "const last = null;",
  ],
])
