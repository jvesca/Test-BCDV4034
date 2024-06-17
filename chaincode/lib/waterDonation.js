'use strict';

const { Contract } = require('fabric-contract-api');
const crypto = require('crypto');

const donationObjType = 'Donation';
const allocationObjType = 'SpendAllocation';

const DonationStatus = Object.freeze({Pending: 1, Completed: 2, Cancelled: 3});

class WaterDonation extends Contract {
    async createDonation(ctx, donationId, donorId, recipientId, donationAmount) {
        const amount = parseFloat(donationAmount);
        if (amount < 0) {
            throw new Error(`donation cannot be negative`);
        }

        // Hash the donorID and recipientID
        const donorHash = crypto.createHash('sha256').update(donorId).digest('hex');
        const recipientHash = crypto.createHash('sha256').update(recipientId).digest('hex');

        // Get the current date and time in UTC format
        const dateUTC = new Date().toISOString();

        let donation = {
            donationId: donationId,
            donorId: donorHash,
            recipientId: recipientHash,
            amount: amount,
            status: DonationStatus.Pending, // Initial status when donation is created
            dateUTC: dateUTC
        };

        // private data collection name shared between the donor and the recipient
        const collection = this._composeCollectionName('Org1MSP', 'Org2MSP');
        console.log('collection: ', collection);

        // Store donation in the ledger
        await this._putDonation(ctx, donationObjType, donation, collection);
    }

    async queryDonation(ctx, donationId) {
        const collection = this._composeCollectionName('Org1MSP', 'Org3MSP');
        const compositeKey = ctx.stub.createCompositeKey(donationObjType, [donationId]);
        const donationBytes = await ctx.stub.getPrivateData(collection, compositeKey);
        console.log('donationBytes: ', donationBytes);
        if (!donationBytes || donationBytes.length === 0) {
            throw new Error(`Donation with ID ${donationId} does not exist`);
        }

        return donationBytes.toString();
    }

    async _putDonation(ctx, assetObjType, donation, collection='') {
        const compositeKey = ctx.stub.createCompositeKey(assetObjType, [donation.donationId]);
        
        collection = collection || '';
        if (collection === '') {
            await ctx.stub.putState(compositeKey, Buffer.from(JSON.stringify(donation)));
        } else {
            await ctx.stub.putPrivateData(collection, compositeKey, Buffer.from(JSON.stringify(donation)));
        }
    }

    _composeCollectionName(org1, org3) {
        return [org1, org3].sort().join('-');
    }
}

module.exports = WaterDonation;
