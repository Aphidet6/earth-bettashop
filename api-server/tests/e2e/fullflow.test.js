const request = require('supertest');

// This E2E test requires a running stack (postgres + mongo + api)
// It exercises register -> login -> create product -> place order flow (happy path)

describe('E2E full flow (smoke)', () => {
  const base = 'http://localhost:4000';
  let token;
  test('register -> login -> create product -> create order', async () => {
    // Quick availability check
    const health = await request(base).get('/api/health');
    if (health.status !== 200) {
      console.warn('External API not available at', base, '- skipping E2E full flow test');
      return;
    }
    // register
    await request(base).post('/api/auth/register').send({ username: 'e2euser@example.com', password: 'password123' }).expect(200);
    // login
    const login = await request(base).post('/api/auth/login').send({ username: 'e2euser@example.com', password: 'password123' }).expect(200);
    token = login.body.data.token;
    // create product (this user is customer so should be forbidden)
    await request(base).post('/api/products').set('Authorization', `Bearer ${token}`).send({ name: 'E2E Item', price: 5.0, stock_quantity: 10 }).expect(403);
    // place order (should succeed)
    const order = await request(base).post('/api/orders').set('Authorization', `Bearer ${token}`).send({ items: [{ product_id: 1, qty: 1, price: 1.0 }] }).expect(200);
    expect(order.body.success).toBe(true);
  }, 20000);
});
