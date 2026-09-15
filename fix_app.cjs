const fs = require("fs")

let content = fs.readFileSync("src/App.tsx", "utf8")

// replace imports

content = content.replace(
  "import { isFavorite, toggleFavorite } from './lib/mockFavorites'",

  "import { checkFavorite, addFavorite, removeFavorite } from './services/favorites'",
)

// rewrite the hooks for favorites

content = content.replace(
  /const \[saved, setSaved\] = useState\(\(\) => isFavorite\(listing\.id\)\)\n\s*const toggleSaved = \(\) => setSaved\(toggleFavorite\(\{ id: listing\.id, name: listing\.name, category: listing\.category, price: listing\.price, city: listing\.city, image: listing\.image, owner: listing\.owner, rating: listing\.rating \}\)\)/g,

  `const [saved, setSaved] = useState(false)
  React.useEffect(() => { checkFavorite(listing.id).then(setSaved).catch(console.error) }, [listing.id])
  const toggleSaved = async () => {
    try {
      if (saved) { await removeFavorite(listing.id); setSaved(false) }
      else { await addFavorite({ id: listing.id, name: listing.name, category: listing.category, price: listing.price, city: listing.city, image: listing.image, owner: listing.owner, rating: listing.rating }); setSaved(true) }
    } catch (err) { console.error(err) }
  }`,
)

// Also fix getSavedSearches etc in App.tsx if any

content = content.replace(
  "import { saveSavedSearches, getSavedSearches } from './lib/mockSavedSearches'",

  "import { getSavedSearches, deleteSavedSearch } from './services/savedSearches'\nimport type { SavedSearch } from './types'",
)

// we might need to fix how it's used

fs.writeFileSync("src/App.tsx", content)
