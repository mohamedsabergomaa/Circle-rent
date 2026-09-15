const fs = require("fs")

let c = fs.readFileSync("src/lib/api.ts", "utf8")

c = c.replace(
  /if \(response\.status === 204\) return undefined as T\n  return response\.json\(\) as Promise<T>/,

  `if (response.status === 204) return undefined as T
  const text = await response.text()
  try {
    return text ? JSON.parse(text) : undefined
  } catch (err) {
    if (text.trim().startsWith('<')) {
      throw new ApiError(response.status, 'Received HTML instead of JSON. The backend is likely not running.')
    }
    throw new ApiError(response.status, 'Failed to parse JSON response')
  }`,
)

fs.writeFileSync("src/lib/api.ts", c)
