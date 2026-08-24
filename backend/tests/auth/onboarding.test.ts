import { describe, it, expect } from 'vitest';
import { client } from '../helpers/test-client';
import { generateTestUser } from '../helpers/test-data';

describe('POST /auth/onboarding', () => {
  it('should update onboarding fields and set onboardingCompleted to true', async () => {
    const userData = generateTestUser();
    const signupRes = await client.post('/auth/sign-up').send(userData);
    const token = signupRes.body.token;

    const res = await client.put('/auth/onboarding')
      .set('Authorization', `Bearer ${token}`)
      .send({
        city: 'Riyadh',
        neighborhood: 'Olaya',
        bio: 'Hello!',
      });

    expect(res.status).toBe(200);
    expect(res.body.city).toBe('Riyadh');
    expect(res.body.onboardingCompleted).toBe(true);

    const meRes = await client.get('/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(meRes.body.onboardingCompleted).toBe(true);
    expect(meRes.body.city).toBe('Riyadh');
  });

  it('should accept partial data and complete onboarding', async () => {
    const userData = generateTestUser();
    const signupRes = await client.post('/auth/sign-up').send(userData);
    const token = signupRes.body.token;

    const res = await client.put('/auth/onboarding')
      .set('Authorization', `Bearer ${token}`)
      .send({
        city: 'Jeddah',
      });

    expect(res.status).toBe(200);
    expect(res.body.city).toBe('Jeddah');
    expect(res.body.onboardingCompleted).toBe(true);
  });

  it('should return 401 if no token is provided', async () => {
    const res = await client.post('/auth/onboarding').send({ city: 'Test' });
    expect(res.status).toBe(401);
  });
});
