import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "msme" | "investor" | "bigbuyer";
  walletAddress?: string;
  createdAt: Date;
  isVerified: boolean;
  verificationToken?: string | null;
  verificationTokenExpiry?: Date | null;
}

const UserSchema: Schema<IUser> = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["msme", "investor", "bigbuyer"],
    required: true,
  },
  walletAddress: {
    type: String,
    required: false,
    unique: true,    // Ensures one wallet can't be used for multiple accounts
    sparse: true,    // CRITICAL: Allows multiple users to have 'null' walletAddress
    index: true,
    lowercase: true, // Automatically converts 0xABC to 0xabc before saving
    trim: true,      // Removes any accidental white space
  },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, required: false },
  verificationTokenExpiry: { type: Date, required: false },
  createdAt: { type: Date, default: Date.now },
});

// Fix for Next.js hot-reloading: ensures model isn't re-compiled
const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;