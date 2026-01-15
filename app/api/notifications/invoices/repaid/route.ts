import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import InvoiceMarketplaceABI from "@/lib/contracts/InvoiceMarketplace.json";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;
const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://rpc-amoy.polygon.technology";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invoiceId, buyerAddress } = body ?? {};

    if (typeof invoiceId !== "number" || typeof buyerAddress !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (!CONTRACT_ADDRESS) {
      return NextResponse.json(
        { error: "Contract address not configured" },
        { status: 500 }
      );
    }

    await dbConnect();

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      InvoiceMarketplaceABI.abi,
      provider
    );

    const onchainInvoice = await contract.invoices(invoiceId);
    const amountMatic = ethers.formatEther(onchainInvoice.amount);
    const dueDate = new Date(Number(onchainInvoice.dueDate) * 1000);
    const status: number = Number(onchainInvoice.status);

    if (status !== 3) {
      return NextResponse.json(
        { error: "Invoice is not in repaid status" },
        { status: 400 }
      );
    }

    const [msmeUser, buyerUser] = await Promise.all([
      User.findOne({ walletAddress: onchainInvoice.msme.toLowerCase() }).lean(),
      User.findOne({ walletAddress: buyerAddress.toLowerCase() }).lean(),
    ]);

    const investorAddresses: string[] = await contract.getInvestors(invoiceId);

    const investorUsers = await User.find({
      walletAddress: { $in: investorAddresses.map((a) => a.toLowerCase()) },
    }).lean();

    const emailPromises: Promise<unknown>[] = [];

    if (msmeUser?.email) {
      emailPromises.push(
        sendEmail({
          to: msmeUser.email,
          subject: `Invoice #${invoiceId} repaid by buyer`,
          html: `<p>Hi ${msmeUser.name || "there"},</p>
<p>Your invoice #${invoiceId} has been fully repaid by the buyer.</p>
<p><strong>Invoice amount:</strong> ${amountMatic} MATIC<br/>
<strong>Due date:</strong> ${dueDate.toLocaleDateString()}</p>`,
        })
      );
    }

    if (buyerUser?.email) {
      emailPromises.push(
        sendEmail({
          to: buyerUser.email,
          subject: `Invoice #${invoiceId} repayment confirmed`,
          html: `<p>Hi ${buyerUser.name || "there"},</p>
<p>Your repayment for invoice #${invoiceId} has been confirmed on-chain.</p>
<p>Thank you for paying on time.</p>`,
        })
      );
    }

    for (const investor of investorUsers) {
      if (!investor.email) continue;
      emailPromises.push(
        sendEmail({
          to: investor.email,
          subject: `Invoice #${invoiceId} repaid - payout sent`,
          html: `<p>Hi ${investor.name || "there"},</p>
<p>The buyer has repaid invoice #${invoiceId}. Your principal and yield have been distributed according to your share.</p>
<p><strong>Invoice amount:</strong> ${amountMatic} MATIC<br/>
<strong>Due date:</strong> ${dueDate.toLocaleDateString()}</p>`,
        })
      );
    }

    if (emailPromises.length > 0) {
      await Promise.all(emailPromises);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("/api/notifications/invoices/repaid error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
