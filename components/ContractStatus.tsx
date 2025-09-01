import React, { useEffect, useState } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { useChainId } from 'wagmi'
import { ethers } from 'ethers'
import { isContractDeployed, getExpectedNetwork } from '@/utils/contractHelper'
import address from '@/contracts/contractAddress.json'
import { FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa'

const ContractStatus: React.FC = () => {
  const { address: userAddress, isConnected } = useAccount()
  const chainId = useChainId()
  const { data: balance } = useBalance({ address: userAddress })
  const [contractDeployed, setContractDeployed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [showBanner, setShowBanner] = useState(true)

  useEffect(() => {
    checkContractStatus()
  }, [chainId, isConnected])

  const checkContractStatus = async () => {
    if (!isConnected || !window.ethereum) {
      setChecking(false)
      return
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const isDeployed = await isContractDeployed(address.playToEarnXContract, provider)
      setContractDeployed(isDeployed)
    } catch (error) {
      console.error('Error checking contract status:', error)
      setContractDeployed(false)
    } finally {
      setChecking(false)
    }
  }

  const expectedNetwork = getExpectedNetwork()
  const isCorrectNetwork = chainId === expectedNetwork.chainId
  const hasBalance = balance && parseFloat(balance.formatted) > 0

  // Don't show if everything is fine
  if (contractDeployed && isCorrectNetwork && hasBalance && !checking) {
    return null
  }

  // Don't show if wallet not connected
  if (!isConnected) {
    return null
  }

  if (!showBanner) {
    return null
  }

  return (
    <div className="fixed top-20 left-0 right-0 z-40 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-yellow-900/90 backdrop-blur-sm border border-yellow-700 rounded-lg shadow-xl p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <FaExclamationTriangle className="text-yellow-400 mt-1 flex-shrink-0" size={20} />
              <div className="space-y-2">
                <h3 className="text-yellow-100 font-semibold">Setup Required</h3>
                <div className="space-y-1 text-sm text-yellow-200">
                  {!contractDeployed && (
                    <div className="flex items-center space-x-2">
                      <span className="text-red-400">•</span>
                      <span>Smart contract not deployed at {address.playToEarnXContract.slice(0, 6)}...{address.playToEarnXContract.slice(-4)}</span>
                    </div>
                  )}
                  {!isCorrectNetwork && (
                    <div className="flex items-center space-x-2">
                      <span className="text-red-400">•</span>
                      <span>Wrong network: Please switch to {expectedNetwork.name}</span>
                    </div>
                  )}
                  {!hasBalance && (
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-400">•</span>
                      <span>No balance: You need ETH to pay for transactions</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-3 p-3 bg-black/30 rounded-lg">
                  <p className="text-xs text-yellow-300 mb-2">
                    <FaInfoCircle className="inline mr-1" />
                    Quick Setup Guide:
                  </p>
                  <ol className="text-xs text-yellow-200 space-y-1 ml-4">
                    <li>1. Deploy contracts: <code className="bg-black/50 px-1 rounded">yarn deploy</code></li>
                    <li>2. Update contract address in <code className="bg-black/50 px-1 rounded">contracts/contractAddress.json</code></li>
                    <li>3. Get test ETH from a faucet for {expectedNetwork.name}</li>
                    <li>4. Refresh the page</li>
                  </ol>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="text-yellow-400 hover:text-yellow-300 text-xl leading-none ml-4"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContractStatus
