const request = require('supertest');
const express = require('express');
const cors = require('cors');

// Mock the database and routes
jest.mock('../models', () => ({
  sequelize: {
    sync: jest.fn().mockResolvedValue()
  }
}));
jest.mock('../routes/donations', () => express.Router());
jest.mock('../routes/registration', () => express.Router());

const app = require('../app');

describe('App', () => {
  it('should use cors middleware', () => {
    expect(app._router.stack.some(layer => layer.name === 'corsMiddleware')).toBe(true);
  });

  it('should use JSON parsing middleware', () => {
    expect(app._router.stack.some(layer => layer.name === 'jsonParser')).toBe(true);
  });

  it('should set up routes', () => {
    expect(app._router.stack.some(layer => layer.regexp.test('/registration'))).toBe(true);
    expect(app._router.stack.some(layer => layer.regexp.test('/donations'))).toBe(true);
  });

  it('should start the server on port 3001', async () => {
    const server = app.listen(3001);
    await request(app).get('/').expect(404); // Assuming no root route, should get 404
    server.close();
  });
});