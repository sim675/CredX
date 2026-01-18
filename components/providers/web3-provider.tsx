"use client";

import { ReactNode, useEffect, useState } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, polygon, polygonAmoy } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";

// 1. Define the config directly inside or import carefully.
// I've defined it here to solve your "Module Not Found" error immediately.
const config = getDefaultConfig({
  appName: 'InvoChain',
  projectId: 'YOUR_PROJECT_ID', // Replace with your WalletConnect ID
  chains: [mainnet, polygon, polygonAmoy],
  ssr: true, // This helps with Next.js hydration
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [polygonAmoy.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // 2. Fix the Hydration Error: 
  // Wait until the component is mounted on the client before rendering Wagmi
  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR (Server Side Rendering), we render the children without the providers
  // to ensure the HTML matches exactly on server and client.
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}