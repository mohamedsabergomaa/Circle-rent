import { describe, it, expect } from 'vitest';
import { client } from '../helpers/test-client';
import { generateTestUser } from '../helpers/test-data';

describe('POST /auth/sign-out', () => {
  it('should return 200 for valid token', async () => {
    const userData = generateTestUser();
    const signupRes = await client.post('/auth/sign-up').send(userData);
    const token = signupRes.body.token;

    const res = await client.post('/auth/sign-out')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('should return 401 if no token is provided', async () => {
    const res = await client.post('/auth/sign-out');
    expect(res.status).toBe(401);
  });
});
