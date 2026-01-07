import { fetchInvoicesByMSME } from "@/lib/invoice";
import UserStats from "@/models/UserStats";

export interface TrustStats {
  walletAddress: string;
  totalInvoicesCreated: number;
  totalInvoicesRepaid: number;
  totalInvoicesDefaulted: number;
  trustScore: number;
}

export async function recomputeTrustStatsForWallet(
  walletAddress: string
): Promise<TrustStats> {
  const normalizedAddress = walletAddress.toLowerCase();

  const invoices = await fetchInvoicesByMSME(normalizedAddress);

  const totalInvoicesCreated = invoices.length;
  let totalInvoicesRepaid = 0;
  let totalInvoicesDefaulted = 0;

  for (const invoice of invoices) {
    if (invoice.status === 3) {
      totalInvoicesRepaid += 1;
    } else if (invoice.status === 4) {
      totalInvoicesDefaulted += 1;
    }
  }

  const trustScore =
    totalInvoicesCreated > 0
      ? totalInvoicesRepaid / totalInvoicesCreated
      : 0;

  await UserStats.findOneAndUpdate(
    { walletAddress: normalizedAddress },
    {
      walletAddress: normalizedAddress,
      totalInvoicesCreated,
      totalInvoicesRepaid,
      totalInvoicesDefaulted,
      trustScore,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  return {
    walletAddress: normalizedAddress,
    totalInvoicesCreated,
    totalInvoicesRepaid,
    totalInvoicesDefaulted,
    trustScore,
  };
}
