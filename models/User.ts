import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "msme" | "investor" | "bigbuyer";
  walletAddress?: string;
  createdAt: Date;
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
    index: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
