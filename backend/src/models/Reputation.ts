import mongoose, { Schema, Document } from 'mongoose';

export interface IReputation extends Document {
  user: mongoose.Types.ObjectId;
  score: number;
}

const ReputationSchema: Schema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, default: 0 }
});

export default mongoose.model<IReputation>('Reputation', ReputationSchema);
