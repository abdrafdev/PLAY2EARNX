import { ethers } from 'ethers'

/**
 * Check if a contract is deployed at the given address
 * @param address The contract address to check
 * @param provider The ethers provider to use
 * @returns true if contract is deployed, false otherwise
 */
export async function isContractDeployed(
  address: string,
  provider: ethers.Provider
): Promise<boolean> {
  try {
    const code = await provider.getCode(address)
    // If code is '0x' or '0x0', the contract is not deployed
    return code !== '0x' && code !== '0x0'
  } catch (error) {
    console.error('Error checking contract deployment:', error)
    return false
  }
}

/**
 * Get network information
 * @param provider The ethers provider to use
 * @returns Network information including chainId and name
 */
export async function getNetworkInfo(provider: ethers.Provider) {
  try {
    const network = await provider.getNetwork()
    return {
      chainId: Number(network.chainId),
      name: network.name || 'unknown'
    }
  } catch (error) {
    console.error('Error getting network info:', error)
    return {
      chainId: 0,
      name: 'unknown'
    }
  }
}

/**
 * Get the expected network from environment
 * @returns Expected network configuration
 */
export function getExpectedNetwork() {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545'
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID
  const networkName = process.env.NEXT_PUBLIC_NETWORK_NAME
  
  // First check if we have explicit env vars for network
  if (chainId && networkName) {
    return { chainId: parseInt(chainId), name: networkName }
  }
  
  // Detect network from RPC URL
  if (rpcUrl.includes('localhost') || rpcUrl.includes('127.0.0.1') || rpcUrl.includes(':8545')) {
    return { chainId: 31337, name: 'Localhost' }
  }
  
  if (rpcUrl.includes('binance') || rpcUrl.includes('bsc')) {
    if (rpcUrl.includes('test')) {
      return { chainId: 97, name: 'BSC Testnet' }
    }
    return { chainId: 56, name: 'BSC Mainnet' }
  }
  
  if (rpcUrl.includes('polygon')) {
    if (rpcUrl.includes('mumbai')) {
      return { chainId: 80001, name: 'Polygon Mumbai' }
    }
    return { chainId: 137, name: 'Polygon Mainnet' }
  }
  
  // Default to localhost if no other match
  return { chainId: 31337, name: 'Localhost' }
}

/**
 * Validate contract deployment and network
 * @param contractAddress The contract address to validate
 * @param provider The ethers provider to use
 * @returns Validation result with details
 */
export async function validateContractDeployment(
  contractAddress: string,
  provider: ethers.Provider
) {
  const result = {
    isDeployed: false,
    isCorrectNetwork: false,
    networkInfo: { chainId: 0, name: 'unknown' },
    expectedNetwork: getExpectedNetwork(),
    message: ''
  }
  
  try {
    // Check if contract is deployed
    result.isDeployed = await isContractDeployed(contractAddress, provider)
    
    // Get current network info
    result.networkInfo = await getNetworkInfo(provider)
    
    // Check if we're on the correct network
    result.isCorrectNetwork = result.networkInfo.chainId === result.expectedNetwork.chainId
    
    // Generate message
    if (!result.isDeployed) {
      result.message = `Contract not deployed at ${contractAddress} on ${result.networkInfo.name}`
    } else if (!result.isCorrectNetwork) {
      result.message = `Wrong network. Expected ${result.expectedNetwork.name} but connected to ${result.networkInfo.name}`
    } else {
      result.message = 'Contract deployed and network correct'
    }
    
    return result
  } catch (error) {
    result.message = `Error validating contract: ${error}`
    return result
  }
}
