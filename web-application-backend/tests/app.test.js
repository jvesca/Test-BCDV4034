const request = require('supertest');

// Mock the database
jest.mock('../models', () => ({
  sequelize: {
    sync: jest.fn().mockResolvedValue()
  }
}));

// Mock the routes
jest.mock('../routes/donations', () => jest.fn());
jest.mock('../routes/registration', () => jest.fn());

describe('App', () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    app = require('../app');
  });

  it('should set up routes', () => {
    expect(app._router.stack.some(layer => layer.regexp.test('/registration'))).toBe(true);
    expect(app._router.stack.some(layer => layer.regexp.test('/donations'))).toBe(true);
  });

  it('should use JSON parsing middleware', () => {
    expect(app._router.stack.some(layer => layer.name === 'jsonParser')).toBe(true);
  });

  it('should respond with 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown-route');
    expect(response.status).toBe(404);
  });
});