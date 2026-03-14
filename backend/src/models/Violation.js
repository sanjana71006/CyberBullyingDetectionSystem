import mongoose from 'mongoose';

const violationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['Cyberbullying', 'Offensive Language', 'Spam', 'Other'],
      default: 'Cyberbullying',
    },
    severity: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    description: {
      type: String,
    },
    relatedMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Violation', violationSchema);
