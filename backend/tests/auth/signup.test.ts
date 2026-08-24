import { describe, it, expect } from 'vitest';
import { client } from '../helpers/test-client';
import { generateTestUser } from '../helpers/test-data';

describe('POST /auth/sign-up', () => {
  it('should sign up a valid user successfully', async () => {
    const user = generateTestUser();
    const res = await client.post('/auth/sign-up').send(user);

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.token).toBeDefined();
    expect(res.body.user.onboardingCompleted).toBe(false);
  });

  it('should return 400 for missing fullName', async () => {
    const user = generateTestUser();
    const res = await client.post('/auth/sign-up').send({
      phoneNumber: user.phoneNumber,
      email: user.email,
    });
    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid phone format', async () => {
    const user = generateTestUser();
    const res = await client.post('/auth/sign-up').send({
      ...user,
      phoneNumber: 'invalid-phone',
    });
    expect(res.status).toBe(400);
  });

  it('should return 409 for duplicate phone number', async () => {
    const user = generateTestUser();
    await client.post('/auth/sign-up').send(user);
    const res2 = await client.post('/auth/sign-up').send(user);
    
    expect(res2.status).toBe(409);
  });
});
