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
    const { invoiceId } = body ?? {};

    if (typeof invoiceId !== "number") {
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

    if (status !== 4) {
      return NextResponse.json(
        { error: "Invoice is not in defaulted status" },
        { status: 400 }
      );
    }

    const [msmeUser, buyerUser] = await Promise.all([
      User.findOne({ walletAddress: onchainInvoice.msme.toLowerCase() }).lean(),
      User.findOne({ walletAddress: onchainInvoice.buyer.toLowerCase() }).lean(),
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
          subject: `Invoice #${invoiceId} defaulted`,
          html: `<p>Hi ${msmeUser.name || "there"},</p>
<p>Invoice #${invoiceId} has passed its due date without full repayment and is now marked as defaulted on-chain.</p>
<p><strong>Invoice amount:</strong> ${amountMatic} MATIC<br/>
<strong>Due date:</strong> ${dueDate.toLocaleDateString()}</p>`,
        })
      );
    }

    if (buyerUser?.email) {
      emailPromises.push(
        sendEmail({
          to: buyerUser.email,
          subject: `Invoice #${invoiceId} is in default`,
          html: `<p>Hi ${buyerUser.name || "there"},</p>
<p>Invoice #${invoiceId}, where you are the buyer, has defaulted due to missed payment beyond the due date.</p>
<p>Please contact the MSME and investors to resolve this situation.</p>`,
        })
      );
    }

    for (const investor of investorUsers) {
      if (!investor.email) continue;
      emailPromises.push(
        sendEmail({
          to: investor.email,
          subject: `Invoice #${invoiceId} defaulted`,
          html: `<p>Hi ${investor.name || "there"},</p>
<p>Invoice #${invoiceId}, in which you invested, has been marked as defaulted on-chain.</p>
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
    console.error("/api/notifications/invoices/defaulted error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
