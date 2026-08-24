import { describe, it, expect } from 'vitest';
import { client } from '../helpers/test-client';
import { generateTestUser } from '../helpers/test-data';

describe('POST /auth/sign-in', () => {
  it('should send an OTP for a valid phone number', async () => {
    const user = generateTestUser();
    const res = await client.post('/auth/sign-in').send({
      phoneNumber: user.phoneNumber,
    });

    expect(res.status).toBe(200);
    expect(res.body.otpSent).toBe(true);
  });

  it('should return 400 when phone number is missing', async () => {
    const res = await client.post('/auth/sign-in').send({});
    expect(res.status).toBe(400);
  });
});
