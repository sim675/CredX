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
    const { invoiceId, investorAddress, msmeAddress } = body ?? {};

    if (
      typeof invoiceId !== "number" ||
      typeof investorAddress !== "string" ||
      typeof msmeAddress !== "string"
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (!CONTRACT_ADDRESS) {
      return NextResponse.json(
        { error: "Contract address not configured" },
        { status: 500 }
      );
    }

    await dbConnect();

    const [investorUser, msmeUser] = await Promise.all([
      User.findOne({ walletAddress: investorAddress.toLowerCase() }).lean(),
      User.findOne({ walletAddress: msmeAddress.toLowerCase() }).lean(),
    ]);

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      InvoiceMarketplaceABI.abi,
      provider
    );

    const onchainInvoice = await contract.invoices(invoiceId);
    const amountMatic = ethers.formatEther(onchainInvoice.amount);
    const fundedMatic = ethers.formatEther(onchainInvoice.fundedAmount);
    const dueDate = new Date(Number(onchainInvoice.dueDate) * 1000);
    const status: number = Number(onchainInvoice.status);

    const emailPromises: Promise<unknown>[] = [];

    if (investorUser?.email) {
      emailPromises.push(
        sendEmail({
          to: investorUser.email,
          subject: `Investment received for Invoice #${invoiceId}`,
          html: `<p>Hi ${investorUser.name || "there"},</p>
<p>Your investment transaction for invoice #${invoiceId} has been confirmed on-chain.</p>
<p><strong>Invoice amount:</strong> ${amountMatic} MATIC<br/>
<strong>Currently funded:</strong> ${fundedMatic} MATIC<br/>
<strong>Due date:</strong> ${dueDate.toLocaleDateString()}</p>
<p>You will receive repayments automatically when the buyer repays the invoice.</p>`,
        })
      );
    }

    if (msmeUser?.email) {
      emailPromises.push(
        sendEmail({
          to: msmeUser.email,
          subject: `New investment on Invoice #${invoiceId}`,
          html: `<p>Hi ${msmeUser.name || "there"},</p>
<p>An investor has just funded invoice #${invoiceId}.</p>
<p><strong>Invoice amount:</strong> ${amountMatic} MATIC<br/>
<strong>Currently funded:</strong> ${fundedMatic} MATIC<br/>
<strong>Due date:</strong> ${dueDate.toLocaleDateString()}</p>`,
        })
      );
    }

    if (status === 2 && msmeUser?.email) {
      emailPromises.push(
        sendEmail({
          to: msmeUser.email,
          subject: `Invoice #${invoiceId} fully funded`,
          html: `<p>Hi ${msmeUser.name || "there"},</p>
<p>Your invoice #${invoiceId} is now fully funded.</p>
<p>The full amount has been raised from investors. Please ensure you work with the buyer to guarantee timely repayment.</p>`,
        })
      );
    }

    if (emailPromises.length > 0) {
      await Promise.all(emailPromises);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("/api/notifications/investments/received error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
