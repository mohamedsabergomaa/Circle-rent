const fs = require('fs');
let content = fs.readFileSync('src/pages/RentalReturn.tsx', 'utf8');

content = content.replace(/const submit = \(event: FormEvent\) => \{.*?saveBookings\(updated\); setDone\(true\) \}/g,
  "const submit = async (event: FormEvent) => { event.preventDefault(); if (checks.some(value => !value)) return; try { await updateBookingStatus(booking.id, 'return_pending'); setDone(true) } catch (e) { console.error(e) } }");

// And also `const [booking] = useState(() => getBookings().find(...)`
content = content.replace(/const \[booking\] = useState\(\(\) => getBookings\(\)\.find\(item => item\.id === id\)\);/g,
  "const [booking, setBooking] = useState<MockBooking | null>(null); import('react').then(React => React.useEffect(() => { getBookings().then(b => setBooking(b.find(x => x.id === id) || null)).catch(console.error) }, [id]));");

fs.writeFileSync('src/pages/RentalReturn.tsx', content);
