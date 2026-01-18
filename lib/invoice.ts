// lib/invoice.ts
import { ethers } from "ethers";
import InvoiceMarketplaceABI from "./contracts/InvoiceMarketplace.json";
import type { PublicClient } from "viem";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.drpc.org";

// PERSON A: Added missing exports for UI Filters
export type YieldRange = 'low' | 'medium' | 'high';
export type DurationRange = 'short' | 'medium' | 'long';

export interface Invoice {
  id: number;
  msme: string;
  buyer: string;
  amount: string; // in MATIC
  fundedAmount: string; // in MATIC
  dueDate: Date;
  // On-chain enum: 0: None, 1: PendingBuyer, 2: Fundraising, 3: Funded, 4: Repaid, 5: Defaulted
  status: number;
  metadataURI: string;
  interestRate: string; // PERSON A: Added to match UI page.tsx expectations
  buyerVerified: boolean; // PERSON A: Added for UI badges
  riskScore: number;      // PERSON A: Added for UI sorting
  discountRate?: string;
  exclusiveInvestor: string;
  isPublic: boolean;
  isPrivate: boolean;
}

export type InvoiceStatus =
  | "None"
  | "PendingBuyer"
  | "Fundraising"
  | "Funded"
  | "Repaid"
  | "Defaulted";

export function getStatusLabel(status: number): InvoiceStatus {
  const statusMap: Record<number, InvoiceStatus> = {
    0: "None",
    1: "PendingBuyer",
    2: "Fundraising",
    3: "Funded",
    4: "Repaid",
    5: "Defaulted",
  };
  return statusMap[status] || "None";
}

export function calculateDaysRemaining(dueDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Fetch all invoices from blockchain
export async function fetchAllInvoices(): Promise<Invoice[]> {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      InvoiceMarketplaceABI.abi,
      provider
    );

    const nextId = await contract.nextInvoiceId();
    const invoicePromises: Array<Promise<[number, any | null]>> = [];

    // nextInvoiceId in the contract is the latest created invoice ID,
    // so we need to iterate inclusively from 1..nextId.
    for (let i = 1; i <= Number(nextId); i++) {
      const invoiceId = i;
      invoicePromises.push(
        contract.invoices(i)
          .then((inv: any): [number, any] => [invoiceId, inv])
          .catch((): [number, null] => [invoiceId, null])
      );
    }

    const invoiceResults = await Promise.all(invoicePromises);
    
    const zeroAddress = "0x0000000000000000000000000000000000000000";

    return invoiceResults
      .filter(([id, inv]) => inv !== null)
      .map(([id, inv]) => {
        const exclusiveInvestor: string =
          inv.exclusiveInvestor && typeof inv.exclusiveInvestor === "string"
            ? inv.exclusiveInvestor
            : zeroAddress;
        const isPublic = exclusiveInvestor.toLowerCase() === zeroAddress;
        const isPrivate = !isPublic;

        return {
          id: id,
          msme: inv.msme,
          buyer: inv.buyer,
          amount: ethers.formatEther(inv.amount),
          fundedAmount: ethers.formatEther(inv.fundedAmount),
          dueDate: new Date(Number(inv.dueDate) * 1000),
          status: Number(inv.status),
          metadataURI: inv.metadataURI,
          interestRate: inv.discountRate ? (Number(inv.discountRate) / 100).toString() : "10",
          buyerVerified: true,
          riskScore: 50,
          discountRate: inv.discountRate ? ethers.formatUnits(inv.discountRate, 18) : undefined,
          exclusiveInvestor,
          isPublic,
          isPrivate,
        };
      })
      .sort((a, b) => b.id - a.id);
  } catch (error) {
    console.error("Error fetching all invoices:", error);
    throw new Error("Failed to fetch invoices from blockchain");
  }
}

// Fetch invoices by MSME address
export async function fetchInvoicesByMSME(
  msmeAddress: string,
  publicClient?: PublicClient
): Promise<Invoice[]> {
  try {
    const allInvoices = await fetchAllInvoices();
    return allInvoices.filter(
      (inv) => inv.msme.toLowerCase() === msmeAddress.toLowerCase()
    );
  } catch (error) {
    console.error("Error fetching invoices by MSME:", error);
    throw new Error("Failed to fetch invoices from blockchain");
  }
}

// Fetch invoices by buyer address
export async function fetchInvoicesByBuyer(
  buyerAddress: string
): Promise<Invoice[]> {
  try {
    const allInvoices = await fetchAllInvoices();
    return allInvoices.filter(
      (inv) => inv.buyer.toLowerCase() === buyerAddress.toLowerCase()
    );
  } catch (error) {
    console.error("Error fetching invoices by buyer:", error);
    throw new Error("Failed to fetch invoices from blockchain");
  }
}

// Fetch invoices that are fundraising (for investors)
export async function fetchFundraisingInvoices(): Promise<Invoice[]> {
  try {
    const allInvoices = await fetchAllInvoices();
    // Status 2 == Fundraising in the new enum
    return allInvoices.filter((inv) => inv.status === 2);
  } catch (error) {
    console.error("Error fetching fundraising invoices:", error);
    throw new Error("Failed to fetch invoices from blockchain");
  }
}

// --- UI helpers for actions based on role & status ---

export type InvoiceUserRole = "msme" | "investor" | "bigbuyer";

export type InvoiceAction =
  | "NONE"
  | "WAITING_FOR_CONFIRMATION"
  | "CAN_CONFIRM"
  | "OPEN_FOR_INVESTMENT"
  | "READY_TO_CLAIM_REPAYMENT"
  | "READY_TO_CLAIM_REFUND";

/**
 * Derives the primary action available for a user on a given invoice
 * based on their role, whether they are the buyer, whether they have
 * already invested, and whether the invoice has expired.
 */
export function getInvoiceAction(params: {
  role: InvoiceUserRole;
  invoice: Invoice;
  isBuyer: boolean;
  hasInvestment: boolean;
  isExpired: boolean;
}): InvoiceAction {
  const { role, invoice, isBuyer, hasInvestment, isExpired } = params;
  const status = invoice.status;

  // Pending buyer confirmation
  if (status === 1) {
    if (role === "bigbuyer" && isBuyer) {
      return "CAN_CONFIRM";
    }
    return "WAITING_FOR_CONFIRMATION";
  }

  // Fundraising
  if (status === 2) {
    // Open for new investments while not expired
    if (role === "investor" && !isExpired) {
      return "OPEN_FOR_INVESTMENT";
    }

    // After expiry, investors with principal can claim refund
    if (role === "investor" && isExpired && hasInvestment) {
      return "READY_TO_CLAIM_REFUND";
    }
  }

  // Repaid invoices: investors with principal still recorded can claim
  if (status === 4 && role === "investor" && hasInvestment) {
    return "READY_TO_CLAIM_REPAYMENT";
  }

  return "NONE";
}

// Fetch investment amount for a specific invoice and investor
export async function fetchInvestmentAmount(
  invoiceId: number,
  investorAddress: string
): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      InvoiceMarketplaceABI.abi,
      provider
    );

    const investment = await contract.investments(invoiceId, investorAddress);
    return ethers.formatEther(investment);
  } catch (error) {
    console.error("Error fetching investment amount:", error);
    return "0";
  }
}

// Fetch all investors for a specific invoice
export async function fetchInvoiceInvestors(
  invoiceId: number
): Promise<string[]> {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      InvoiceMarketplaceABI.abi,
      provider
    );

    const investors = await contract.getInvestors(invoiceId);
    return investors;
  } catch (error) {
    console.error("Error fetching invoice investors:", error);
    return [];
  }
}
