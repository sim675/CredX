"use client";

import { useState } from "react";
import { ethers } from "ethers";

interface InvoiceProps {
  id: string;
  amount: string;
  msme: string;
  yield: string;
}

export default function InvoiceCard({ id, amount, msme, yield: yieldRate }: InvoiceProps) {
  // Transaction Reliability State
  const [isPending, setIsPending] = useState(false);

  const handleBuy = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");

    try {
      setIsPending(true); // Start "Pending" state

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Replace with your actual contract logic
      console.log(`Initiating purchase for invoice ${id}...`);
      
      // Example call: 
      // const contract = new ethers.Contract(ADDR, ABI, signer);
      // const tx = await contract.buyInvoice(id, { value: ethers.parseEther(amount) });
      // await tx.wait(); // Wait for Polygon confirmation

      alert("Purchase confirmed on-chain!");
    } catch (error) {
      console.error("Transaction failed", error);
    } finally {
      setIsPending(false); // End "Pending" state
    }
  };

  return (
    <div className="border border-zinc-800 bg-zinc-900 p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-gray-400 text-sm">Invoice ID</h3>
          <p className="font-mono text-white">#{id.slice(0, 8)}</p>
        </div>
        <div className="text-right">
          <h3 className="text-gray-400 text-sm">Yield</h3>
          <p className="text-green-400 font-bold">{yieldRate}%</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-gray-400 text-sm">Amount</h3>
        <p className="text-2xl font-bold text-white">{amount} POL</p>
      </div>

      <button
        onClick={handleBuy}
        disabled={isPending}
        className={`w-full py-3 rounded-lg font-bold transition-all ${
          isPending 
            ? "bg-zinc-700 text-zinc-400 cursor-not-allowed" 
            : "bg-blue-600 hover:bg-blue-500 text-white"
        }`}
      >
        {isPending ? "Confirming on Polygon..." : "Invest Now"}
      </button>
    </div>
  );
}