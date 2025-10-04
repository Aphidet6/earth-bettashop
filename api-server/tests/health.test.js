const request = require('supertest');
const app = require('../src/index');

describe('Health endpoint', () => {
  it('should return ok true', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
