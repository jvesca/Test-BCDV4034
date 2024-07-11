'use strict';

const { Contract } = require('fabric-contract-api');
const crypto = require('crypto');

const donationObjType = 'Donation';
// const allocationObjType = 'SpendAllocation'; //eslint-disable-line no-used-vars

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
            status: DonationStatus.Completed,
            dateUTC: dateUTC
        };

        // private data collection name shared between Org1MSP and Org2MSP (write access) and Org3MSP (read access)
        //const collection = this.composeCollectionName(['Org1MSP', 'Org2MSP']);
        const collection = this.getCollection(ctx, true); // Allow write access for Org1MSP and Org2MSP only
        console.log('collection: ', collection);

        // Store donation in the ledger
        await this.putDonation(ctx, donationObjType, donation, collection);
    }

    async queryDonation(ctx, donationId) {
        const collection = this.getCollection(ctx, false); // Allow read access for Org1MSP, Org2MSP, and Org3MSP
        const compositeKey = ctx.stub.createCompositeKey(donationObjType, [donationId]);
        const donationBytes = await ctx.stub.getPrivateData(collection, compositeKey);
        console.log('donationBytes: ', donationBytes);
        if (!donationBytes || donationBytes.length === 0) {
            throw new Error(`Donation with ID ${donationId} does not exist`);
        }

        return donationBytes.toString();
    }

    async putDonation(ctx, assetObjType, donation, collection='') {
        const compositeKey = ctx.stub.createCompositeKey(assetObjType, [donation.donationId]);
        
        collection = collection || '';
        if (collection === '') {
            await ctx.stub.putState(compositeKey, Buffer.from(JSON.stringify(donation)));
        } else {
            await ctx.stub.putPrivateData(collection, compositeKey, Buffer.from(JSON.stringify(donation)));
        }
    }

    async emitEvent(ctx, name, payload) {
        ctx.stub.setEvent(name, Buffer.from(payload));
    }

    composeCollectionName(orgs) {
        return orgs.sort().join('-');
    }

    getCollection(ctx, allowWrite) {
        const mspID = ctx.clientIdentity.getMSPID();
        if (mspID === 'Org1MSP' || mspID === 'Org2MSP') {
            return this.composeCollectionName(['Org1MSP', 'Org2MSP']);
        } else if (mspID === 'Org3MSP') {
            if (allowWrite) {
                throw new Error('Unauthorized access - Org3MSP cannot write');
            }
            return this.composeCollectionName(['Org1MSP', 'Org3MSP']);
        } else {
            throw new Error('Unauthorized access');
        }
    }
}

module.exports = WaterDonation;
