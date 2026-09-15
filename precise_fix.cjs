const fs = require("fs")

function load(f) {
  return fs.readFileSync(f, "utf8")
}

function save(f, c) {
  fs.writeFileSync(f, c)
}

let c

// Favorites.tsx

c = load("src/pages/Favorites.tsx")

c = c.replace(
  "import { getFavorites, saveFavorites, type FavoriteItem } from '../lib/mockFavorites'",

  "import { getFavorites, removeFavorite } from '../services/favorites'\nimport type { FavoriteItem } from '../types'",
)

c = c.replace(
  "const [items, setItems] = useState(() => getFavorites())",

  "const [items, setItems] = useState<FavoriteItem[]>([]); useEffect(() => { getFavorites().then(setItems).catch(console.error) }, [])",
)

c = c.replace(
  /const remove = \(id: string\) => \{.*?saveFavorites\(next\) \}/,

  "const remove = async (id: string) => { try { await removeFavorite(id); setItems(prev => prev.filter(item => item.id !== id)) } catch(e){ console.error(e) } }",
)

if (!c.includes("useEffect"))
  c = c.replace(
    "import { useMemo, useState",
    "import { useMemo, useState, useEffect",
  )

save("src/pages/Favorites.tsx", c)

// SavedSearches.tsx

c = load("src/pages/SavedSearches.tsx")

c = c.replace(
  "import { getSavedSearches, saveSavedSearches, type SavedSearch } from '../lib/mockSavedSearches'",

  "import { getSavedSearches, deleteSavedSearch, updateSavedSearch } from '../services/savedSearches'\nimport type { SavedSearch } from '../types'",
)

c = c.replace(
  "const [searches, setSearches] = useState(() => getSavedSearches())",

  "const [searches, setSearches] = useState<SavedSearch[]>([]); useEffect(() => { getSavedSearches().then(setSearches).catch(console.error) }, [])",
)

c = c.replace(
  /const removeSearch = \(id: string\) => \{.*?setSearches\(next\)\n  \}/s,

  "const removeSearch = async (id: string) => { try { await deleteSavedSearch(id); setSearches(prev => prev.filter(s => s.id !== id)) } catch (e) { console.error(e) } }",
)

c = c.replace(
  /const applyNameEdit = \(\) => \{\n.*?setEditingId\(null\)\n  \}/s,

  "const applyNameEdit = async () => { if (!editingId) return; try { await updateSavedSearch(editingId, editName); setSearches(prev => prev.map(s => s.id === editingId ? { ...s, name: editName } : s)); setEditingId(null) } catch (e) { console.error(e) } }",
)

if (!c.includes("useEffect"))
  c = c.replace("import { useState }", "import { useState, useEffect }")

save("src/pages/SavedSearches.tsx", c)

// OwnerBookings.tsx

c = load("src/pages/OwnerBookings.tsx")

c = c.replace(
  "import { getBookings, saveBookings, type BookingStatus, type MockBooking } from '../lib/mockBookings'",

  "import { getOwnerBookings as getBookings, updateBookingStatus } from '../services/bookings'\nimport type { BookingStatus, MockBooking } from '../types'",
)

c = c.replace(
  "const [bookings, setBookings] = useState(() => getBookings())",

  "const [bookings, setBookings] = useState<MockBooking[]>([]); useEffect(() => { getBookings().then(setBookings).catch(console.error) }, [])",
)

c = c.replace(
  /const updateStatus = \(id: string, status: BookingStatus, message: string\) => \{\n.*?setBookings\(next\)\n  \}/s,

  "const updateStatus = async (id: string, status: BookingStatus, message: string) => { try { await updateBookingStatus(id, status); setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b)) } catch (e) { console.error(e) } }",
)

if (!c.includes("useEffect"))
  c = c.replace(
    "import { useMemo, useState",
    "import { useMemo, useState, useEffect",
  )

save("src/pages/OwnerBookings.tsx", c)

// Profiles.tsx

c = load("src/pages/Profiles.tsx")

c = c.replace(
  "import { getBookings, type MockBooking } from '../lib/mockBookings'",

  "import { getMyBookings as getBookings } from '../services/bookings'\nimport type { MockBooking } from '../types'",
)

c = c.replace(
  "const [bookings, setBookings] = useState(() => getBookings())",

  "const [bookings, setBookings] = useState<MockBooking[]>([]); useEffect(() => { getBookings().then(setBookings).catch(console.error) }, [])",
)

c = c.replace(
  "const [bookings] = useState(() => getBookings())",

  "const [bookings, setBookings] = useState<MockBooking[]>([]); useEffect(() => { getBookings().then(setBookings).catch(console.error) }, [])",
)

if (!c.includes("useEffect"))
  c = c.replace("import { useState", "import { useState, useEffect")

save("src/pages/Profiles.tsx", c)

// MyBookings.tsx

c = load("src/pages/MyBookings.tsx")

c = c.replace(
  "import { getBookings, saveBookings, type BookingStatus, type MockBooking } from '../lib/mockBookings'",

  "import { getMyBookings as getBookings, updateBookingStatus } from '../services/bookings'\nimport type { BookingStatus, MockBooking } from '../types'",
)

c = c.replace(
  "const [bookings] = useState(() => getBookings())",

  "const [bookings, setBookings] = useState<MockBooking[]>([]); useEffect(() => { getBookings().then(setBookings).catch(console.error) }, [])",
)

c = c.replace(
  "const [bookings, setBookings] = useState<MockBooking[]>([])\n  React.useEffect(() => { getBookings().then(data => setBookings(data)).catch(console.error) }, [])",

  "const [bookings, setBookings] = useState<MockBooking[]>([]); useEffect(() => { getBookings().then(setBookings).catch(console.error) }, [])",
)

// also fix cancel in MyBookings

c = c.replace(
  /const cancel = \(\) => \{\n.*?setNotice\('تم إلغاء الطلب التجريبي.'\)\n  \}/s,

  "const cancel = async () => { try { await updateBookingStatus(booking.id, 'cancelled'); setBookings(prev => prev.map(item => item.id === booking.id ? { ...item, status: 'cancelled' } : item)); setNotice('تم الإلغاء.') } catch (e) { console.error(e) } }",
)

if (!c.includes("useEffect"))
  c = c.replace(
    "import { useMemo, useState",
    "import { useMemo, useState, useEffect",
  )

save("src/pages/MyBookings.tsx", c)

// RentalReturn.tsx

c = load("src/pages/RentalReturn.tsx")

c = c.replace(
  "import { getBookings, saveBookings } from '../lib/mockBookings'",

  "import { getMyBookings as getBookings, updateBookingStatus } from '../services/bookings'\nimport type { MockBooking } from '../types'",
)

c = c.replace(
  "const [booking] = useState(() => getBookings().find(item => item.id === id));",

  "const [booking, setBooking] = useState<MockBooking | null>(null); useEffect(() => { getBookings().then(b => setBooking(b.find(x => x.id === id) || null)).catch(console.error) }, [id]);",
)

c = c.replace(
  /const submit = \(event: FormEvent\) => \{.*?saveBookings\(updated\); setDone\(true\) \}/s,

  "const submit = async (event: FormEvent) => { event.preventDefault(); if (checks.some(value => !value)) return; try { await updateBookingStatus(booking!.id, 'return_pending'); setDone(true) } catch (e) { console.error(e) } }",
)

if (!c.includes("useEffect"))
  c = c.replace(
    "import { useMemo, useState",
    "import { useMemo, useState, useEffect",
  )

save("src/pages/RentalReturn.tsx", c)

// Messages.tsx

c = load("src/pages/Messages.tsx")

c = c.replace(
  "import { ensureConversation, getConversations, getMessages, saveConversations, saveMessages, type Conversation, type Message } from '../lib/mockMessages'",

  "import { getConversations, getMessages, sendMessage } from '../services/messages'\nimport type { Conversation, Message } from '../types'",
)

c = c.replace(
  "import { getBookings } from '../lib/mockBookings'",
  "import { getMyBookings as getBookings } from '../services/bookings'",
)

c = c.replace(
  "const [conversations, setConversations] = useState(() => getConversations())",

  "const [conversations, setConversations] = useState<Conversation[]>([]); useEffect(() => { getConversations().then(setConversations).catch(console.error) }, [])",
)

c = c.replace(
  "const [messages, setMessages] = useState(() => getMessages())",

  "const [messages, setMessages] = useState<Message[]>([]); useEffect(() => { getMessages().then(setMessages).catch(console.error) }, [])",
)

c = c.replace(
  /useEffect\(\(\) => \{\n.*?setMobileOpen\(true\)\n  \}, \[params\]\)/s,

  "useEffect(() => { const bookingId = params.get('booking'); if (!bookingId) return; getBookings().then(b => { const booking = b.find(item => item.id === bookingId); if (booking) { getConversations().then(c => { setConversations(c); const match = c.find(x => x.bookingId === bookingId); if (match) { setSelectedId(match.id); setMobileOpen(true) } }) } }).catch(console.error) }, [params])",
)

c = c.replace(
  /const select = \(id: string\) => \{\n.*?navigate\(\`\/messages\?conversation=\$\{id\}\`, \{ replace: true \}\)\n  \}/s,

  "const select = (id: string) => { setSelectedId(id); setMobileOpen(true); navigate(`/messages?conversation=${id}`, { replace: true }) }",
)

c = c.replace(
  /const send = \(body: string\) => \{\n.*?saveConversations\(nextConversations\)\n  \}/s,

  "const send = async (body: string) => { if (!selected || !body.trim()) return; try { const newMsg = await sendMessage(selected.id, body.trim()); setMessages(prev => [...prev, newMsg]); setConversations(prev => prev.map(c => c.id === selected.id ? { ...c, updatedAt: newMsg.createdAt, context: newMsg.body } : c).sort((a,b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))); } catch(e) { console.error(e) } }",
)

c = c.replace(
  /const messages = getMessages\(\)\.filter\(item => item\.conversationId === conversation\.id\)\n.*?const last = messages\.at\(-1\)/s,
  "const last = null",
)

if (!c.includes("useEffect"))
  c = c.replace(
    "import { useMemo, useRef, useState",
    "import { useMemo, useRef, useState, useEffect",
  )

save("src/pages/Messages.tsx", c)
