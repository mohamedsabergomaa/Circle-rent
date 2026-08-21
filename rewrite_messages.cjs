const fs = require('fs');
let content = fs.readFileSync('src/pages/Messages.tsx', 'utf8');

content = content.replace(/const select = \(id: string\) => \{.*?navigate\(\`\/messages\?conversation=\$\{id\}\`, \{ replace: true \}\) \}/g,
  "const select = (id: string) => { setSelectedId(id); setMobileOpen(true); navigate(`/messages?conversation=${id}`, { replace: true }) }");

content = content.replace(/const send = \(body: string\) => \{ if \(\!selected \|\| \!body\.trim\(\)\) return; .*?saveConversations\(nextConversations\) \}/g,
  `const send = async (body: string) => { 
    if (!selected || !body.trim()) return; 
    try { 
      const newMsg = await sendMessage(selected.id, body.trim()); 
      setMessages(prev => [...prev, newMsg]); 
      setConversations(prev => prev.map(c => c.id === selected.id ? { ...c, updatedAt: newMsg.createdAt, context: newMsg.body } : c).sort((a,b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))); 
    } catch(e) { console.error(e) } 
  }`);

fs.writeFileSync('src/pages/Messages.tsx', content);
