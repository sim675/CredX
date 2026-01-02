import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
  issuer: mongoose.Types.ObjectId;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue';
}

const InvoiceSchema: Schema = new Schema({
  issuer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' }
});

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
