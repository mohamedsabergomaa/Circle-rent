const fs = require('fs');
let content = fs.readFileSync('src/pages/MyBookings.tsx', 'utf8');

content = content.replace(/const cancel = \(\) => \{.*?setNotice\('تم إلغاء الطلب التجريبي.'\) \}/g,
  "const cancel = async () => { try { await updateBookingStatus(booking.id, 'cancelled'); setBookings(prev => prev.map(item => item.id === booking.id ? { ...item, status: 'cancelled' } : item)); setNotice('تم الإلغاء.') } catch (e) { console.error(e) } }");

// And also notice definition is missing `const [notice, setNotice] = useState('')` wait, let's look for it
if (!content.includes('const [notice, setNotice]')) {
  content = content.replace('const navigate = useNavigate();', 'const navigate = useNavigate(); const [notice, setNotice] = useState("");');
}

fs.writeFileSync('src/pages/MyBookings.tsx', content);
