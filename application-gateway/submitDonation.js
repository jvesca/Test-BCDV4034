const express = require('express');
const fs = require('fs');
const path = require('path');
const util = require('util');
const { Wallets, Gateway } = require('fabric-network');
const cors = require('cors');

const app = express();
const port = 3000;

// Configure CORS to allow requests from frontend
app.use(cors());

const testNetworkRoot = process.env.GITHUB_WORKSPACE 
    ? path.resolve(process.env.GITHUB_WORKSPACE, 'fabric-samples/test-network')
    : path.resolve(require('os').homedir(), 'fabric-samples/test-network');
const gateway = new Gateway();
let wallet;

async function init() {
    wallet = await Wallets.newFileSystemWallet('./wallet');
}

init();

app.use(express.json());

async function getContract(identityLabel) {
    const orgName = identityLabel.split('@')[1];
    const orgNameWithoutDomain = orgName.split('.')[0];

    let connectionProfile = JSON.parse(fs.readFileSync(
        path.join(testNetworkRoot,
            'organizations/peerOrganizations',
            orgName,
            `/connection-${orgNameWithoutDomain}.json`), 'utf8')
    );

    let connectionOptions = {
        identity: identityLabel,
        wallet: wallet,
        discovery: { enabled: true, asLocalhost: true }
    };

    await gateway.connect(connectionProfile, connectionOptions);
    const network = await gateway.getNetwork('mychannel');
    return network.getContract('water_donation');
}

// Add block listener function
async function addBlockListener() {
    console.log('Adding block listener...');
    const network = await gateway.getNetwork('mychannel');

    // Return a promise that resolves once the block listener is added
    return new Promise((resolve, reject) => {
        const listener = async (blockEvent) => {
            try {
                console.log();
                console.log('-----------------Block listener-----------------');
                // Extract block number from the header
                let blockNumber = blockEvent.blockData.header.number.toNumber();
                console.log(`Block number: ${blockNumber}`);
                console.log(`Block header: ${util.inspect(blockEvent.blockData.header, { showHidden: false, depth: 5 })}`);
                console.log(`Block data: ${util.inspect(blockEvent.blockData.data, { showHidden: false, depth: 5 })}`);
                
                console.log('------------------------------------------------');
                console.log();
                // Resolve with block number
                resolve({ blockNumber: blockNumber });
            } catch (error) {
                reject(error);
            }
        };

        // Add the listener function to block events
        network.addBlockListener(listener, { filtered: false }); // { filtered: false } to receive all blocks
    });
}

app.post('/api/send-donation', async (req, res) => {
    let listener;
    try {
        const { functionName, args } = req.body;
        const identityLabel = req.headers['identitylabel'];
        const contract = await getContract(identityLabel);

        const response = await contract.submitTransaction(functionName, ...args);

        // Call block listener function after submitting transaction
        const { blockNumber } = await addBlockListener();
        
        // Respond with the transaction ID and message
        res.status(200).json({ 
            message: 'Donation submitted successfully',
            blockNumber: blockNumber
        });
    } catch (error) {
        console.error(`Error processing transaction: ${error}`);
        if (error.message.includes('does not exist')) {
            res.status(404).json({ error: `Donation with ID ${donationId} does not exist` });
        } else if (error.message.includes('Unauthorized access')) {
            res.status(403).json({ error: 'You do not have permission to perform this action' });
        } else if (error.message.includes('No valid responses from any peers')) {
            res.status(500).json({ error: 'No valid responses from any peers. Unauthorized access - Org3MSP cannot write' });
        } else {
            res.status(500).json({ error: 'Failed to fetch donation' });
        }
    } finally {
        gateway.disconnect();
        if (listener) {
            listener.disconnect(); // Disconnect the block listener if it was successfully created
        }
    }
});

app.get('/api/query-donation/:donationId', async (req, res) => {
    const { donationId } = req.params;
    try {
        const identityLabel = req.headers['identitylabel'];
        const contract = await getContract(identityLabel);

        const response = await contract.evaluateTransaction('queryDonation', donationId);
        res.status(200).json({ message: 'Query executed successfully', transaction: JSON.parse(response.toString()) });
    } catch (error) {
        console.error(`Error processing transaction: ${error}`);
        if (error.message.includes('does not exist')) {
            res.status(404).json({ error: `Donation with ID ${donationId} does not exist` });
        } else if (error.message.includes('Unauthorized access')) {
            res.status(403).json({ error: 'You do not have permission to perform this action' });
        } else {
            res.status(500).json({ error: 'Failed to fetch donation' });
        }
    } finally {
        gateway.disconnect();
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
