"use client";

// Force Next.js to skip prerendering this page during build
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AlertCircle, Wallet, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Link from 'next/link';

export default function ConnectWalletPage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  // States
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Handle Mounting to prevent Hydration/Prerender errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. Redirect if not authenticated
  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, authLoading, router, mounted]);

  // 3. Redirect if user already has wallet bound
  useEffect(() => {
    if (mounted && !authLoading && user?.walletAddress && isConnected) {
      redirectToDashboard();
    }
  }, [user, authLoading, isConnected, mounted]);

  // 4. Handle wallet connection and save to DB
  useEffect(() => {
    const saveWalletAddress = async () => {
      if (!mounted || !isConnected || !address || !user || user.walletAddress) return;

      setIsSaving(true);
      setError(null);

      try {
        const response = await fetch("/api/user/wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            walletAddress: address.toLowerCase(),
            userId: user.id,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to save wallet address");

        // Update local session
        const updatedUser = { ...user, walletAddress: address.toLowerCase() };
        localStorage.setItem("invochain_user", JSON.stringify(updatedUser));
        
        redirectToDashboard();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save wallet address");
        setIsSaving(false);
      }
    };

    saveWalletAddress();
  }, [isConnected, address, user, mounted]);

  const redirectToDashboard = () => {
    if (!user) return;
    const routes = { msme: "msme", investor: "investor", bigbuyer: "bigbuyer" };
    router.push(`/dashboard/${routes[user.role as keyof typeof routes]}`);
  };

  // Prevent rendering hooks UI until client-side hydration is complete
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0500]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0500] text-center p-6 relative overflow-hidden">
      
      {/* Background Fire Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/10 blur-[140px] rounded-full" />

      <div className="relative z-10 backdrop-blur-md p-10 rounded-[2rem] border border-white/10 bg-white/[0.02] shadow-2xl max-w-md w-full">
        
        {/* Icon & Title */}
        <div className="mb-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(255,165,0,0.1)]">
            <Wallet className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-3xl font-black mb-2 text-orange-50 drop-shadow-[0_0_15px_rgba(255,165,0,0.4)]">
            Link Wallet
          </h1>
          <p className="text-sm text-orange-100/50 tracking-tight">
            Connect your wallet to CredX to enable on-chain transactions and identity.
          </p>
        </div>

        {/* Error Handling */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* RainbowKit Connect Button Customization */}
        <div className="flex justify-center mb-6">
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted: rainbowMounted }) => {
              const ready = mounted && rainbowMounted;
              const connected = ready && account && chain;

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    'style': { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
                  })}
                  className="w-full"
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <button
                          onClick={openConnectModal}
                          type="button"
                          className="w-full px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold transition-all duration-300 shadow-[0_0_30px_rgba(255,125,32,0.2)]"
                        >
                          Connect Wallet
                        </button>
                      );
                    }
                    return (
                      <div className="flex flex-col gap-3">
                         <div className="px-6 py-3 bg-orange-500/10 border border-orange-500/30 rounded-xl text-orange-200 text-sm font-mono">
                            {account.displayName}
                         </div>
                         {isSaving && (
                            <div className="flex items-center justify-center gap-2 text-orange-400 animate-pulse text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Syncing with CredX...
                            </div>
                         )}
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>

        {/* Secondary Actions */}
        <div className="flex flex-col items-center gap-4">
          {isConnected && !isSaving && (
            <button
              onClick={() => disconnect()}
              className="text-orange-900/80 hover:text-orange-600 text-xs font-semibold uppercase tracking-widest transition-colors underline underline-offset-4"
            >
              Disconnect Wallet
            </button>
          )}
          
          <Link 
            href="/" 
            className="text-orange-100/30 hover:text-orange-100/60 text-xs font-semibold uppercase tracking-widest transition-colors"
          >
            Cancel and Return
          </Link>
        </div>
      </div>

      {/* Subtle floor glow */}
      <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
    </div>
  );
}