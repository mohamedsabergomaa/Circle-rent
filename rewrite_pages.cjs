const fs = require("fs")

function load(f) {
  return fs.readFileSync(f, "utf8")
}

function save(f, c) {
  fs.writeFileSync(f, c)
}

// Fix App.tsx missing imports for React if needed. It doesn't seem to complain.

// Actually there was an error src/App.tsx(381,3): error TS2686: 'React' refers to a UMD global

let app = load("src/App.tsx")

app = app.replace(/React\.useEffect/g, "useEffect")

if (!app.includes("useEffect,"))
  app = app.replace("import { useState", "import { useState, useEffect")

save("src/App.tsx", app)

// Fix SavedSearches.tsx

let ss = load("src/pages/SavedSearches.tsx")

ss = ss.replace(
  "const [items, setItems] = useState(() => getSavedSearches());",

  "const [items, setItems] = useState<SavedSearch[]>([]); useEffect(() => { getSavedSearches().then(setItems).catch(console.error) }, []);",
)

ss = ss.replace(
  /const remove = \(id: string\) => \{.*?window\.setTimeout\(\(\) => setNotice\(''\), 2300\) \}/s,

  "const remove = async (id: string) => { try { await deleteSavedSearch(id); setItems(prev => prev.filter(item => item.id !== id)); setNotice('تم حذف البحث المحفوظ.'); window.setTimeout(() => setNotice(''), 2300) } catch(e) { console.error(e) } }",
)

ss = ss.replace(
  /const update = \(name: string\) => \{.*?window\.setTimeout\(\(\) => setNotice\(''\), 2300\) \}/s,

  "const update = async (name: string) => { if (!editing) return; try { await updateSavedSearch(editing.id, name); setItems(prev => prev.map(item => item.id === editing.id ? { ...item, name } : item)); setEditing(null); setNotice('تم تعديل اسم البحث.'); window.setTimeout(() => setNotice(''), 2300) } catch(e){ console.error(e) } }",
)

if (!ss.includes("useEffect"))
  ss = ss.replace("import { useState }", "import { useState, useEffect }")

save("src/pages/SavedSearches.tsx", ss)

// Fix Profiles.tsx

let pf = load("src/pages/Profiles.tsx")

pf = pf.replace(
  "const [bookings, setBookings] = useState(() => getBookings())",

  "const [bookings, setBookings] = useState<MockBooking[]>([]); useEffect(() => { getBookings().then(setBookings).catch(console.error) }, [])",
)

pf = pf.replace(
  "const [bookings] = useState(() => getBookings())",

  "const [bookings, setBookings] = useState<MockBooking[]>([]); useEffect(() => { getBookings().then(setBookings).catch(console.error) }, [])",
)

if (!pf.includes("useEffect"))
  pf = pf.replace("import { useState }", "import { useState, useEffect }")

save("src/pages/Profiles.tsx", pf)

// Fix RentalReturn.tsx

let rr = load("src/pages/RentalReturn.tsx")

rr = rr.replace(
  "const [booking] = useState(() => getBookings().find(item => item.id === id));",

  "const [booking, setBooking] = useState<MockBooking | null>(null); useEffect(() => { getBookings().then(b => setBooking(b.find(x => x.id === id) || null)).catch(console.error) }, [id]);",
)

rr = rr.replace(
  /const submit = \(event: FormEvent\) => \{.*?saveBookings\(updated\); setDone\(true\) \}/s,

  "const submit = async (event: FormEvent) => { event.preventDefault(); if (checks.some(value => !value) || !booking) return; try { await updateBookingStatus(booking.id, 'return_pending'); setDone(true) } catch (e) { console.error(e) } }",
)

if (!rr.includes("useEffect"))
  rr = rr.replace(
    "import { useMemo, useState",
    "import { useMemo, useState, useEffect",
  )

save("src/pages/RentalReturn.tsx", rr)
