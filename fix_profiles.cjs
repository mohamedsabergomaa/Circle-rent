const fs = require("fs")

let c = fs.readFileSync("src/pages/Profiles.tsx", "utf8")

c = c.replace(
  /const completed = getBookings\(\)\.filter\(item => item\.status === 'completed'\)\n  const canReview = completed\.length > 0/,

  "const [completed, setCompleted] = useState<MockBooking[]>([]); useEffect(() => { getBookings().then(b => setCompleted(b.filter(item => item.status === 'completed'))).catch(console.error) }, []); const canReview = completed.length > 0",
)

fs.writeFileSync("src/pages/Profiles.tsx", c)
