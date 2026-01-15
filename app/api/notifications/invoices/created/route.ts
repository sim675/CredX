import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      invoiceId,
      msmeAddress,
      buyerAddress,
      amount,
      dueDate,
      discountRate,
    } = body ?? {};

    if (
      typeof invoiceId !== "number" ||
      typeof msmeAddress !== "string" ||
      typeof buyerAddress !== "string" ||
      typeof amount !== "string" ||
      typeof dueDate !== "string"
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await dbConnect();

    const [msmeUser, buyerUser] = await Promise.all([
      User.findOne({ walletAddress: msmeAddress.toLowerCase() }).lean(),
      User.findOne({ walletAddress: buyerAddress.toLowerCase() }).lean(),
    ]);

    const emailPromises: Promise<unknown>[] = [];

    if (msmeUser?.email) {
      emailPromises.push(
        sendEmail({
          to: msmeUser.email,
          subject: `Invoice #${invoiceId} created`,
          html: `<p>Hi ${msmeUser.name || "there"},</p>
<p>Your invoice #${invoiceId} has been created on CredX.</p>
<p><strong>Amount:</strong> ${amount} MATIC<br/>
<strong>Due date:</strong> ${new Date(dueDate).toLocaleDateString()}<br/>
<strong>Discount rate:</strong> ${discountRate ?? "-"}%</p>
<p>You can now share this invoice with investors on the marketplace.</p>`,
        })
      );
    }

    if (buyerUser?.email) {
      emailPromises.push(
        sendEmail({
          to: buyerUser.email,
          subject: `New invoice #${invoiceId} issued to you`,
          html: `<p>Hi ${buyerUser.name || "there"},</p>
<p>An MSME has created invoice #${invoiceId} where you are listed as the buyer.</p>
<p><strong>Amount:</strong> ${amount} MATIC<br/>
<strong>Due date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
<p>Please ensure timely repayment according to your agreement.</p>`,
        })
      );
    }

    if (emailPromises.length > 0) {
      await Promise.all(emailPromises);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("/api/notifications/invoices/created error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
