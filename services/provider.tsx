'use client'

import * as React from 'react'
import {SessionProvider} from 'next-auth/react'
import {Session} from 'next-auth'
import {WagmiProvider} from "wagmi";
import {config} from "@/services/wagmi";
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react'

// Get projectId from environment variable
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

// Create Web3Modal instance
if (projectId) {
  createWeb3Modal({
    wagmiConfig: config,
    projectId,
    enableAnalytics: false,
    enableOnramp: false,
    themeMode: 'dark',
    themeVariables: {
      '--w3m-accent': '#3b82f6', // Blue color to match the app theme
      '--w3m-border-radius-master': '8px',
    },
  })
}

export function Providers({ children, pageProps }: {
  children: React.ReactNode
  pageProps: {
    session?: Session
  }
}) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  const queryClient = new QueryClient();

  return (
      <SessionProvider refetchInterval={0} session={pageProps.session}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            {mounted && children}
          </QueryClientProvider>
        </WagmiProvider>
      </SessionProvider>
  )
}
