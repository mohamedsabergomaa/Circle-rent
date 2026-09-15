async function test() {
  const phoneNumber = `+201068122853`;
  console.log('Requesting resend-otp...');
  const res = await fetch('https://circle-backend-szyq.onrender.com/auth/resend-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber })
  });
  console.log('Resend OTP:', res.status, await res.text());
}
test();
