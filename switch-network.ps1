# PowerShell script to switch between different networks
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("local", "bsc-testnet", "bsc-mainnet")]
    [string]$Network = "local"
)

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "   Network Configuration Tool" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Define network configurations
$networks = @{
    "local" = @{
        "file" = ".env.local"
        "name" = "Local Development"
        "chainId" = "31337"
        "rpc" = "http://127.0.0.1:8545"
    }
    "bsc-testnet" = @{
        "file" = ".env.bsc-testnet"
        "name" = "BSC Testnet"
        "chainId" = "97"
        "rpc" = "https://data-seed-prebsc-1-s1.binance.org:8545/"
    }
    "bsc-mainnet" = @{
        "file" = ".env.bsc-mainnet"
        "name" = "BSC Mainnet"
        "chainId" = "56"
        "rpc" = "https://bsc-dataseed.binance.org/"
    }
}

# Get the selected network configuration
$config = $networks[$Network]

if (-not $config) {
    Write-Host "Invalid network selection!" -ForegroundColor Red
    exit 1
}

# Backup current .env
if (Test-Path ".env") {
    Copy-Item ".env" ".env.backup" -Force
    Write-Host "Current .env backed up to .env.backup" -ForegroundColor Yellow
}

# Copy the selected network configuration
if (Test-Path $config.file) {
    Copy-Item $config.file ".env" -Force
    Write-Host "Switched to $($config.name) configuration" -ForegroundColor Green
    Write-Host "`nNetwork Details:" -ForegroundColor Yellow
    Write-Host "  - Network: $($config.name)" -ForegroundColor White
    Write-Host "  - Chain ID: $($config.chainId)" -ForegroundColor White
    Write-Host "  - RPC URL: $($config.rpc)" -ForegroundColor White
} else {
    Write-Host "Configuration file $($config.file) not found!" -ForegroundColor Red
    exit 1
}

# Additional instructions based on network
Write-Host "`nNext Steps:" -ForegroundColor Yellow

switch ($Network) {
    "local" {
        Write-Host "  1. Make sure Hardhat node is running: npx hardhat node" -ForegroundColor White
        Write-Host "  2. Deploy contract: npx hardhat run scripts/deploy.js --network localhost" -ForegroundColor White
        Write-Host "  3. Import test account to MetaMask (see start-all.ps1 for details)" -ForegroundColor White
    }
    "bsc-testnet" {
        Write-Host "  1. Get test BNB from: https://testnet.binance.org/faucet-smart" -ForegroundColor White
        Write-Host "  2. Deploy contract: npx hardhat run scripts/deploy.js --network bscTestnet" -ForegroundColor White
        Write-Host "  3. Add BSC Testnet to MetaMask (Chain ID: 97)" -ForegroundColor White
    }
    "bsc-mainnet" {
        Write-Host "  1. Ensure you have real BNB for gas fees" -ForegroundColor White
        Write-Host "  2. Deploy contract: npx hardhat run scripts/deploy.js --network bscMainnet" -ForegroundColor White
        Write-Host "  3. Add BSC Mainnet to MetaMask (Chain ID: 56)" -ForegroundColor White
        Write-Host "  WARNING: This uses real money! Be careful!" -ForegroundColor Red
    }
}

Write-Host "`nRestart the Next.js app to apply changes:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
