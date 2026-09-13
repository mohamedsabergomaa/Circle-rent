const fs = require('fs');

function rewrite(path, search, replace) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(search, replace);
  fs.writeFileSync(path, content);
}

// OwnerBookings.tsx
let ob = fs.readFileSync('src/pages/OwnerBookings.tsx', 'utf8');
ob = ob.replace("import { getBookings, saveBookings, type BookingStatus, type MockBooking } from '../lib/mockBookings'",
  "import { getOwnerBookings as getBookings, updateBookingStatus } from '../services/bookings'\nimport type { BookingStatus, MockBooking } from '../types'");
ob = ob.replace("const [bookings, setBookings] = useState(() => getBookings())",
  "const [bookings, setBookings] = useState<MockBooking[]>([]); useEffect(() => { getBookings().then(setBookings).catch(console.error) }, [])");
ob = ob.replace(/const updateStatus = \(id: string, status: BookingStatus, message: string\) => \{\n.*?setBookings\(next\)\n  \}/s,
  "const updateStatus = async (id: string, status: BookingStatus, message: string) => { try { await updateBookingStatus(id, status); setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b)) } catch (e) { console.error(e) } }");
// add useEffect import
if (!ob.includes('useEffect')) ob = ob.replace("import { useMemo, useState }", "import { useMemo, useState, useEffect }");
fs.writeFileSync('src/pages/OwnerBookings.tsx', ob);

// SavedSearches.tsx
let ss = fs.readFileSync('src/pages/SavedSearches.tsx', 'utf8');
ss = ss.replace("import { getSavedSearches, saveSavedSearches, type SavedSearch } from '../lib/mockSavedSearches'",
  "import { getSavedSearches, deleteSavedSearch, updateSavedSearch } from '../services/savedSearches'\nimport type { SavedSearch } from '../types'");
ss = ss.replace("const [searches, setSearches] = useState(() => getSavedSearches())",
  "const [searches, setSearches] = useState<SavedSearch[]>([]); useEffect(() => { getSavedSearches().then(setSearches).catch(console.error) }, [])");
ss = ss.replace(/const removeSearch = \(id: string\) => \{\n.*?setSearches\(next\)\n  \}/s,
  "const removeSearch = async (id: string) => { try { await deleteSavedSearch(id); setSearches(prev => prev.filter(s => s.id !== id)) } catch (e) { console.error(e) } }");
ss = ss.replace(/const applyNameEdit = \(\) => \{\n.*?setEditingId\(null\)\n  \}/s,
  "const applyNameEdit = async () => { if (!editingId) return; try { await updateSavedSearch(editingId, editName); setSearches(prev => prev.map(s => s.id === editingId ? { ...s, name: editName } : s)); setEditingId(null) } catch (e) { console.error(e) } }");
if (!ss.includes('useEffect')) ss = ss.replace("import { useState }", "import { useState, useEffect }");
fs.writeFileSync('src/pages/SavedSearches.tsx', ss);

// MyBookings.tsx
let mb = fs.readFileSync('src/pages/MyBookings.tsx', 'utf8');
mb = mb.replace("import { getBookings, saveBookings, type BookingStatus, type MockBooking } from '../lib/mockBookings'",
  "import { getMyBookings as getBookings, updateBookingStatus } from '../services/bookings'\nimport type { BookingStatus, MockBooking } from '../types'");
mb = mb.replace("const [bookings] = useState(() => getBookings())",
  "const [bookings, setBookings] = useState<MockBooking[]>([]); useEffect(() => { getBookings().then(setBookings).catch(console.error) }, [])");
mb = mb.replace("const [bookings, setBookings] = useState(() => getBookings())",
  "const [bookings, setBookings] = useState<MockBooking[]>([]); useEffect(() => { getBookings().then(setBookings).catch(console.error) }, [])");
mb = mb.replace(/const cancel = \(\) => \{\n.*?setNotice\('تم إلغاء الطلب التجريبي.'\)\n  \}/s,
  "const cancel = async () => { try { await updateBookingStatus(booking.id, 'cancelled'); setBookings(prev => prev.map(item => item.id === booking.id ? { ...item, status: 'cancelled' } : item)); setNotice('تم الإلغاء.') } catch (e) { console.error(e) } }");
// add useEffect
if (!mb.includes('useEffect')) mb = mb.replace("import { useMemo, useState }", "import { useMemo, useState, useEffect }");
fs.writeFileSync('src/pages/MyBookings.tsx', mb);

// Messages.tsx
let ms = fs.readFileSync('src/pages/Messages.tsx', 'utf8');
ms = ms.replace("import { ensureConversation, getConversations, getMessages, saveConversations, saveMessages, type Conversation, type Message } from '../lib/mockMessages'",
  "import { getConversations, getMessages, sendMessage } from '../services/messages'\nimport type { Conversation, Message } from '../types'");
ms = ms.replace("import { getBookings } from '../lib/mockBookings'", "import { getMyBookings as getBookings } from '../services/bookings'");
ms = ms.replace("const [conversations, setConversations] = useState(() => getConversations())",
  "const [conversations, setConversations] = useState<Conversation[]>([]); useEffect(() => { getConversations().then(setConversations).catch(console.error) }, [])");
ms = ms.replace("const [messages, setMessages] = useState(() => getMessages())",
  "const [messages, setMessages] = useState<Message[]>([]); useEffect(() => { getMessages().then(setMessages).catch(console.error) }, [])");

ms = ms.replace(/useEffect\(\(\) => \{\n.*?setMobileOpen\(true\)\n  \}, \[params\]\)/s,
  "useEffect(() => { const bookingId = params.get('booking'); if (!bookingId) return; getBookings().then(b => { const booking = b.find(item => item.id === bookingId); if (booking) { getConversations().then(c => { setConversations(c); const match = c.find(x => x.bookingId === bookingId); if (match) { setSelectedId(match.id); setMobileOpen(true) } }) } }).catch(console.error) }, [params])");

ms = ms.replace(/const select = \(id: string\) => \{\n.*?navigate\(\`\/messages\?conversation=\$\{id\}\`, \{ replace: true \}\)\n  \}/s,
  "const select = (id: string) => { setSelectedId(id); setMobileOpen(true); navigate(`/messages?conversation=${id}`, { replace: true }) }");

ms = ms.replace(/const send = \(body: string\) => \{\n.*?saveConversations\(nextConversations\)\n  \}/s,
  "const send = async (body: string) => { if (!selected || !body.trim()) return; try { const newMsg = await sendMessage(selected.id, body.trim()); setMessages(prev => [...prev, newMsg]); setConversations(prev => prev.map(c => c.id === selected.id ? { ...c, updatedAt: newMsg.createdAt, context: newMsg.body } : c).sort((a,b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))); } catch(e) { console.error(e) } }");

ms = ms.replace(/const messages = getMessages\(\)\.filter\(item => item\.conversationId === conversation\.id\)\n.*?const last = messages\.at\(-1\)/s, "const last = null");

fs.writeFileSync('src/pages/Messages.tsx', ms);

