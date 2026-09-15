const fs = require("fs")

let c = fs.readFileSync("src/lib/api.ts", "utf8")

c = c.replace(
  /return text \? JSON\.parse\(text\) : undefined/,
  "return text ? JSON.parse(text) : (undefined as unknown as T)",
)

fs.writeFileSync("src/lib/api.ts", c)
