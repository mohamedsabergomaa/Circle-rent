let counter = 0;

export function generateTestUser() {
  counter++;
  const timestamp = Date.now().toString();
  // Valid phone format: /^\+?[1-9]\d{1,14}$/ -> +1 followed by timestamp + counter
  const suffix = timestamp.slice(-8) + String(counter).padStart(2, '0');
  return {
    fullName: `Test User ${suffix}`,
    phoneNumber: `+1${suffix}`,
    email: `test${suffix}@example.com`,
  };
}
