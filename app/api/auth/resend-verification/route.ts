import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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

// Resend an email verification link to a user who has not yet verified
// their email address.
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

    if (!user) {
      // We don't reveal whether the email exists to avoid leaking account
      // information. Always respond with a generic success message.
      return NextResponse.json(
        {
          message:
            "If an account exists for this email, a new verification link has been sent.",
        },
        { status: 200 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        {
          message: "This email is already verified. You can sign in.",
        },
        { status: 200 }
      );
    }

    // Generate a fresh token and expiry window for this resend operation.
    const crypto = await import("crypto");
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = verificationTokenExpiry;
    await user.save();

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
    console.error("Resend verification email error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
