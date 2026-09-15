const fs = require("fs")

let c = fs.readFileSync("src/pages/Messages.tsx", "utf8")

c = c.replace(
  /const \[messages, setMessages\] = useState<Message\[\]>\(\[\]\); useEffect\(\(\) => \{ if \(selectedId\) \{ getMessages\(selectedId\)\.then\(setMessages\)\.catch\(console\.error\) \} \}, \[selectedId\]\); const \[selectedId, setSelectedId\] = useState<string \| null>\(params\.get\('conversation'\)\);/,

  "const [selectedId, setSelectedId] = useState<string | null>(params.get('conversation')); const [messages, setMessages] = useState<Message[]>([]); useEffect(() => { if (selectedId) { getMessages(selectedId).then(setMessages).catch(console.error) } }, [selectedId]);",
)

c = c.replace(
  /const last: Message \| null = null; \/\/ replaced by API/,
  "const last = null as Message | null;",
)

c = c.replace(
  /const last: Message \| null = null \/\/ replaced by API/,
  "const last = null as Message | null;",
)

c = c.replace(/const last = null;/, "const last = null as Message | null;")

fs.writeFileSync("src/pages/Messages.tsx", c)
