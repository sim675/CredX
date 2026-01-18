import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { http } from 'wagmi';

export const config = getDefaultConfig({
  appName: 'CredX Invoice Protocol',
  // Get your Project ID at https://cloud.walletconnect.com
  projectId: '8e0a821ee5bd57d2092b3dceffb38d08', 
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(), // Uses default public RPC, or add a private one like Alchemy
  },
  ssr: true, 
});