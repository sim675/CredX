import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto"; // Standard import is fine for Node.js runtime

import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { sendVerificationEmail } from "@/lib/email";
import { isAllowedSignupEmail } from "@/lib/utils";

const resendSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .refine(isAllowedSignupEmail, {
      message: "Please use a valid, non-disposable email address",
    }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = resendSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { email } = parseResult.data;

    await dbConnect();

    const user = await User.findOne({ email });

    // 1. Security: Don't leak user existence
    if (!user) {
      return NextResponse.json(
        {
          message: "If an account exists for this email, a new verification link has been sent.",
        },
        { status: 200 }
      );
    }

    // 2. Check if already verified
    if (user.isVerified) {
      return NextResponse.json(
        {
          message: "This email is already verified. You can sign in.",
        },
        { status: 200 }
      );
    }

    // 3. Optional Rate Limiting: Prevent spamming resend requests
    // Only allow resending if the previous token was created more than 2 minutes ago
    if (user.verificationTokenExpiry) {
      const lastRequestAge = 24 * 60 * 60 * 1000 - (user.verificationTokenExpiry.getTime() - Date.now());
      const COOLDOWN_PERIOD = 2 * 60 * 1000; // 2 minutes

      if (lastRequestAge < COOLDOWN_PERIOD) {
        return NextResponse.json(
          { error: "Please wait a few minutes before requesting another email." },
          { status: 429 }
        );
      }
    }

    // 4. Generate fresh token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = verificationTokenExpiry;
    await user.save();

    // 5. Send Email
    // 
    await sendVerificationEmail({
      to: user.email,
      token: verificationToken,
      name: user.name,
    });

    return NextResponse.json(
      {
        message: "A new verification email has been sent.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend verification email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}