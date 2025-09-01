# Play2EarnX Deployment Guide

This guide will help you deploy the Play2EarnX smart contract and connect it to your frontend application.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MetaMask** or another Web3 wallet
3. **BNB** for gas fees (for BSC deployment)

## Deployment Options

### Option 1: Local Development (Recommended for Testing)

1. **Start a local Hardhat node:**
   ```bash
   npx hardhat node
   ```
   This will start a local blockchain on `http://127.0.0.1:8545` and provide test accounts with ETH.

2. **In a new terminal, deploy the contract:**
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

3. **The contract address will be automatically saved to `contracts/contractAddress.json`**

4. **Import a test account to MetaMask:**
   - Copy one of the private keys from the Hardhat node output
   - In MetaMask, click account icon → Import Account → paste private key
   - Add local network to MetaMask:
     - Network Name: Localhost 8545
     - RPC URL: http://127.0.0.1:8545
     - Chain ID: 31337
     - Currency Symbol: ETH

### Option 2: BSC Testnet Deployment

1. **Get test BNB:**
   - Visit [BSC Testnet Faucet](https://testnet.binance.org/faucet-smart)
   - Enter your wallet address to receive test BNB

2. **Set up your environment:**
   - Copy `.env.example` to `.env`
   - Add your private key (without 0x prefix):
     ```
     PRIVATE_KEY=your_private_key_here
     ```
   ⚠️ **NEVER commit your .env file to version control!**

3. **Deploy to BSC Testnet:**
   ```bash
   npx hardhat run scripts/deploy.js --network bscTestnet
   ```

4. **Add BSC Testnet to MetaMask:**
   - Network Name: BSC Testnet
   - RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545/
   - Chain ID: 97
   - Currency Symbol: BNB
   - Block Explorer: https://testnet.bscscan.com

### Option 3: BSC Mainnet Deployment (Production)

1. **Ensure you have real BNB for gas fees**

2. **Set up your environment:**
   - Add your private key to `.env`:
     ```
     PRIVATE_KEY=your_mainnet_private_key_here
     ```

3. **Deploy to BSC Mainnet:**
   ```bash
   npx hardhat run scripts/deploy.js --network bscMainnet
   ```

4. **Add BSC Mainnet to MetaMask:**
   - Network Name: BSC Mainnet
   - RPC URL: https://bsc-dataseed.binance.org/
   - Chain ID: 56
   - Currency Symbol: BNB
   - Block Explorer: https://bscscan.com

## Post-Deployment Setup

1. **Verify the deployment:**
   - Check `contracts/contractAddress.json` for the deployed contract address
   - The frontend will automatically use this address

2. **Update frontend configuration (if needed):**
   - Update `NEXT_PUBLIC_RPC_URL` in `.env` to match your deployment network
   - For BSC Testnet: `https://data-seed-prebsc-1-s1.binance.org:8545/`
   - For BSC Mainnet: `https://bsc-dataseed.binance.org/`

3. **Seed test data (optional, for local/testnet only):**
   ```bash
   npx hardhat run scripts/seed.js --network localhost
   ```

## Troubleshooting

### "Insufficient funds" error
- Make sure you have enough BNB/ETH in your wallet for gas fees
- For local development, use one of the test accounts provided by Hardhat

### "Contract not deployed" error
- Ensure the deployment script ran successfully
- Check that `contracts/contractAddress.json` contains the correct address
- Verify you're connected to the same network where you deployed

### "Wrong network" error
- Switch your MetaMask to the network where the contract is deployed
- Update `NEXT_PUBLIC_RPC_URL` in `.env` to match the deployment network

### "Transaction failed" error
- Check the gas price settings in `hardhat.config.js`
- Ensure your wallet has sufficient balance
- Try increasing the gas limit for complex transactions

## Security Best Practices

1. **Never commit private keys or .env files to version control**
2. **Use environment variables for sensitive data**
3. **Test thoroughly on testnet before mainnet deployment**
4. **Consider getting your contract audited before mainnet deployment**
5. **Use a hardware wallet for mainnet deployments**

## Contract Verification (Optional)

To verify your contract on BSCScan:

1. **Get an API key from BSCScan:**
   - Register at [BSCScan](https://bscscan.com/register)
   - Go to API Keys and create a new key

2. **Add to .env:**
   ```
   BSCSCAN_API_KEY=your_api_key_here
   ```

3. **Verify the contract:**
   ```bash
   npx hardhat verify --network bscMainnet DEPLOYED_CONTRACT_ADDRESS 5
   ```
   (Replace DEPLOYED_CONTRACT_ADDRESS with your actual contract address, 5 is the tax percentage)

## Next Steps

After successful deployment:

1. **Test the application:**
   - Create a new game
   - Invite players
   - Play the memory game
   - Check results and payouts

2. **Monitor the contract:**
   - Use BSCScan to monitor transactions
   - Check contract balance and activity

3. **Maintain and upgrade:**
   - Keep dependencies updated
   - Monitor for security vulnerabilities
   - Plan for contract upgrades if needed

## Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Review the contract status banner in the app
3. Ensure all prerequisites are met
4. Check that MetaMask is connected to the correct network

Happy deploying! 🚀
