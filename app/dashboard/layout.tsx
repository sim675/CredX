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

// Dynamically import WalletDropdown with SSR disabled
const WalletDropdown = dynamic(
  () => import('@/components/WalletDropdown').then(mod => mod.WalletDropdown),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-10 w-32 rounded-md" />
  }
);

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balanceData, isLoading: isLoadingBalance } = useBalance({
    address,
  });
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [walletMismatch, setWalletMismatch] = useState(false);

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // 🔐 Protect dashboard routes
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/signin");
      return;
    }

    // Redirect to wallet connection if wallet not bound
    if (!isLoading && user && !user.walletAddress) {
      router.push("/connect-wallet");
      return;
    }
  }, [user, isLoading, router]);

  // 🛡️ Wallet consistency guard
  useEffect(() => {
    if (!mounted || !user || !user.walletAddress) return;

    // If wallet is required but not connected, redirect to connect
    if (!isConnected) {
      router.push("/connect-wallet");
      return;
    }

    const userWallet = user.walletAddress.toLowerCase();
    const connectedWallet = address?.toLowerCase();

    if (connectedWallet && userWallet !== connectedWallet) {
      setWalletMismatch(true);
    } else {
      setWalletMismatch(false);
    }
  }, [mounted, user, isConnected, address, router]);

  // ⏳ Loading state
  if (isLoading || !user || !mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  // app/dashboard/layout.tsx

  return (
    // FIX: Replaced Fragment with a div containing overflow-x-hidden to stop horizontal scrollbar
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Background Layers - Keep these at the top */}
      <div className="web3-bg" />
      <div className="web3-grid" />
      <div className="web3-glow" />

      {/* 1. Added style={{ background: 'transparent' }} to SidebarProvider 
        2. Added bg-transparent to SidebarInset
      */}
      <SidebarProvider style={{ background: 'transparent' }}>
        
        {/* Sidebar - Passed a prop to ensure it doesn't paint a solid background */}
        <AppSidebar role={user.role} className="bg-transparent border-r border-white/10" />

        <SidebarInset className="bg-transparent flex flex-col h-full">
          
          {/* Header - Transparent */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 px-4 bg-transparent backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="h-4 mx-2" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {user.role === "msme"
                        ? "MSME Portal - POL"
                        : user.role === "investor"
                        ? "Investor Portal - POL"
                        : "Big Buyer Portal - POL"}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm font-medium">
                {isLoadingBalance ? "Loading..." : `${balanceData ? parseFloat(formatEther(BigInt(balanceData.value))).toFixed(4) : "0.0000"} POL`}
              </div>
              <WalletDropdown />
            </div>
          </header>

          {/* Mismatch Warning */}
          {walletMismatch && (
            <div className="border-b border-destructive/50 bg-destructive/10 px-4 py-3">
              <Alert variant="destructive" className="border-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Wallet Mismatch</AlertTitle>
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    Please connect your registered wallet ({user.walletAddress?.slice(0, 6)}...{user.walletAddress?.slice(-4)}) to continue.
                  </span>
                  <Button variant="outline" size="sm" onClick={() => disconnect()} className="ml-4">
                    Disconnect & Switch
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Main Content Area
            Changed bg-accent/5 to bg-transparent
            Added relative z-10 to ensure content sits above the glow
          */}
          <main className={`flex flex-1 flex-col gap-4 p-4 md:p-8 bg-transparent overflow-auto relative z-10 ${walletMismatch ? "pointer-events-none opacity-50" : ""}`}>
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}