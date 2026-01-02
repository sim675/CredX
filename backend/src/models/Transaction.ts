import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  from: mongoose.Types.ObjectId;
  to: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
  status: 'completed' | 'failed';
}

const TransactionSchema: Schema = new Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['completed', 'failed'], default: 'completed' }
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
