import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon, mainnet, arbitrum, base } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'PolyForge',
  projectId: 'polyforge-demo', // WalletConnect project ID - replace for production
  chains: [polygon, mainnet, arbitrum, base],
  ssr: false,
});
