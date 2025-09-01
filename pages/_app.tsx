// Import ethers patch first to prevent api.etherjs.pro errors
import '@/lib/ethers-patch'

import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";
// import '@rainbow-me/rainbowkit/styles.css';
import { ToastContainer } from 'react-toastify'
import '@/styles/global.css'
import 'react-toastify/dist/ReactToastify.css'
import { useEffect, useState } from 'react'
import { Providers } from '@/services/provider'
import type { AppProps } from 'next/app'
import Header from '@/components/Header'
import { Provider } from 'react-redux'
import { store } from '@/store'
import ErrorBoundary from '@/components/ErrorBoundary'
import ContractStatus from '@/components/ContractStatus'

export default function App({ Component, pageProps }: AppProps) {
  const [showChild, setShowChild] = useState<boolean>(false)

  useEffect(() => {
    setShowChild(true)
  }, [])

  if (!showChild || typeof window === 'undefined') {
    return null
  } else {
    return (
      <ErrorBoundary>
        <Providers pageProps={pageProps}>
          <Provider store={store}>
            <div className="bg-[#010922] min-h-screen">
              <Header />
              <ContractStatus />
              <ErrorBoundary>
                <Component {...pageProps} />
              </ErrorBoundary>
              <ToastContainer
                position="bottom-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
              />
            </div>
          </Provider>
        </Providers>
      </ErrorBoundary>
    )
  }
}
