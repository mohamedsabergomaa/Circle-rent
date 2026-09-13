const fs = require('fs');

let fav = fs.readFileSync('src/pages/Favorites.tsx', 'utf8');
fav = fav.replace("import('react').then(React => useEffect(() => { getFavorites().then(setItems).catch(console.error) }, []));",
  "useEffect(() => { getFavorites().then(setItems).catch(console.error) }, []);");
fav = fav.replace("import('react').then(React => React.useEffect(() => { getFavorites().then(setItems).catch(console.error) }, []));",
  "useEffect(() => { getFavorites().then(setItems).catch(console.error) }, []);");
if (!fav.includes('useEffect')) fav = fav.replace("import { useMemo, useState }", "import { useMemo, useState, useEffect }");
fs.writeFileSync('src/pages/Favorites.tsx', fav);

let rr = fs.readFileSync('src/pages/RentalReturn.tsx', 'utf8');
rr = rr.replace("import('react').then(React => React.useEffect(() => { getBookings().then(b => setBooking(b.find(x => x.id === id) || null)).catch(console.error) }, [id]));",
  "useEffect(() => { getBookings().then(b => setBooking(b.find(x => x.id === id) || null)).catch(console.error) }, [id]);");
rr = rr.replace("import('react').then(React => useEffect(() => { getBookings().then(b => setBooking(b.find(x => x.id === id) || null)).catch(console.error) }, [id]));",
  "useEffect(() => { getBookings().then(b => setBooking(b.find(x => x.id === id) || null)).catch(console.error) }, [id]);");
if (!rr.includes('useEffect')) rr = rr.replace("import { useMemo, useState", "import { useMemo, useState, useEffect");
rr = rr.replace("import { getBookings, updateBookingStatus }", "import { getMyBookings as getBookings, updateBookingStatus }");
fs.writeFileSync('src/pages/RentalReturn.tsx', rr);

