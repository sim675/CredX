import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { http } from 'wagmi';

// Use the exact variable name you added to Vercel
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

if (!projectId) {
  console.warn("Warning: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not defined");
}

export const config = getDefaultConfig({
  appName: 'CredX Invoice Protocol',
  projectId: projectId, 
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
  ssr: true, // This helps prevent hydration errors in Next.js
});