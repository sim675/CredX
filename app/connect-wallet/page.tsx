"use client";

/** * 1. FORCE DYNAMIC: This tells Vercel to skip static generation (prerendering) 
 * for this page, which is what's causing your WagmiProviderNotFoundError.
 */
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
  
  // 2. MOUNTED STATE: Prevents hooks from firing until the browser is ready.
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, authLoading, router, mounted]);

  // Redirect if user already has wallet bound
  useEffect(() => {
    if (mounted && !authLoading && user?.walletAddress && isConnected) {
      redirectToDashboard();
    }
  }, [user, authLoading, isConnected, mounted]);

  // Handle wallet connection and save
  useEffect(() => {
    const saveWalletAddress = async () => {
      // Check mounted to ensure we are in the browser
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

  /**
   * 3. SSR PROTECTION: Return a loader if we aren't mounted yet.
   * This is the "shield" that stops the build-time error.
   */
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/10 blur-[140px] rounded-full" />
      <div className="relative z-10 backdrop-blur-md p-10 rounded-[2rem] border border-white/10 bg-white/[0.02] shadow-2xl max-w-md w-full">
        <div className="mb-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(255,165,0,0.1)]">
            <Wallet className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-3xl font-black mb-2 text-orange-50">Link Wallet</h1>
          <p className="text-sm text-orange-100/50">Connect your wallet to CredX to enable on-chain transactions.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="flex justify-center mb-6">
          <ConnectButton />
        </div>

        <div className="flex flex-col items-center gap-4">
          {isConnected && !isSaving && (
            <button onClick={() => disconnect()} className="text-orange-900/80 hover:text-orange-600 text-xs font-semibold uppercase tracking-widest underline underline-offset-4">
              Disconnect Wallet
            </button>
          )}
          <Link href="/" className="text-orange-100/30 hover:text-orange-100/60 text-xs font-semibold uppercase tracking-widest">
            Cancel and Return
          </Link>
        </div>
      </div>
    </div>
  );
}