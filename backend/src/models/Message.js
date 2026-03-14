import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    prediction: {
      type: Number,
      required: true,
      enum: [0, 1],
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    toxicityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    abusiveWords: {
      type: [String],
      default: [],
    },
    violationFlag: {
      type: Boolean,
      default: false,
    },
    isDelivered: {
      type: Boolean,
      default: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

export default mongoose.model('Message', messageSchema);
