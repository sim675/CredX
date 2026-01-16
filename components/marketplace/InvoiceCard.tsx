"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Invoice, getStatusLabel, getInvoiceAction, InvoiceAction } from "@/lib/invoice";
import { useAuth } from "@/hooks/use-auth";
import { useInvoiceContract } from "@/lib/contracts/useInvoiceContract";

interface InvoiceCardProps {
  invoice: Invoice;
}

export default function InvoiceCard({ invoice }: InvoiceCardProps) {
  const { user } = useAuth();
  const { getWriteContract } = useInvoiceContract();

  const [isPending, setIsPending] = useState(false);
  const [userInvestment, setUserInvestment] = useState<string>("0");

  const statusLabel = getStatusLabel(invoice.status);
  const isExpired = new Date() > invoice.dueDate;

  const walletAddress = user?.walletAddress?.toLowerCase();
  const isBuyer = walletAddress
    ? invoice.buyer.toLowerCase() === walletAddress
    : false;
  const hasInvestment = Number(userInvestment) > 0;

  const action: InvoiceAction = user
    ? getInvoiceAction({
        role: user.role,
        invoice,
        isBuyer,
        hasInvestment,
        isExpired,
      })
    : "NONE";

  useEffect(() => {
    const fetchInvestment = async () => {
      if (!walletAddress) return;

      try {
        const provider = new ethers.JsonRpcProvider(
          process.env.NEXT_PUBLIC_RPC_URL || "https://rpc-amoy.polygon.technology"
        );
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          require("@/lib/contracts/InvoiceMarketplace.json").abi,
          provider
        );
        const raw = await contract.investments(invoice.id, walletAddress);
        setUserInvestment(ethers.formatEther(raw));
      } catch (err) {
        console.error("Failed to fetch user investment", err);
      }
    };

    fetchInvestment();
  }, [invoice.id, walletAddress]);

  const handleAction = async () => {
    if (!user) {
      alert("Please log in and connect your wallet");
      return;
    }

    try {
      setIsPending(true);
      const contract = await getWriteContract();

      if (action === "CAN_CONFIRM") {
        const tx = await contract.confirmInvoice(invoice.id);
        await tx.wait();
        alert("Invoice confirmed");
      } else if (action === "OPEN_FOR_INVESTMENT") {
        // For now, invest full remaining amount. You can later add an input.
        const remaining = Number(invoice.amount) - Number(invoice.fundedAmount);
        const value = ethers.parseEther(remaining.toString());
        const tx = await contract.investInInvoice(invoice.id, { value });
        await tx.wait();
        alert("Investment successful");
      } else if (action === "READY_TO_CLAIM_REPAYMENT") {
        const tx = await contract.claimRepayment(invoice.id);
        await tx.wait();
        alert("Repayment claimed");
      } else if (action === "READY_TO_CLAIM_REFUND") {
        const tx = await contract.claimRefund(invoice.id);
        await tx.wait();
        alert("Refund claimed");
      }
    } catch (error) {
      console.error("Transaction failed", error);
      alert("Transaction failed. Check console for details.");
    } finally {
      setIsPending(false);
    }
  };

  const getStatusColorClasses = () => {
    switch (statusLabel) {
      case "PendingBuyer":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "Fundraising":
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
      case "Funded":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40";
      case "Repaid":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "Defaulted":
        return "bg-red-500/20 text-red-300 border-red-500/40";
      default:
        return "bg-zinc-700 text-zinc-200 border-zinc-600";
    }
  };

  const renderActionLabel = () => {
    if (action === "CAN_CONFIRM") return "Confirm Invoice";
    if (action === "OPEN_FOR_INVESTMENT") return "Invest";
    if (action === "READY_TO_CLAIM_REPAYMENT") return "Claim Repayment";
    if (action === "READY_TO_CLAIM_REFUND") return "Claim Refund";
    if (action === "WAITING_FOR_CONFIRMATION") return "Waiting for Buyer";
    return "No Action Available";
  };

  const isActionDisabled =
    action === "NONE" || action === "WAITING_FOR_CONFIRMATION" || isPending;

  return (
    <div className="border border-zinc-800 bg-zinc-900 p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-gray-400 text-sm">Invoice ID</h3>
          <p className="font-mono text-white">#{invoice.id}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColorClasses()}`}
          >
            {statusLabel}
          </span>
          <div className="text-right">
            <h3 className="text-gray-400 text-xs">Yield</h3>
            <p className="text-green-400 font-bold text-sm">{invoice.interestRate}%</p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-gray-400 text-xs">Amount</h3>
          <p className="text-xl font-bold text-white">{invoice.amount} POL</p>
        </div>
        <div className="text-right">
          <h3 className="text-gray-400 text-xs">Funded</h3>
          <p className="text-sm font-mono text-gray-200">
            {invoice.fundedAmount} / {invoice.amount} POL
          </p>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center text-xs text-gray-400">
        <span>MSME: {invoice.msme.slice(0, 6)}...{invoice.msme.slice(-4)}</span>
        <span>
          Due: {invoice.dueDate.toLocaleDateString()} {isExpired && "(Expired)"}
        </span>
      </div>

      <button
        onClick={handleAction}
        disabled={isActionDisabled}
        className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${
          isActionDisabled
            ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-500 text-white"
        }`}
      >
        {isPending ? "Processing..." : renderActionLabel()}
      </button>
    </div>
  );
}