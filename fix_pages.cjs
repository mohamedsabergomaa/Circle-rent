const fs = require('fs');
const glob = require('fs').readdirSync('src/pages').map(f => 'src/pages/' + f).filter(f => f.endsWith('.tsx'));

for (let file of glob) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('import { getFavorites, saveFavorites, type FavoriteItem } from \'../lib/mockFavorites\'')) {
    content = content.replace('import { getFavorites, saveFavorites, type FavoriteItem } from \'../lib/mockFavorites\'',
      "import { getFavorites, removeFavorite } from '../services/favorites'\nimport type { FavoriteItem } from '../types'");
    // replace sync logic
    content = content.replace(/const \[favorites, setFavorites\] = useState\(\(\) => getFavorites\(\)\)/g, 
      "const [favorites, setFavorites] = useState<FavoriteItem[]>([])\n  React.useEffect(() => { getFavorites().then(setFavorites).catch(console.error) }, [])");
    content = content.replace(/const removeFavorite = \(id: string\) => \{\n    const next = favorites\.filter\(f => f\.id !== id\)\n    saveFavorites\(next\)\n    setFavorites\(next\)\n  \}/g,
      "const handleRemoveFavorite = async (id: string) => { try { await removeFavorite(id); setFavorites(prev => prev.filter(f => f.id !== id)) } catch (e) { console.error(e) } }");
    content = content.replace(/onClick=\{\(\) => removeFavorite\(item\.id\)\}/g, "onClick={() => handleRemoveFavorite(item.id)}");
    changed = true;
  }

  if (content.includes('from \'../lib/mockBookings\'')) {
    content = content.replace(/import \{ getBookings, saveBookings, type BookingStatus, type MockBooking \} from '\.\.\/lib\/mockBookings'/g,
      "import { getBookings, updateBookingStatus } from '../services/bookings'\nimport type { BookingStatus, MockBooking } from '../types'");
    content = content.replace(/import \{ getBookings, type MockBooking \} from '\.\.\/lib\/mockBookings'/g,
      "import { getBookings } from '../services/bookings'\nimport type { MockBooking } from '../types'");
    content = content.replace(/import \{ getBookings, saveBookings \} from '\.\.\/lib\/mockBookings'/g,
      "import { getBookings, updateBookingStatus } from '../services/bookings'\nimport type { MockBooking } from '../types'");

    // Update useState hooks
    if (content.includes('useState<MockBooking[]>(() => getBookings()')) {
      content = content.replace(/const \[bookings, setBookings\] = useState<MockBooking\[\]>\(\(\) => getBookings\(\).*\)/g,
        "const [bookings, setBookings] = useState<MockBooking[]>([])\n  React.useEffect(() => { getBookings().then(data => setBookings(data)).catch(console.error) }, [])");
    } else if (content.includes('useState(() => getBookings()')) {
       content = content.replace(/const \[bookings, setBookings\] = useState\(\(\) => getBookings\(\).*\)/g,
        "const [bookings, setBookings] = useState<MockBooking[]>([])\n  React.useEffect(() => { getBookings().then(data => setBookings(data)).catch(console.error) }, [])");
    }

    // handle updateStatus
    content = content.replace(/const updateStatus = \(id: string, status: BookingStatus\) => \{\n    const next = bookings\.map\(b => \(b\.id === id \? \{ \.\.\.b, status \} : b\)\)\n    saveBookings\(next\)\n    setBookings\(next\)\n  \}/g,
      "const updateStatus = async (id: string, status: BookingStatus) => { try { await updateBookingStatus(id, status); setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b)) } catch (e) { console.error(e) } }");

    // handle code check
    content = content.replace(/const b = bookings\.map\(x => x\.id === targetBooking\.id \? \{ \.\.\.x, status: 'return_pending' as const \} : x\)\n      saveBookings\(b\)/g,
      "setBookings(prev => prev.map(x => x.id === targetBooking.id ? { ...x, status: 'return_pending' } : x))\n      updateBookingStatus(targetBooking.id, 'return_pending').catch(console.error)");

    changed = true;
  }

  if (content.includes('from \'../lib/mockSavedSearches\'')) {
    content = content.replace(/import \{ getSavedSearches, saveSavedSearches, type SavedSearch \} from '\.\.\/lib\/mockSavedSearches'/g,
      "import { getSavedSearches, deleteSavedSearch, updateSavedSearch } from '../services/savedSearches'\nimport type { SavedSearch } from '../types'");
    
    content = content.replace(/const \[searches, setSearches\] = useState\(\(\) => getSavedSearches\(\)\)/g,
      "const [searches, setSearches] = useState<SavedSearch[]>([])\n  React.useEffect(() => { getSavedSearches().then(setSearches).catch(console.error) }, [])");
    
    content = content.replace(/const removeSearch = \(id: string\) => \{\n    const next = searches\.filter\(s => s\.id !== id\)\n    saveSavedSearches\(next\)\n    setSearches\(next\)\n  \}/g,
      "const removeSearch = async (id: string) => { try { await deleteSavedSearch(id); setSearches(prev => prev.filter(s => s.id !== id)) } catch (e) { console.error(e) } }");
    
    // update name logic might exist
    content = content.replace(/const applyNameEdit = \(\) => \{\n    if \(\!editingId\) return\n    const next = searches\.map\(s => \(s\.id === editingId \? \{ \.\.\.s, name: editName \} : s\)\)\n    saveSavedSearches\(next\)\n    setSearches\(next\)\n    setEditingId\(null\)\n  \}/g,
      "const applyNameEdit = async () => { if (!editingId) return; try { await updateSavedSearch(editingId, editName); setSearches(prev => prev.map(s => s.id === editingId ? { ...s, name: editName } : s)); setEditingId(null) } catch (e) { console.error(e) } }");
      
    changed = true;
  }

  if (content.includes('from \'../lib/mockMessages\'')) {
    content = content.replace(/import \{ ensureConversation, getConversations, getMessages, saveConversations, saveMessages, type Conversation, type Message \} from '\.\.\/lib\/mockMessages'/g,
      "import { getConversations, getMessages, sendMessage } from '../services/messages'\nimport type { Conversation, Message } from '../types'");

    content = content.replace(/const \[conversations, setConversations\] = useState\(\(\) => getConversations\(\)\)/g,
      "const [conversations, setConversations] = useState<Conversation[]>([])\n  React.useEffect(() => { getConversations().then(setConversations).catch(console.error) }, [])");
    
    content = content.replace(/const \[messages, setMessages\] = useState\(\(\) => getMessages\(\)\)/g,
      "const [messages, setMessages] = useState<Message[]>([])\n  React.useEffect(() => { getMessages().then(setMessages).catch(console.error) }, [])");

    content = content.replace(/const send = \(\) => \{\n    if \(\!draft\.trim\(\) \|\| \!activeConv\) return\n\n    const newMsg: Message = \{\n      id: `msg-\$\{Date\.now\(\)\}`,\n      conversationId: activeConv\.id,\n      sender: 'me',\n      body: draft\.trim\(\),\n      createdAt: new Date\(\)\.toISOString\(\),\n    \}\n    const nextMessages = \[\.\.\.messages, newMsg\]\n    saveMessages\(nextMessages\)\n    setMessages\(nextMessages\)\n\n    const nextConvs = conversations\.map\(c => c\.id === activeConv\.id \? \{ \.\.\.c, context: draft\.trim\(\), updatedAt: newMsg\.createdAt \} : c\)\n    saveConversations\(nextConvs\)\n    setConversations\(nextConvs\)\n    setDraft\(''\)\n  \}/g,
      `const send = async () => {
    if (!draft.trim() || !activeConv) return
    try {
      const newMsg = await sendMessage(activeConv.id, draft.trim())
      setMessages(prev => [...prev, newMsg])
      setConversations(prev => prev.map(c => c.id === activeConv.id ? { ...c, context: draft.trim(), updatedAt: newMsg.createdAt } : c))
      setDraft('')
    } catch (e) { console.error(e) }
  }`);

    // remove ensureConversation calls (it was part of a useEffect)
    content = content.replace(/useEffect\(\(\) => \{\n    if \(newBookingId\) \{\n      const updated = ensureConversation\(newBookingId, bookings\)\n      setConversations\(updated\)\n      const active = updated\.find\(c => c\.bookingId === newBookingId\)\n      if \(active\) setActiveId\(active\.id\)\n    \}\n  \}, \[newBookingId, bookings\]\)/g,
      "// create conversation logic moved to backend, fetch to get latest\n  React.useEffect(() => { if (newBookingId) { getConversations().then(setConversations).catch(console.error) } }, [newBookingId])");
      
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
  }
}
