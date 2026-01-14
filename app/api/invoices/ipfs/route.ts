import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { uploadFileToIPFS, uploadJSONToIPFS } from "@/lib/pinata";

// Improved validation schema to match frontend behavior
const invoiceFormSchema = z.object({
  buyerAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid buyer address format"),
  msmeAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid MSME address format")
    .optional(),
  amount: z.string().min(1, "Amount is required"),
  currency: z.string().default("MATIC"),
  dueDate: z.string().min(1, "Due date is required"),
  discountRate: z.string().optional(),
  description: z.string().optional(),
  externalId: z.string().optional(),
  exclusiveInvestor: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // 1. File Check
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Invoice PDF file is required (field name: 'file')" },
        { status: 400 }
      );
    }

    // 2. Extract Fields from FormData
    const rawFields: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (key !== "file" && typeof value === "string") {
        rawFields[key] = value;
      }
    });

    // 3. Validate Data with Zod
    const parseResult = invoiceFormSchema.safeParse(rawFields);
    if (!parseResult.success) {
      console.error("Zod Validation Error:", parseResult.error.flatten());
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // 4. Upload PDF to IPFS via Pinata
    const pdfPin = await uploadFileToIPFS(file, file.name || "invoice.pdf");

    // 5. Build Metadata Object
    const metadata = {
      version: 1,
      type: "decentralized-invoice",
      createdAt: new Date().toISOString(),
      invoice: {
        buyerAddress: data.buyerAddress,
        msmeAddress: data.msmeAddress ?? null,
        amount: data.amount,
        currency: data.currency,
        dueDate: data.dueDate,
        discountRate: data.discountRate ?? null,
        description: data.description ?? null,
        externalId: data.externalId ?? null,
        exclusiveInvestor: data.exclusiveInvestor ?? "0x0000000000000000000000000000000000000000",
      },
      file: {
        cid: pdfPin.cid,
        uri: pdfPin.uri,
        gatewayUrl: pdfPin.gatewayUrl,
        mimeType: file.type,
        fileName: file.name,
      },
    };

    // 6. Upload JSON Metadata to IPFS
    const metadataName = data.externalId || `metadata-${pdfPin.cid.substring(0, 8)}`;
    const jsonPin = await uploadJSONToIPFS(metadata, {
      name: metadataName,
    });

    return NextResponse.json(
      {
        pdfCid: pdfPin.cid,
        pdfUri: pdfPin.uri,
        pdfGatewayUrl: pdfPin.gatewayUrl,
        metadataCid: jsonPin.cid,
        metadataUri: jsonPin.uri, // This is what the frontend uses
        metadataGatewayUrl: jsonPin.gatewayUrl,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("/api/invoices/ipfs error:", error);
    return NextResponse.json(
      { error: "Failed to upload invoice to IPFS", details: error.message },
      { status: 500 }
    );
  }
}