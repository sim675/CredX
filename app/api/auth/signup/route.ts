import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";

import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { isAllowedSignupEmail } from "@/lib/utils";
import { sendVerificationEmail } from "@/lib/email";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z
    .string()
    .email("Invalid email address")
    .refine(isAllowedSignupEmail, {
      message: "Please use a valid, non-disposable email address",
    }),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["msme", "investor", "bigbuyer"]),
});

function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return reject(err);
      resolve(hash);
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parseResult = signupSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parseResult.data;

    await dbConnect();

    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    // Generate a unique email verification token for this user
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    const createdUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: false,
      verificationToken,
      verificationTokenExpiry,
    });

    // Send the verification email in the background; if it fails we still return success
    sendVerificationEmail({
      to: createdUser.email,
      token: verificationToken,
      name: createdUser.name,
    }).catch((error) => {
      console.error("Failed to send verification email", error);
    });

    return NextResponse.json(
      {
        message:
          "Account created successfully. Please check your email for a verification link.",
        requiresEmailVerification: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
