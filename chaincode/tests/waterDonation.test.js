const WaterDonation = require('../lib/waterDonation');

describe('WaterDonation', () => {
    it('should have a function named donateWater', () => {
        expect(typeof WaterDonation.prototype.donateWater).toBe('function');
    });

    
});
