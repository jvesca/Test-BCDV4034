const WaterDonation = require('../lib/waterDonation');

describe('WaterDonation', () => {
    it('should have a function named createDonation', () => {
        const waterDonationInstance = new WaterDonation();
        expect(typeof waterDonationInstance.createDonation).toBe('function');
    });

    it('should have a function named queryDonation', () => {
        const waterDonationInstance = new WaterDonation();
        expect(typeof waterDonationInstance.queryDonation).toBe('function');
    });

    
});
