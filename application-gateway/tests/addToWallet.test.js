const fs = require('fs');
const path = require('path');

jest.mock('fabric-network', () => ({
  Wallets: {
    newFileSystemWallet: jest.fn().mockResolvedValue({
      put: jest.fn().mockResolvedValue(undefined)
    })
  }
}));

describe('addToWallet', () => {
  it('should add identities to the wallet', async () => {
    const addToWallet = require('../addToWallet');
    await addToWallet.main();
    const walletPath = path.join(__dirname, '..', 'wallet');
    expect(fs.existsSync(walletPath)).toBe(true);
  });
});