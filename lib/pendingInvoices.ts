import { ethers } from "ethers";

export type PendingInvoiceStatus = "pending" | "success" | "failed" | "timeout";

export interface PendingInvoice {
  txHash: string;
  msmeAddress: string;
  buyerAddress: string;
  amount: string; // in MATIC string form as entered in UI
  dueDate: string; // ISO/string as entered in UI
  createdAt: string; // ISO timestamp
  status: PendingInvoiceStatus;
  invoiceId?: number;
}

const STORAGE_KEY = "credx:pendingInvoices";

function safeReadAll(): PendingInvoice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Basic shape validation
    return parsed.filter((item) => typeof item?.txHash === "string" && typeof item?.msmeAddress === "string");
  } catch {
    return [];
  }
}

function safeWriteAll(invoices: PendingInvoice[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
  } catch {
    // Swallow storage errors (e.g. private mode / quota exceeded)
  }
}

export function getPendingInvoicesForMsme(msmeAddress: string): PendingInvoice[] {
  const all = safeReadAll();
  const addr = msmeAddress.toLowerCase();
  return all.filter((inv) => inv.msmeAddress.toLowerCase() === addr);
}

export function addOrUpdatePendingInvoice(invoice: PendingInvoice) {
  const all = safeReadAll();
  const idx = all.findIndex((inv) => inv.txHash === invoice.txHash);
  const normalized: PendingInvoice = {
    ...invoice,
    msmeAddress: invoice.msmeAddress.toLowerCase(),
    buyerAddress: invoice.buyerAddress.toLowerCase(),
  };

  if (idx >= 0) {
    all[idx] = { ...all[idx], ...normalized };
  } else {
    all.push(normalized);
  }

  safeWriteAll(all);
}

export function updatePendingInvoiceStatus(
  txHash: string,
  status: PendingInvoiceStatus,
  invoiceId?: number
) {
  const all = safeReadAll();
  const idx = all.findIndex((inv) => inv.txHash === txHash);
  if (idx === -1) return;

  all[idx] = {
    ...all[idx],
    status,
    invoiceId: typeof invoiceId === "number" && !isNaN(invoiceId) ? invoiceId : all[idx].invoiceId,
  };

  safeWriteAll(all);
}

export function removePendingInvoice(txHash: string) {
  const all = safeReadAll();
  const next = all.filter((inv) => inv.txHash !== txHash);
  safeWriteAll(next);
}
