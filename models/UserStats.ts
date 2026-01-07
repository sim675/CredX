import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserStats extends Document {
  walletAddress: string;
  totalInvoicesCreated: number;
  totalInvoicesRepaid: number;
  totalInvoicesDefaulted: number;
  trustScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserStatsSchema: Schema<IUserStats> = new Schema<IUserStats>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    totalInvoicesCreated: {
      type: Number,
      default: 0,
    },
    totalInvoicesRepaid: {
      type: Number,
      default: 0,
    },
    totalInvoicesDefaulted: {
      type: Number,
      default: 0,
    },
    trustScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const UserStats: Model<IUserStats> =
  (mongoose.models.UserStats as Model<IUserStats>) ||
  mongoose.model<IUserStats>("UserStats", UserStatsSchema);

export default UserStats;
