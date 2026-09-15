const fs = require("fs")

let c

// Profiles.tsx: `bookings` has type Promise?

c = fs.readFileSync("src/pages/Profiles.tsx", "utf8")

c = c.replace(
  /const \[bookings\] = useState\(\(\) => getBookings\(\)\)/g,

  "const [bookings, setBookings] = useState<MockBooking[]>([]); useEffect(() => { getBookings().then(setBookings).catch(console.error) }, [])",
)

// also fix import

if (c.includes("useEffect") && !c.includes("useEffect,")) {
  c = c.replace("import { useState", "import { useState, useEffect")
}

fs.writeFileSync("src/pages/Profiles.tsx", c)

// OwnerBookings.tsx

c = fs.readFileSync("src/pages/OwnerBookings.tsx", "utf8")

c = c.replace(
  /const updateStatus = \(id: string, status: BookingStatus, message: string\) => \{.*?saveBookings\(next\).*?\}/s,

  "const updateStatus = async (id: string, status: BookingStatus, message: string) => { try { await updateBookingStatus(id, status); setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b)) } catch(e) { console.error(e) } }",
)

if (c.includes("useEffect") && !c.includes("useEffect,")) {
  c = c.replace("import { useState", "import { useState, useEffect")
}

fs.writeFileSync("src/pages/OwnerBookings.tsx", c)

// Messages.tsx: Property 'body' does not exist on type 'never'.

c = fs.readFileSync("src/pages/Messages.tsx", "utf8")

// `const last = null` causes `last?.body` to fail because type of `last` is null.

c = c.replace("const last = null;", "const last: Message | null = null;")

// `Expected 1 arguments, but got 0.` inside Messages.tsx might be `setMobileOpen(true)` or `ensureConversation`?

// let's check

// `setMobileOpen(true)` or `setSelectedId()`?

fs.writeFileSync("src/pages/Messages.tsx", c)

// SavedSearches.tsx & RentalReturn.tsx missing useEffect import

function addUseEffect(path) {
  let file = fs.readFileSync(path, "utf8")

  if (
    file.includes("useEffect") &&
    !file.includes("useEffect,") &&
    !file.includes("useEffect }")
  ) {
    file = file.replace("import { useState", "import { useState, useEffect")

    fs.writeFileSync(path, file)
  }
}

addUseEffect("src/pages/SavedSearches.tsx")

addUseEffect("src/pages/RentalReturn.tsx")
