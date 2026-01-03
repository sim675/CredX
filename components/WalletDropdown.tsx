"use client";

import { useState } from "react";
import { connectWallet } from "@/hooks/useWallet";
import { AMOY_CHAIN_ID, AMOY_PARAMS } from "@/lib/contracts/network";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function WalletDropdown() {
  const [address, setAddress] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);

  // 🔹 Connect wallet + detect network
  const handleConnect = async () => {
    const result = await connectWallet();

    if (result?.address && window.ethereum) {
      setAddress(result.address);

      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      setIsCorrectNetwork(chainId === AMOY_CHAIN_ID);
    }
  };

  // 🔹 Switch to Polygon Amoy
  const switchToAmoy = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: AMOY_CHAIN_ID }],
      });

      setIsCorrectNetwork(true);
      setOpen(false);
    } catch (err: any) {
      // If Amoy not added, add it
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [AMOY_PARAMS],
        });

        setIsCorrectNetwork(true);
        setOpen(false);
      }
    }
  };

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    alert("Wallet address copied");
    setOpen(false);
  };

  const viewOnExplorer = () => {
    if (!address) return;
    window.open(
      `https://amoy.polygonscan.com/address/${address}`,
      "_blank"
    );
    setOpen(false);
  };

  const disconnect = () => {
    setAddress(null);
    setOpen(false);
  };

  // 🔹 Not connected yet
  if (!address) {
    return (
      <button
        onClick={handleConnect}
        className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-black/80"
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="relative">
      {/* Wallet button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
      >
        <span>{shortAddress}</span>
        <span className="text-xs">▼</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-md border bg-background shadow-lg">
          <button
            onClick={copyAddress}
            className="block w-full px-4 py-2 text-left text-sm hover:bg-muted"
          >
            Copy address
          </button>

          <button
            onClick={viewOnExplorer}
            className="block w-full px-4 py-2 text-left text-sm hover:bg-muted"
          >
            View on Explorer
          </button>

          {!isCorrectNetwork && (
            <button
              onClick={switchToAmoy}
              className="block w-full px-4 py-2 text-left text-sm text-yellow-600 hover:bg-muted"
            >
              Switch to Polygon Amoy
            </button>
          )}

          <button
            onClick={disconnect}
            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-muted"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
