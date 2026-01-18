"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import { useAccount, useDisconnect, useBalance } from "wagmi";
import { formatEther } from "viem";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/sidebar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

// Dynamically import WalletDropdown with SSR disabled
const WalletDropdown = dynamic(
  () => import('@/components/WalletDropdown').then(mod => mod.WalletDropdown),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-10 w-32 rounded-md" />
  }
);

/**
 * INNER COMPONENT: This component is safely nested inside the Web3Provider.
 * It handles all Wagmi-related hooks.
 */
function DashboardContent({ 
  user, 
  children 
}: { 
  user: any; 
  children: React.ReactNode 
}) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balanceData, isLoading: isLoadingBalance } = useBalance({
    address,
  });

  const [walletMismatch, setWalletMismatch] = useState(false);

  // 🛡️ Wallet Guard Logic
  useEffect(() => {
    if (!user || !user.walletAddress || !isConnected) return;

    const userWallet = user.walletAddress.toLowerCase();
    const connectedWallet = address?.toLowerCase();

    if (connectedWallet && userWallet !== connectedWallet) {
      setWalletMismatch(true);
    } else {
      setWalletMismatch(false);
    }
  }, [user, isConnected, address]);

  const displayBalance = () => {
    if (isLoadingBalance || !balanceData) return "0.0000";
    const ethString = formatEther(balanceData.value);
    const [integers, decimals] = ethString.split(".");
    return decimals ? `${integers}.${decimals.slice(0, 4)}` : integers;
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#020817]">
      <div className="web3-bg" />
      <div className="web3-grid opacity-20" />
      <div className="web3-glow" />

      <SidebarProvider style={{ background: 'transparent' }} className="h-full w-full">
        <AppSidebar role={user.role} className="bg-transparent border-r border-white/10" />

        <SidebarInset className="bg-transparent flex flex-col h-full overflow-hidden">
          <header className="flex-none flex h-16 shrink-0 items-center justify-between border-b border-white/5 px-4 bg-transparent backdrop-blur-md z-20">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="h-4 mx-2 bg-white/10" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-white/90">
                      {user.role === "msme" ? "MSME Portal" : user.role === "investor" ? "Investor Portal" : "Buyer Portal"} — POL
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex items-center gap-4">
              <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-emerald-400">
                {displayBalance()} POL
              </div>
              <WalletDropdown />
            </div>
          </header>

          {walletMismatch && (
            <div className="flex-none border-b border-destructive/50 bg-destructive/10 px-4 py-3 z-20">
              <Alert variant="destructive" className="border-destructive bg-transparent">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Wallet Mismatch</AlertTitle>
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    Connect: {user.walletAddress?.slice(0, 6)}...{user.walletAddress?.slice(-4)}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => disconnect()} className="ml-4 border-destructive text-destructive hover:bg-destructive hover:text-white">
                    Disconnect
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          <main className={`flex-1 flex flex-col p-4 md:p-8 overflow-y-auto relative z-10 transition-opacity duration-300 ${walletMismatch ? "pointer-events-none opacity-30 grayscale" : ""}`}>
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

/**
 * MAIN EXPORT: This component handles Auth and Mounting.
 * It DOES NOT call Wagmi hooks directly.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auth Protection
  useEffect(() => {
    if (mounted && !isAuthLoading && !user) {
      router.push("/auth/signin");
    }
  }, [mounted, user, isAuthLoading, router]);

  // Loading state
  if (!mounted || isAuthLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#020817]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-muted-foreground animate-pulse font-mono text-sm">Securing Dashboard...</p>
        </div>
      </div>
    );
  }

  // Once we are mounted and authed, we render the Content component
  // which can safely use Wagmi hooks.
  return <DashboardContent user={user}>{children}</DashboardContent>;
}