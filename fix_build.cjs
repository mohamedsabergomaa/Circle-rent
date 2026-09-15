const fs = require("fs")

function replaceFile(path, from, to) {
  let content = fs.readFileSync(path, "utf8")

  content = content.split(from).join(to)

  fs.writeFileSync(path, content)
}

function replaceRegex(path, from, to) {
  let content = fs.readFileSync(path, "utf8")

  content = content.replace(from, to)

  fs.writeFileSync(path, content)
}

// 1. Remove React. prefix from useEffect

;[
  "src/pages/Favorites.tsx",
  "src/pages/Messages.tsx",
  "src/pages/MyBookings.tsx",
  "src/pages/OwnerBookings.tsx",
  "src/pages/RentalReturn.tsx",
  "src/App.tsx",
  "src/pages/SavedSearches.tsx",
  "src/pages/Checkout.tsx",
  "src/pages/Profiles.tsx",
].forEach((path) => {
  if (fs.existsSync(path)) {
    replaceFile(path, "React.useEffect", "useEffect")

    replaceFile(path, "import('react').then(React => useEffect(", "useEffect(")

    replaceFile(
      path,
      "import('react').then(React => React.useEffect(",
      "useEffect(",
    )

    // Add import useEffect if not there

    let content = fs.readFileSync(path, "utf8")

    if (!content.includes("useEffect(")) return

    if (!content.includes("useEffect") && !content.includes("useEffect,")) {
      content = content.replace(
        "import { useState",
        "import { useState, useEffect",
      )

      fs.writeFileSync(path, content)
    }
  }
})
;[
  "src/pages/MyBookings.tsx",
  "src/pages/RentalReturn.tsx",
  "src/pages/Messages.tsx",
  "src/pages/OwnerBookings.tsx",
  "src/pages/Profiles.tsx",
].forEach((path) => {
  if (fs.existsSync(path)) {
    replaceFile(
      path,
      "import { getBookings",
      "import { getMyBookings as getBookings",
    )
  }
})

// Checkout.tsx error: missing pickupCode, returnCode

// `type '{ ... }' is missing the following properties from type 'CreateBookingInput': pickupCode, returnCode`

// CreateBookingInput in bookings.ts has Omit<MockBooking, 'id' | 'createdAt' | 'status'>

// Let's modify CreateBookingInput in bookings.ts to Omit pickupCode and returnCode as well.

let bookingsTs = fs.readFileSync("src/services/bookings.ts", "utf8")

bookingsTs = bookingsTs.replace(
  "Omit<MockBooking, 'id' | 'createdAt' | 'status'>",
  "Omit<MockBooking, 'id' | 'createdAt' | 'status' | 'pickupCode' | 'returnCode'>",
)

fs.writeFileSync("src/services/bookings.ts", bookingsTs)

// OwnerBookings.tsx: error TS2552: Cannot find name 'tab'. Did you mean 'tabs'?

// My regex messed up OwnerBookings.tsx. Let's fix OwnerBookings.tsx from scratch if possible, or just undo and redo properly.

// I will check the git diff for OwnerBookings.tsx and fix it.
