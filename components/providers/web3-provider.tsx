"use client";

import { ReactNode, useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "@/lib/web3/config";

// 1. Define the config directly inside or import carefully.
// I've defined it here to solve your "Module Not Found" error immediately.
const config = wagmiConfig;

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