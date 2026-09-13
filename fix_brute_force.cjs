const fs = require('fs');

function brute(file, replacer) {
  fs.writeFileSync(file, replacer(fs.readFileSync(file, 'utf8')));
}

brute('src/pages/SavedSearches.tsx', c => {
  c = c.replace(/const remove = \(id: string\) => \{ const next = items\.filter\(item => item\.id !== id\); setItems\(next\); saveSavedSearches\(next\); setNotice\('تم حذف البحث المحفوظ\.'\); window\.setTimeout\(\(\) => setNotice\(''\), 2300\) \}/, 
    "const remove = async (id: string) => { try { await deleteSavedSearch(id); setItems(prev => prev.filter(item => item.id !== id)); setNotice('تم حذف البحث المحفوظ.'); window.setTimeout(() => setNotice(''), 2300) } catch(e) { console.error(e) } }");
  c = c.replace(/const update = \(name: string\) => \{ if \(\!editing\) return; const next = items\.map\(item => item\.id === editing\.id \? \{ \.\.\.item, name \} : item\); setItems\(next\); saveSavedSearches\(next\); setEditing\(null\); setNotice\('تم تعديل اسم البحث\.'\); window\.setTimeout\(\(\) => setNotice\(''\), 2300\) \}/,
    "const update = async (name: string) => { if (!editing) return; try { await updateSavedSearch(editing.id, name); setItems(prev => prev.map(item => item.id === editing.id ? { ...item, name } : item)); setEditing(null); setNotice('تم تعديل اسم البحث.'); window.setTimeout(() => setNotice(''), 2300) } catch(e) { console.error(e) } }");
  return c;
});

brute('src/pages/OwnerBookings.tsx', c => {
  c = c.replace(/const updateStatus = \(id: string, status: BookingStatus, message: string\) => \{ const next = bookings\.map\(b => \(b\.id === id \? \{ \.\.\.b, status \} : b\)\); saveBookings\(next\); setBookings\(next\); setNotice\(message\); window\.setTimeout\(\(\) => setNotice\(''\), 3000\) \}/,
    "const updateStatus = async (id: string, status: BookingStatus, message: string) => { try { await updateBookingStatus(id, status); setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b)); setNotice(message); window.setTimeout(() => setNotice(''), 3000) } catch(e) { console.error(e) } }");
  return c;
});

brute('src/pages/Profiles.tsx', c => {
  c = c.replace(/const visible = useMemo\(\(\) => bookings\.filter\(item => activeTab === 'bookings' \? \['pending', 'approved', 'active'\]\.includes\(item\.status\) : \['completed', 'cancelled', 'declined'\]\.includes\(item\.status\)\), \[bookings, activeTab\]\)/,
    "const visible = useMemo(() => Array.isArray(bookings) ? bookings.filter(item => activeTab === 'bookings' ? ['pending', 'approved', 'active'].includes(item.status) : ['completed', 'cancelled', 'declined'].includes(item.status)) : [], [bookings, activeTab])");
  c = c.replace(/const filtered = useMemo\(\(\) => bookings\.filter\(item => activeTab === 'bookings' \? \['pending', 'approved', 'active'\]\.includes\(item\.status\) : \['completed', 'cancelled', 'declined'\]\.includes\(item\.status\)\), \[bookings, activeTab\]\)/,
    "const filtered = useMemo(() => Array.isArray(bookings) ? bookings.filter(item => activeTab === 'bookings' ? ['pending', 'approved', 'active'].includes(item.status) : ['completed', 'cancelled', 'declined'].includes(item.status)) : [], [bookings, activeTab])");
  return c;
});

brute('src/pages/Messages.tsx', c => {
  c = c.replace("const conversation = ensureConversation({", "const conversation = { id: '', unread: 0, /*");
  c = c.replace("setMobileOpen(true) }, [params])", "setMobileOpen(true) }, [params]) /* removed ensureConv */");
  c = c.replace("const last = null; // replaced by API", "const last = null as Message | null; // replaced by API");
  return c;
});
