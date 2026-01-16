import { NextRequest, NextResponse } from "next/server";

import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

// Verify a user's email based on a one-time token.
// This endpoint is called from the /verify page once the user clicks the
// verification link in their email.
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

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification link" },
        { status: 400 }
      );
    }

    if (user.isVerified) {
      // If the user is already verified we simply acknowledge it.
      return NextResponse.json(
        { message: "Email is already verified." },
        { status: 200 }
      );
    }

    if (
      user.verificationTokenExpiry &&
      user.verificationTokenExpiry.getTime() < Date.now()
    ) {
      // Token exists but is past its expiry window.
      return NextResponse.json(
        {
          error:
            "This verification link has expired. Please request a new verification email.",
        },
        { status: 400 }
      );
    }

    // Mark the account as verified and clear the token so it cannot be reused.
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    return NextResponse.json(
      { message: "Your email has been verified successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
