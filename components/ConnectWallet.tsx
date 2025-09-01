import React from 'react'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useAccount, useDisconnect } from 'wagmi'
import { truncate } from '@/utils/helper'
import Image from 'next/image'

const ConnectWallet: React.FC = () => {
  const { open } = useWeb3Modal()
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()

  const handleConnect = () => {
    open()
  }

  const handleDisconnect = () => {
    disconnect()
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        {chain && (
          <button
            onClick={() => open({ view: 'Networks' })}
            className="flex items-center gap-2 bg-transparent border border-blue-700 hover:bg-blue-800
              py-2 px-4 text-blue-700 hover:text-white rounded-full
              transition duration-300 ease-in-out text-sm"
          >
            {chain.name}
          </button>
        )}
        <button
          onClick={() => open({ view: 'Account' })}
          className="bg-transparent border border-blue-700 hover:bg-blue-800
            py-2 px-6 text-blue-700 hover:text-white rounded-full
            transition duration-300 ease-in-out"
        >
          {truncate({
            text: address,
            startChars: 6,
            endChars: 4,
            maxLength: 13,
          })}
        </button>
      </div>
    )
  }

  return (
    <button
      className="bg-transparent border border-blue-700 hover:bg-blue-800
        py-2 px-6 text-blue-700 hover:text-white rounded-full
        transition duration-300 ease-in-out"
      onClick={handleConnect}
    >
      Connect Wallet
    </button>
  )
}

export default ConnectWallet
