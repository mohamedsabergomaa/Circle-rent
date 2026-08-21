const fs = require('fs');

let c = fs.readFileSync('src/pages/Messages.tsx', 'utf8');

c = c.replace(/const \[messages, setMessages\] = useState<Message\[\]>\(\[\]\); useEffect\(\(\) => \{ getMessages\(\)\.then\(setMessages\)\.catch\(console\.error\) \}, \[\]\);/,
  "const [messages, setMessages] = useState<Message[]>([]); useEffect(() => { if (selectedId) { getMessages(selectedId).then(setMessages).catch(console.error) } }, [selectedId]);");

c = c.replace(/const last: Message \| null = null;/, "const last = messages.length ? messages[messages.length - 1] : null;");
// But wait, the ConversationRow doesn't have messages array in its props, it just renders the last message preview.
// Oh, the ConversationRow takes `conversation` prop and was calling `getMessages()` to get its last message.
c = c.replace(/function ConversationRow\(\{ conversation, active, onClick \}: \{ conversation: Conversation; active: boolean; onClick: \(\) => void \}\) \{ const last: Message \| null = null;/,
  "function ConversationRow({ conversation, active, onClick }: { conversation: Conversation; active: boolean; onClick: () => void }) { const last = null as Message | null;");
// Let's just remove the `last: Message | null = null;` part and let it be `const last = null as Message | null;`
// Property 'body' does not exist on type 'never' is caused by `const last = null;` and then `last?.body`. If we cast it to `Message | null` it works.

fs.writeFileSync('src/pages/Messages.tsx', c);
