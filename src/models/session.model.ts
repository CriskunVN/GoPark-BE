import mongoose, { Document } from 'mongoose';

export interface ISession extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  refreshToken: string;
  createdAt: Date;
}

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// tự động xóa document khi hết hạn
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = mongoose.model<ISession>('Session', sessionSchema);
export default Session;
