'use strict';

const fs = require('fs');
const path = require('path');
const { Wallets } = require('fabric-network');

const testNetworkRoot = process.env.GITHUB_WORKSPACE 
    ? path.resolve(process.env.GITHUB_WORKSPACE, 'fabric-samples/test-network')
    : path.resolve(require('os').homedir(), 'fabric-samples/test-network');

console.log('testNetworkRoot:', testNetworkRoot);

async function main() {
    try {
        const wallet = await Wallets.newFileSystemWallet('./wallet');
        console.log('Wallet path:', path.resolve('./wallet'));
        
        const predefinedOrgs = [
            {
                name: 'org1.example.com',
                mspId: 'Org1MSP',
                users: ['Admin', 'User1']
            }, {
                name: 'org2.example.com',
                mspId: 'Org2MSP',
                users: ['Admin', 'User1']
            }, {
                name: 'org3.example.com',
                mspId: 'Org3MSP',
                users: ['Admin', 'User1']
            }
        ];

        for (const org of predefinedOrgs) {
            const credPath = path.join(testNetworkRoot, '/organizations/peerOrganizations/', org.name, '/users');
            console.log('Checking credPath:', credPath);
            
            for (const user of org.users) {
                const mspFolderPath = path.join(credPath, `${user}@${org.name}`, '/msp');
                console.log('Checking mspFolderPath:', mspFolderPath);
                
                // expecting only one cert file and one key file to be in the directories
                const certFile = path.join(mspFolderPath, '/signcerts/', fs.readdirSync(path.join(mspFolderPath, '/signcerts'))[0]);
                const keyFile = path.join(mspFolderPath, '/keystore/', fs.readdirSync(path.join(mspFolderPath, '/keystore'))[0]);

                console.log('certFile:', certFile);
                console.log('keyFile:', keyFile);

                const cert = fs.readFileSync(certFile).toString();
                const key = fs.readFileSync(keyFile).toString();

                const identity = {
                    credentials: {
                        certificate: cert,
                        privateKey: key,
                    },
                    mspId: org.mspId,
                    type: 'X.509',
                };

                const identityLabel = `${user}@${org.name}`;
                await wallet.put(identityLabel, identity);
                console.log(`Successfully added ${identityLabel} to the wallet`);
            }
        }

        console.log('All identities have been successfully added to the wallet');

    } catch (error) {
        console.log(`Error adding to wallet. ${error}`);
        console.log(error.stack);
    }
}

main().then(() => {
    console.log('Wallet population completed successfully');
}).catch((e) => {
    console.log('Failed to populate wallet:', e);
    console.log(e.stack);
    process.exit(-1);
});