import { describe, it, expect } from 'vitest';
import { client } from '../helpers/test-client';
import { generateTestUser } from '../helpers/test-data';
import { otpStore } from '../../src/modules/auth/auth.service';

describe('POST /auth/verify-otp', () => {
  it('should successfully verify a correct OTP', async () => {
    const userData = generateTestUser();
    
    // Create the user first
    await client.post('/auth/sign-up').send(userData);

    // Request an OTP
    await client.post('/auth/sign-in').send({ phoneNumber: userData.phoneNumber });
    
    // Read OTP from store
    const stored = otpStore.get(userData.phoneNumber);
    expect(stored).toBeDefined();

    // Verify
    const res = await client.post('/auth/verify-otp').send({
      phoneNumber: userData.phoneNumber,
      code: stored!.code,
    });

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.token).toBeDefined();
    expect(res.body.user.phoneVerified).toBe(true);
  });

  it('should return 400 for incorrect OTP', async () => {
    const userData = generateTestUser();
    await client.post('/auth/sign-up').send(userData);
    await client.post('/auth/sign-in').send({ phoneNumber: userData.phoneNumber });

    const res = await client.post('/auth/verify-otp').send({
      phoneNumber: userData.phoneNumber,
      code: '000000', // Invalid
    });

    expect(res.status).toBe(400);
  });

  it('should fail on second attempt with same OTP (reused)', async () => {
    const userData = generateTestUser();
    await client.post('/auth/sign-up').send(userData);
    await client.post('/auth/sign-in').send({ phoneNumber: userData.phoneNumber });
    
    const stored = otpStore.get(userData.phoneNumber);

    // First attempt succeeds
    await client.post('/auth/verify-otp').send({
      phoneNumber: userData.phoneNumber,
      code: stored!.code,
    });

    // Second attempt fails
    const res2 = await client.post('/auth/verify-otp').send({
      phoneNumber: userData.phoneNumber,
      code: stored!.code,
    });

    expect(res2.status).toBe(400);
  });
});
