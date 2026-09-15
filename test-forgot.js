const fetch = require('node-fetch'); // wait, I can just use native fetch in node 18+

async function test() {
  const res = await fetch('https://circle-backend-szyq.onrender.com/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com' })
  });
  console.log(res.status, res.statusText);
  const text = await res.text();
  console.log(text);
}

test();
