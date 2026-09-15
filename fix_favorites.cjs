const fs = require("fs")

let content = fs.readFileSync("src/pages/Favorites.tsx", "utf8")

content = content.replace(
  /const \[items, setItems\] = useState\(\(\) => getFavorites\(\)\);/g,

  "const [items, setItems] = useState<FavoriteItem[]>([]);\n  import('react').then(React => React.useEffect(() => { getFavorites().then(setItems).catch(console.error) }, []));",
)

content = content.replace(
  /const remove = \(id: string\) => \{ const next = items\.filter\(item => item\.id !== id\); setItems\(next\); saveFavorites\(next\) \}/g,

  "const remove = async (id: string) => { try { await removeFavorite(id); setItems(prev => prev.filter(item => item.id !== id)) } catch (e) { console.error(e) } }",
)

fs.writeFileSync("src/pages/Favorites.tsx", content)
