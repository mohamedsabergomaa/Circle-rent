const fs = require('fs');

// Profiles.tsx
let pf = fs.readFileSync('src/pages/Profiles.tsx', 'utf8');
pf = pf.replace("import { getBookings, type MockBooking } from '../lib/mockBookings'",
  "import { getOwnerBookings, getMyBookings } from '../services/bookings'\nimport type { MockBooking } from '../types'");
pf = pf.replace("const [bookings] = useState(() => getBookings())",
  "const [bookings, setBookings] = useState<MockBooking[]>([]); useEffect(() => { getOwnerBookings().then(setBookings).catch(console.error) }, [])");
// also fix import
pf = pf.replace("import { useState }", "import { useState, useEffect }");
fs.writeFileSync('src/pages/Profiles.tsx', pf);

// OwnerBookings.tsx
let ob = fs.readFileSync('src/pages/OwnerBookings.tsx', 'utf8');
ob = ob.replace("import { getBookings, saveBookings, type BookingStatus, type MockBooking } from '../lib/mockBookings'",
  "import { getOwnerBookings, updateBookingStatus } from '../services/bookings'\nimport type { BookingStatus, MockBooking } from '../types'");
ob = ob.replace("const [bookings, setBookings] = useState(() => getBookings())",
  "const [bookings, setBookings] = useState<MockBooking[]>([]); useEffect(() => { getOwnerBookings().then(setBookings).catch(console.error) }, [])");
ob = ob.replace(/const updateStatus = \(id: string, status: BookingStatus, message: string\) => \{\n.*?setBookings\(next\)\n  \}/s,
  "const updateStatus = async (id: string, status: BookingStatus, message: string) => { try { await updateBookingStatus(id, status); setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b)) } catch(e) { console.error(e) } }");
ob = ob.replace("import { useMemo, useState }", "import { useMemo, useState, useEffect }");
fs.writeFileSync('src/pages/OwnerBookings.tsx', ob);

// SavedSearches.tsx
let ss = fs.readFileSync('src/pages/SavedSearches.tsx', 'utf8');
ss = ss.replace("import { getSavedSearches, saveSavedSearches, type SavedSearch } from '../lib/mockSavedSearches'",
  "import { getSavedSearches, deleteSavedSearch, updateSavedSearch } from '../services/savedSearches'\nimport type { SavedSearch } from '../types'");
ss = ss.replace("const [items, setItems] = useState(() => getSavedSearches());",
  "const [items, setItems] = useState<SavedSearch[]>([]); useEffect(() => { getSavedSearches().then(setItems).catch(console.error) }, []);");
ss = ss.replace(/const remove = \(id: string\) => \{\n.*?window\.setTimeout\(\(\) => setNotice\(''\), 2300\) \}/s,
  "const remove = async (id: string) => { try { await deleteSavedSearch(id); setItems(prev => prev.filter(item => item.id !== id)); setNotice('تم حذف البحث المحفوظ.'); window.setTimeout(() => setNotice(''), 2300) } catch (e) { console.error(e) } }");
ss = ss.replace(/const update = \(name: string\) => \{\n.*?window\.setTimeout\(\(\) => setNotice\(''\), 2300\) \}/s,
  "const update = async (name: string) => { if (!editing) return; try { await updateSavedSearch(editing.id, name); setItems(prev => prev.map(item => item.id === editing.id ? { ...item, name } : item)); setEditing(null); setNotice('تم تعديل اسم البحث.'); window.setTimeout(() => setNotice(''), 2300) } catch (e) { console.error(e) } }");
ss = ss.replace("import { useState }", "import { useState, useEffect }");
// Note: SavedSearches.tsx originally had `const [items, setItems] = useState(() => getSavedSearches());` - we fixed that.
fs.writeFileSync('src/pages/SavedSearches.tsx', ss);

// Messages.tsx
let ms = fs.readFileSync('src/pages/Messages.tsx', 'utf8');
ms = ms.replace("import { ensureConversation, getConversations, getMessages, saveConversations, saveMessages, type Conversation, type Message } from '../lib/mockMessages'",
  "import { getConversations, getMessages, sendMessage } from '../services/messages'\nimport type { Conversation, Message } from '../types'");
ms = ms.replace("import { getBookings } from '../lib/mockBookings'", "import { getMyBookings as getBookings } from '../services/bookings'");
ms = ms.replace("const [conversations, setConversations] = useState<Conversation[]>([])\n  React.useEffect(() => { getConversations().then(setConversations).catch(console.error) }, []);",
  "const [conversations, setConversations] = useState<Conversation[]>([]); useEffect(() => { getConversations().then(setConversations).catch(console.error) }, []);");
ms = ms.replace("const [messages, setMessages] = useState<Message[]>([])\n  React.useEffect(() => { getMessages().then(setMessages).catch(console.error) }, []);",
  "const [messages, setMessages] = useState<Message[]>([]); useEffect(() => { getMessages().then(setMessages).catch(console.error) }, []);");
ms = ms.replace("const [conversations, setConversations] = useState(() => getConversations())",
  "const [conversations, setConversations] = useState<Conversation[]>([]); useEffect(() => { getConversations().then(setConversations).catch(console.error) }, [])");
ms = ms.replace("const [messages, setMessages] = useState(() => getMessages())",
  "const [messages, setMessages] = useState<Message[]>([]); useEffect(() => { getMessages().then(setMessages).catch(console.error) }, [])");
ms = ms.replace(/useEffect\(\(\) => \{\n.*?setMobileOpen\(true\)\n  \}, \[params\]\)/s,
  "useEffect(() => { const bookingId = params.get('booking'); if (!bookingId) return; getBookings().then(b => { const booking = b.find(item => item.id === bookingId); if (booking) { getConversations().then(c => { setConversations(c); const match = c.find(x => x.bookingId === bookingId); if (match) { setSelectedId(match.id); setMobileOpen(true) } }) } }).catch(console.error) }, [params])");
ms = ms.replace(/useEffect\(\(\) => \{ const bookingId = params\.get\('booking'\); if \(\!bookingId\) return; getBookings\(\)\.then\(b => \{ const booking = b\.find\(item => item\.id === bookingId\); if \(booking\) \{ getConversations\(\)\.then\(c => \{ setConversations\(c\); const match = c\.find\(x => x\.bookingId === bookingId\); if \(match\) \{ setSelectedId\(match\.id\); setMobileOpen\(true\) \} \}\) \} \}\)\.catch\(console\.error\) \}, \[params\]\)/s,
  "useEffect(() => { const bookingId = params.get('booking'); if (!bookingId) return; getBookings().then(b => { const booking = b.find(item => item.id === bookingId); if (booking) { getConversations().then(c => { setConversations(c); const match = c.find(x => x.bookingId === bookingId); if (match) { setSelectedId(match.id); setMobileOpen(true) } }) } }).catch(console.error) }, [params])");
ms = ms.replace(/const select = \(id: string\) => \{\n.*?navigate\(\`\/messages\?conversation=\$\{id\}\`, \{ replace: true \}\)\n  \}/s,
  "const select = (id: string) => { setSelectedId(id); setMobileOpen(true); navigate(`/messages?conversation=${id}`, { replace: true }) }");
ms = ms.replace(/const select = \(id: string\) => \{ setSelectedId\(id\); setMobileOpen\(true\); navigate\(\`\/messages\?conversation=\$\{id\}\`, \{ replace: true \}\) \}/s,
  "const select = (id: string) => { setSelectedId(id); setMobileOpen(true); navigate(`/messages?conversation=${id}`, { replace: true }) }");
ms = ms.replace(/const send = \(body: string\) => \{\n.*?saveConversations\(nextConversations\)\n  \}/s,
  "const send = async (body: string) => { if (!selected || !body.trim()) return; try { const newMsg = await sendMessage(selected.id, body.trim()); setMessages(prev => [...prev, newMsg]); setConversations(prev => prev.map(c => c.id === selected.id ? { ...c, updatedAt: newMsg.createdAt, context: newMsg.body } : c).sort((a,b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))); } catch(e) { console.error(e) } }");
ms = ms.replace(/const send = async \(body: string\) => \{\n.*?catch\(e\) \{ console\.error\(e\) \} \n  \}/s,
  "const send = async (body: string) => { if (!selected || !body.trim()) return; try { const newMsg = await sendMessage(selected.id, body.trim()); setMessages(prev => [...prev, newMsg]); setConversations(prev => prev.map(c => c.id === selected.id ? { ...c, updatedAt: newMsg.createdAt, context: newMsg.body } : c).sort((a,b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))); } catch(e) { console.error(e) } }");
ms = ms.replace(/const messages = getMessages\(\)\.filter\(item => item\.conversationId === conversation\.id\);\n.*?const last = null;/s, "const last: Message | null = null;");
ms = ms.replace(/const last = null; \/\/ replaced by API/g, "const last: Message | null = null; // replaced by API");
if (ms.includes("import { useMemo, useRef, useState }")) {
  ms = ms.replace("import { useMemo, useRef, useState }", "import { useMemo, useRef, useState, useEffect }");
}
fs.writeFileSync('src/pages/Messages.tsx', ms);

