const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// replace saveSearch
content = content.replace(/const saveSearch = \(\) => \{\n    const name = saveName\.trim\(\) \|\| \(query\.trim\(\) \? `بحث: \$\{query\.trim\(\)\}` : 'بحث مخصص'\)\n    const item = \{ id: `search-\$\{Date\.now\(\)\}`, name, query, priceRange, minimumRating, location, latestOnly, createdAt: new Date\(\)\.toISOString\(\) \}\n    saveSavedSearches\(\[item, \.\.\.getSavedSearches\(\)\]\)\n    setShowSaveSearch\(false\)\n    setSaveName\(''\)\n    navigate\('\/saved-searches'\)\n  \}/g,
`const saveSearch = async () => {
    const name = saveName.trim() || (query.trim() ? \`بحث: \${query.trim()}\` : 'بحث مخصص')
    try {
      await import('./services/savedSearches').then(m => m.createSavedSearch({ name, query, priceRange, minimumRating, location, latestOnly }))
      setShowSaveSearch(false)
      setSaveName('')
      navigate('/saved-searches')
    } catch (err) {
      console.error(err)
    }
  }`);

fs.writeFileSync('src/App.tsx', content);
