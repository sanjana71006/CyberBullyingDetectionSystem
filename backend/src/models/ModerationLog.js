import mongoose from 'mongoose';

const moderationLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actionTaken: {
      type: String,
      enum: ['Warning Issued', 'Message Blocked', 'Account Suspended', 'Credibility Reduced'],
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    relatedMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export default mongoose.model('ModerationLog', moderationLogSchema);
