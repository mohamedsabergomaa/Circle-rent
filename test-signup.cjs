async function test() {
  const ts = Date.now();
  const email = `test${ts}@example.com`;
  const phoneNumber = `+2010${ts.toString().slice(-8)}`;

  console.log('Signing up with', email, phoneNumber);
  let res = await fetch('https://circle-backend-szyq.onrender.com/auth/sign-up', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: 'Test User', phoneNumber, password: 'password123', email })
  });
  
  console.log('Requesting forgot password with email and phoneNumber...');
  res = await fetch('https://circle-backend-szyq.onrender.com/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, phoneNumber })
  });
  console.log('Forgot Password:', res.status, await res.text());
}
test();
