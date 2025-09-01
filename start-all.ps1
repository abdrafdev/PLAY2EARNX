# PowerShell script to start the entire Play2EarnX application
Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "   Play2EarnX - Complete Setup" -ForegroundColor Cyan  
Write-Host "======================================`n" -ForegroundColor Cyan

# Check if npm is installed
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "npm is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Step 1: Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Step 2: Kill any existing node processes
Write-Host "`nCleaning up existing processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Step 3: Start Hardhat node
Write-Host "`nStarting local blockchain..." -ForegroundColor Green
Start-Process powershell -ArgumentList "npx hardhat node" -WindowStyle Minimized
Write-Host "Waiting for blockchain to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 4: Deploy smart contract
Write-Host "Deploying smart contract..." -ForegroundColor Green
npx hardhat run scripts/deploy.js --network localhost

# Step 5: Seed test data (optional)
$seed = Read-Host "`nDo you want to seed test data? (y/n)"
if ($seed -eq 'y') {
    Write-Host "Seeding test data..." -ForegroundColor Green
    npx hardhat run scripts/seed.js --network localhost
}

# Step 6: Start Next.js application
Write-Host "`nStarting Next.js application..." -ForegroundColor Green
Start-Process powershell -ArgumentList "npm run dev" -WindowStyle Minimized
Start-Sleep -Seconds 8

# Step 7: Open browser
Write-Host "`nOpening Play2EarnX in browser..." -ForegroundColor Magenta
Start-Process "http://localhost:3000"

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "   Setup Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "`nImportant Information:" -ForegroundColor Yellow
Write-Host "   - Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   - Blockchain: http://localhost:8545" -ForegroundColor White
Write-Host "   - Contract deployed and ready!" -ForegroundColor White
Write-Host "`nTest Accounts (with 10000 ETH each):" -ForegroundColor Yellow
Write-Host "   Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" -ForegroundColor White
Write-Host "   Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" -ForegroundColor Gray
Write-Host "`nQuick Setup in MetaMask:" -ForegroundColor Yellow
Write-Host "   1. Add Network: Localhost 8545" -ForegroundColor White
Write-Host "   2. RPC URL: http://localhost:8545" -ForegroundColor White
Write-Host "   3. Chain ID: 31337" -ForegroundColor White
Write-Host "   4. Import the test account above" -ForegroundColor White
Write-Host "`nTo stop all services:" -ForegroundColor Red
Write-Host '   Run: Get-Process node | Stop-Process -Force' -ForegroundColor White
Write-Host ""
