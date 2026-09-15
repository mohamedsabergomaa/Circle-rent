const fs = require("fs")
;[
  "src/pages/Favorites.tsx",
  "src/pages/Messages.tsx",
  "src/pages/MyBookings.tsx",
  "src/pages/OwnerBookings.tsx",
  "src/pages/Profiles.tsx",
  "src/pages/RentalReturn.tsx",
  "src/pages/SavedSearches.tsx",
].forEach((f) => {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, "utf8")

    c = c.split("[]));").join("[]);")

    c = c.split("[id]));").join("[id]);")

    c = c.split("[]))").join("[]);")

    c = c.split("[id]))").join("[id]);")

    fs.writeFileSync(f, c)
  }
})
