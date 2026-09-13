const fs = require('fs');
let ob = fs.readFileSync('src/pages/OwnerBookings.tsx', 'utf8');

ob = ob.replace(/const setStatus = \(id: string, status: BookingStatus, message: string\) => \{ const updated = bookings\.map\(item => item\.id === id \? \{ \.\.\.item, status \} : item\); setBookings\(updated\); saveBookings\(updated\); setNotice\(message\); window\.setTimeout\(\(\) => setNotice\(''\), 2600\) \}/,
  "const setStatus = async (id: string, status: BookingStatus, message: string) => { try { await updateBookingStatus(id, status); setBookings(prev => prev.map(item => item.id === id ? { ...item, status } : item)); setNotice(message); window.setTimeout(() => setNotice(''), 2600) } catch(e){ console.error(e) } }");

fs.writeFileSync('src/pages/OwnerBookings.tsx', ob);
