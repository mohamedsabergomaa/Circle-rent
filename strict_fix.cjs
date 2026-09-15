const fs = require("fs")

function applyRegex(file, regex, replace) {
  let c = fs.readFileSync(file, "utf8")

  c = c.replace(regex, replace)

  fs.writeFileSync(file, c)
}

// Profiles.tsx

let pf = fs.readFileSync("src/pages/Profiles.tsx", "utf8")

pf = pf.replace(
  "import { getBookings, type MockBooking } from '../lib/mockBookings'",

  "import { getMyBookings as getBookings } from '../services/bookings'\nimport type { MockBooking } from '../types'",
)

pf = pf.replace(
  "const [bookings] = useState(() => getBookings())",

  "const [bookings, setBookings] = useState<MockBooking[]>([]); useEffect(() => { getBookings().then(setBookings).catch(console.error) }, [])",
)

pf = pf.replace(
  "const [bookings, setBookings] = useState(() => getBookings())",

  "const [bookings, setBookings] = useState<MockBooking[]>([]); useEffect(() => { getBookings().then(setBookings).catch(console.error) }, [])",
)

if (pf.includes("useEffect") && !pf.includes("useEffect,"))
  pf = pf.replace("import { useState }", "import { useState, useEffect }")

fs.writeFileSync("src/pages/Profiles.tsx", pf)

// OwnerBookings.tsx

let ob = fs.readFileSync("src/pages/OwnerBookings.tsx", "utf8")

ob = ob.replace(
  "import { getBookings, saveBookings, type BookingStatus, type MockBooking } from '../lib/mockBookings'",

  "import { getOwnerBookings as getBookings, updateBookingStatus } from '../services/bookings'\nimport type { BookingStatus, MockBooking } from '../types'",
)

ob = ob.replace(
  "const [bookings, setBookings] = useState(() => getBookings())",

  "const [bookings, setBookings] = useState<MockBooking[]>([]); useEffect(() => { getBookings().then(setBookings).catch(console.error) }, [])",
)

ob = ob.replace(
  /const updateStatus = \(id: string, status: BookingStatus, message: string\) => \{\n.*?setBookings\(next\)\n  \}/s,

  "const updateStatus = async (id: string, status: BookingStatus, message: string) => { try { await updateBookingStatus(id, status); setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b)) } catch(e) { console.error(e) } }",
)

if (ob.includes("useEffect") && !ob.includes("useEffect,"))
  ob = ob.replace(
    "import { useMemo, useState",
    "import { useMemo, useState, useEffect",
  )

fs.writeFileSync("src/pages/OwnerBookings.tsx", ob)

// Messages.tsx

let ms = fs.readFileSync("src/pages/Messages.tsx", "utf8")

ms = ms.replace(
  "import { ensureConversation, getConversations, getMessages, saveConversations, saveMessages, type Conversation, type Message } from '../lib/mockMessages'",

  "import { getConversations, getMessages, sendMessage } from '../services/messages'\nimport type { Conversation, Message } from '../types'",
)

ms = ms.replace(
  "import { getBookings } from '../lib/mockBookings'",
  "import { getMyBookings as getBookings } from '../services/bookings'",
)

ms = ms.replace(
  "const [conversations, setConversations] = useState(() => getConversations())",

  "const [conversations, setConversations] = useState<Conversation[]>([]); useEffect(() => { getConversations().then(setConversations).catch(console.error) }, [])",
)

ms = ms.replace(
  "const [messages, setMessages] = useState(() => getMessages())",

  "const [messages, setMessages] = useState<Message[]>([]); useEffect(() => { getMessages().then(setMessages).catch(console.error) }, [])",
)

ms = ms.replace(
  /useEffect\(\(\) => \{\n.*?setMobileOpen\(true\)\n  \}, \[params\]\)/s,

  "useEffect(() => { const bookingId = params.get('booking'); if (!bookingId) return; getBookings().then(b => { const booking = b.find(item => item.id === bookingId); if (booking) { getConversations().then(c => { setConversations(c); const match = c.find(x => x.bookingId === bookingId); if (match) { setSelectedId(match.id); setMobileOpen(true) } }) } }).catch(console.error) }, [params])",
)

ms = ms.replace(
  /const select = \(id: string\) => \{\n.*?navigate\(\`\/messages\?conversation=\$\{id\}\`, \{ replace: true \}\)\n  \}/s,

  "const select = (id: string) => { setSelectedId(id); setMobileOpen(true); navigate(`/messages?conversation=${id}`, { replace: true }) }",
)

ms = ms.replace(
  /const send = \(body: string\) => \{\n.*?saveConversations\(nextConversations\)\n  \}/s,

  "const send = async (body: string) => { if (!selected || !body.trim()) return; try { const newMsg = await sendMessage(selected.id, body.trim()); setMessages(prev => [...prev, newMsg]); setConversations(prev => prev.map(c => c.id === selected.id ? { ...c, updatedAt: newMsg.createdAt, context: newMsg.body } : c).sort((a,b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))); } catch(e) { console.error(e) } }",
)

ms = ms.replace(
  /const messages = getMessages\(\)\.filter\(item => item\.conversationId === conversation\.id\)\n.*?const last = messages\.at\(-1\)/s,
  "const last: Message | null = null",
)

if (ms.includes("useEffect") && !ms.includes("useEffect,"))
  ms = ms.replace(
    "import { useMemo, useRef, useState",
    "import { useMemo, useRef, useState, useEffect",
  )

fs.writeFileSync("src/pages/Messages.tsx", ms)

// RentalReturn.tsx

let rr = fs.readFileSync("src/pages/RentalReturn.tsx", "utf8")

rr = rr.replace(
  "import { getBookings, saveBookings } from '../lib/mockBookings'",

  "import { getMyBookings as getBookings, updateBookingStatus } from '../services/bookings'\nimport type { MockBooking } from '../types'",
)

rr = rr.replace(
  "const [booking] = useState(() => getBookings().find(item => item.id === id));",

  "const [booking, setBooking] = useState<MockBooking | null>(null); useEffect(() => { getBookings().then(b => setBooking(b.find(x => x.id === id) || null)).catch(console.error) }, [id]);",
)

rr = rr.replace(
  /const submit = \(event: FormEvent\) => \{.*?saveBookings\(updated\); setDone\(true\) \}/s,

  "const submit = async (event: FormEvent) => { event.preventDefault(); if (checks.some(value => !value) || !booking) return; try { await updateBookingStatus(booking.id, 'return_pending'); setDone(true) } catch(e){ console.error(e) } }",
)

if (rr.includes("useEffect") && !rr.includes("useEffect,"))
  rr = rr.replace(
    "import { useMemo, useState",
    "import { useMemo, useState, useEffect",
  )

fs.writeFileSync("src/pages/RentalReturn.tsx", rr)
