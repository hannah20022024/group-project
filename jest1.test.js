const request = require('supertest');
const app = require('../app'); // 👈 Your Express app
const db = require('../db');   // 👈 Your DB connection (mockable)

jest.mock('../db'); // 👈 Mock the db.execute function

describe('GET /api/cashbalance', () => {
  it('should return cash balance successfully', async () => {
    // Mock the DB response
    db.execute.mockResolvedValueOnce([[{ amount: 1500 }]]);

    const res = await request(app).get('/api/cashbalance');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ cashBalance: 1500 });
  });

  it('should return 404 if no data found', async () => {
    db.execute.mockResolvedValueOnce([[]]);

    const res = await request(app).get('/api/cashbalance');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Cash balance not found' });
  });

  it('should return 500 if DB throws error', async () => {
    db.execute.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/cashbalance');

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Internal server error' });
  });
});
