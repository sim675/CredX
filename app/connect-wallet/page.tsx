"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AlertCircle, Wallet, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Link from 'next/link';
import dynamic from 'next/dynamic';

// --- Inner Component (Handles all Web3 Logic) ---
function ConnectWalletContent() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, authLoading, router]);

  // Redirect if user already has wallet bound
  useEffect(() => {
    if (!authLoading && user?.walletAddress && isConnected) {
      redirectToDashboard();
    }
  }, [user, authLoading, isConnected]);

  // Handle wallet connection and save
  useEffect(() => {
    const saveWalletAddress = async () => {
      if (!isConnected || !address || !user || user.walletAddress) return;

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
  }, [isConnected, address, user]);

  const redirectToDashboard = () => {
    if (!user) return;
    const routes = { msme: "msme", investor: "investor", bigbuyer: "bigbuyer" };
    router.push(`/dashboard/${routes[user.role as keyof typeof routes]}`);
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
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
  );
}

// --- Main Export (Build-Safe) ---
/**
 * We use a dynamic import with { ssr: false } to wrap the Web3 content.
 * This completely prevents Next.js from trying to run Wagmi hooks during the static build phase.
 */
const DynamicWalletContent = dynamic(() => Promise.resolve(ConnectWalletContent), {
  ssr: false,
  loading: () => (
    <div className="min-h-[400px] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
    </div>
  )
});

export default function ConnectWalletPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0500] text-center p-6 relative overflow-hidden">
      {/* Background Fire Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/10 blur-[140px] rounded-full" />
      
      {/* The Dynamic Content */}
      <DynamicWalletContent />

      {/* Subtle floor glow */}
      <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
    </div>
  );
}