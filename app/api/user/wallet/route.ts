import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

const walletWithUserIdSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address"),
  userId: z.string().min(1, "User ID is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = walletWithUserIdSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { walletAddress, userId } = parseResult.data;
    const normalizedAddress = walletAddress.toLowerCase();

    await dbConnect();

    // Verify user exists
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if wallet is already bound to another user
    const existingUser = await User.findOne({
      walletAddress: normalizedAddress,
      _id: { $ne: userId },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "This wallet is already connected to another account" },
        { status: 409 }
      );
    }

    // Update user's wallet address
    const user = await User.findByIdAndUpdate(
      userId,
      { walletAddress: normalizedAddress },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        walletAddress: user.walletAddress,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Wallet binding error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

