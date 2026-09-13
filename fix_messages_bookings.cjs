const fs = require('fs');
let content = fs.readFileSync('src/pages/Messages.tsx', 'utf8');

content = content.replace("import { getBookings } from '../lib/mockBookings'", "import { getBookings } from '../services/bookings'");

// Since getBookings is now async, we need to handle the useEffect carefully
content = content.replace(/useEffect\(\(\) => \{ const bookingId = params\.get\('booking'\); if \(\!bookingId\) return; const booking = getBookings\(\)\.find\(item => item\.id === bookingId\); if \(\!booking\) return; const conversation = ensureConversation\(\{ bookingId, listingName: booking\.listingName, listingImage: booking\.listingImage, ownerName: booking\.ownerName, ownerInitial: booking\.ownerName\.charAt\(0\), context: booking\.status === 'active' \? 'تأجير جارٍ الآن' : 'طلب حجز' \}\); setConversations\(getConversations\(\)\); setSelectedId\(conversation\.id\); setMobileOpen\(true\) \}, \[params\]\)/g,
  "useEffect(() => { const bookingId = params.get('booking'); if (!bookingId) return; getBookings().then(b => { const booking = b.find(item => item.id === bookingId); if (booking) { getConversations().then(c => { setConversations(c); const match = c.find(x => x.bookingId === bookingId); if (match) { setSelectedId(match.id); setMobileOpen(true) } }) } }).catch(console.error) }, [params])");

// Also there is a getMessages() call in ConversationRow component which is sync in mock
content = content.replace(/function ConversationRow\(\{ conversation, active, onClick \}: \{ conversation: Conversation; active: boolean; onClick: \(\) => void \}\) \{ const messages = getMessages\(\)\.filter\(item => item\.conversationId === conversation\.id\); const last = messages\.at\(-1\);/g,
  "function ConversationRow({ conversation, active, onClick }: { conversation: Conversation; active: boolean; onClick: () => void }) { const last = null; // replaced by API");

fs.writeFileSync('src/pages/Messages.tsx', content);
