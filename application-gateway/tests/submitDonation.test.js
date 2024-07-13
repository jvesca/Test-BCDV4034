const request = require('supertest');
const { app } = require('../submitDonation');

describe('submitDonation', () => {
  it('should respond to POST /api/send-donation', async () => {
    const response = await request(app)
      .post('/api/send-donation')
      .send({
        functionName: 'createDonation',
        args: ['DON001', 'Org1', '100', 'Water project']
      })
      .set('identitylabel', 'User1@org1.example.com');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
  });
});