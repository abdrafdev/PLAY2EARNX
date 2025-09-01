const { ethers } = require("hardhat");

async function main() {
  console.log("\n=== Hardhat Local Test Accounts ===\n");
  console.log("These accounts are pre-funded with 10,000 ETH each on your local network:");
  console.log("WARNING: These accounts are publicly known. DO NOT use them on mainnet!\n");

  // Get the test accounts provided by Hardhat
  const accounts = await ethers.getSigners();

  for (let i = 0; i < Math.min(accounts.length, 10); i++) {
    const account = accounts[i];
    const balance = await ethers.provider.getBalance(account.address);
    const balanceInEth = ethers.formatEther(balance);
    
    console.log(`Account #${i}:`);
    console.log(`  Address: ${account.address}`);
    console.log(`  Balance: ${balanceInEth} ETH`);
    
    if (i === 0) {
      console.log(`  Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`);
    } else if (i === 1) {
      console.log(`  Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`);
    } else if (i === 2) {
      console.log(`  Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`);
    }
    console.log();
  }

  console.log("\n=== How to use these accounts ===\n");
  console.log("1. In MetaMask or your wallet:");
  console.log("   - Click on your account icon");
  console.log("   - Select 'Import Account'");
  console.log("   - Choose 'Private Key' type");
  console.log("   - Paste one of the private keys above");
  console.log("   - Click 'Import'\n");
  
  console.log("2. Make sure your wallet is connected to:");
  console.log("   - Network Name: Hardhat Local");
  console.log("   - RPC URL: http://127.0.0.1:8545");
  console.log("   - Chain ID: 31337");
  console.log("   - Currency Symbol: ETH\n");
  
  console.log("3. You'll instantly have 10,000 ETH for testing!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
