import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

// Verify a user's email based on a one-time token.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Missing verification token" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    // Find user with the matching token
    const user = await User.findOne({ verificationToken: token });

    // 1. If no user found with that token
    if (!user) {
      // Small artificial delay to prevent brute-force timing attacks
      await new Promise((resolve) => setTimeout(resolve, 500));
      return NextResponse.json(
        { error: "Invalid or expired verification link" },
        { status: 400 }
      );
    }

    // 2. Handle already verified status
    if (user.isVerified) {
      return NextResponse.json(
        { message: "Email is already verified." },
        { status: 200 }
      );
    }

    // 3. Check Expiry Window
    // 
    if (
      user.verificationTokenExpiry &&
      user.verificationTokenExpiry.getTime() < Date.now()
    ) {
      return NextResponse.json(
        {
          error:
            "This verification link has expired. Please request a new verification email.",
        },
        { status: 400 }
      );
    }

    // 4. Update User: Atomic mark as verified and wipe token fields
    user.isVerified = true;
    
    // Using null ensures the fields are cleared in MongoDB
    user.verificationToken = null as any; 
    user.verificationTokenExpiry = null as any;

    await user.save();

    return NextResponse.json(
      { message: "Your email has been verified successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}