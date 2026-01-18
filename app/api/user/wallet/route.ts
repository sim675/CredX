import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

// Validation schema for the request body
const walletWithUserIdSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address"),
  userId: z.string().min(1, "User ID is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 1. Validate the input data
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

    // 2. Connect to MongoDB
    await dbConnect();

    // 3. Verify user exists first
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 4. Check if this wallet is already bound to another user
    // This prevents one wallet from being linked to multiple accounts
    const existingUserWithWallet = await User.findOne({
      walletAddress: normalizedAddress,
      _id: { $ne: userId },
    });

    if (existingUserWithWallet) {
      return NextResponse.json(
        { error: "This wallet is already connected to another account" },
        { status: 409 }
      );
    }

    // 5. Update user's wallet address
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { walletAddress: normalizedAddress },
      { new: true, runValidators: true }
    ).select("-password"); // Security: don't return the password hash

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update user record" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Wallet linked successfully",
        walletAddress: updatedUser.walletAddress,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Wallet binding error:", error);
    
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}