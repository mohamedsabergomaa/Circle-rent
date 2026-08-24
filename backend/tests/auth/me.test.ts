import { describe, it, expect } from 'vitest';
import { client } from '../helpers/test-client';
import { generateTestUser } from '../helpers/test-data';

describe('GET /auth/me', () => {
  it('should return user data for valid token', async () => {
    const userData = generateTestUser();
    const signupRes = await client.post('/auth/sign-up').send(userData);
    const token = signupRes.body.token;

    const res = await client.get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.phoneNumber).toBe(userData.phoneNumber);
  });

  it('should return 401 if no Authorization header is provided', async () => {
    const res = await client.get('/auth/me');
    expect(res.status).toBe(401);
  });

  it('should return 401 for malformed token', async () => {
    const res = await client.get('/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });
});
