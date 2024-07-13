const assert = require('assert');
const axios = require('axios');
const { execSync } = require('child_process');
const app = require('../submitDonation');

let server;

before(async function() {
    this.timeout(10000);
    server = app.listen(3001, () => console.log('Test server running on port 3001'));
    await new Promise(resolve => setTimeout(resolve, 2000));
});

describe('Unit Tests', function() {
    it('should add to wallet successfully', async function() {
        const output = execSync('node addToWallet.js', { cwd: '../' }).toString();
        assert(output.includes('Wallet population completed successfully'));
    });
});

describe('Integration Tests', function() {
    it('should not allow Org3 to create a donation', async function() {
        try {
            await axios.post('http://localhost:3000/api/send-donation', {
                functionName: 'createDonation',
                args: ['don3', '10ABC', '888', '88000']
            }, {
                headers: { 'identitylabel': 'User1@org3.example.com' }
            });
        } catch (error) {
            assert.strictEqual(error.response.status, 403);
            assert.strictEqual(error.response.data.error, 'You do not have permission to perform this action');
        }
    });

    it('should allow Org1 to create a donation', async function() {
        const response = await axios.post('http://localhost:3000/api/send-donation', {
            functionName: 'createDonation',
            args: ['don3', '10ABC', '888', '88000']
        }, {
            headers: { 'identitylabel': 'User1@org1.example.com' }
        });
        assert.strictEqual(response.status, 200);
        assert(response.data.message.includes('Transaction submitted successfully'));
        assert('blockNumber' in response.data);
    });

    it('should query donation successfully', async function() {
        const response = await axios.get('http://localhost:3000/api/query-donation/don3', {
            headers: { 'identitylabel': 'User1@org1.example.com' }
        });
        assert.strictEqual(response.status, 200);
        assert(response.data.message.includes('Query executed successfully'));
        assert.deepStrictEqual(response.data.transaction, {
            amount: 88000,
            dateUTC: response.data.transaction.dateUTC, // This will be different each time
            donationId: 'don3',
            donorId: '32544c7be36fe88a3ee1a9507229a401a36f926f7d8d536a5ce973a11cd27b2d',
            recipientId: '5e968ce47ce4a17e3823c29332a39d049a8d0afb08d157eb6224625f92671a51',
            status: 2
        });
    });
});

after(function() {
    if (server) server.close();
});