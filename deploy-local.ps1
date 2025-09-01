# PowerShell script to deploy contract to local Hardhat node
Write-Host "Deploying Play2EarnX contract to local network..." -ForegroundColor Green
npx hardhat run scripts/deploy.js --network localhost
Write-Host "Deployment complete! Check contracts/contractAddress.json for the contract address." -ForegroundColor Green
