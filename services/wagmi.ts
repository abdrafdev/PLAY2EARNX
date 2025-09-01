import { createConfig, http } from 'wagmi';
import { publicActions } from 'viem';
import type { Chain } from 'viem';
import { injected, walletConnect, coinbaseWallet } from '@wagmi/connectors';
import {
  arbitrum,
  arbitrumSepolia,
  avalancheFuji,
  base,
  baseSepolia,
  bsc,
  bscTestnet,
  gnosis,
  holesky,
  linea,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonMumbai,
  scroll,
  scrollSepolia,
  sepolia,
  zora,
  zoraSepolia,
} from 'wagmi/chains';

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'YOUR_PROJECT_ID';

const avalanche = {
  id: 43_114,
  name: 'Avalanche',
  iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png',
  iconBackground: '#fff',
  nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://api.avax.network/ext/bc/C/rpc'] },
  },
  blockExplorers: {
    default: { name: 'SnowTrace', url: 'https://snowtrace.io' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 11_907_934,
    },
  },
} as const satisfies Chain;

// Configure chains for wagmi
const chains = [
  mainnet,
  base,
  optimism,
  arbitrum,
  polygon,
  avalanche,
  bsc,
  zora,
  linea,
  gnosis,
  scroll,
  ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true'
    ? [
        sepolia,
        holesky,
        arbitrumSepolia,
        avalancheFuji,
        baseSepolia,
        bscTestnet,
        optimismSepolia,
        polygonMumbai,
        scrollSepolia,
        zoraSepolia,
      ]
    : []),
] as const;

// Create transports for each chain
const transports = chains.reduce((acc, chain) => {
  acc[chain.id] = http();
  return acc;
}, {} as Record<number, ReturnType<typeof http>>);

// Configure connectors
const connectors = [
  injected(),
  walletConnect({ 
    projectId,
    showQrModal: false 
  }),
  coinbaseWallet({
    appName: 'Play2EarnX',
  }),
];

export const config = createConfig({
  chains,
  transports,
  connectors,
  ssr: true,
});

export const publicClient = config.getClient().extend(publicActions);
