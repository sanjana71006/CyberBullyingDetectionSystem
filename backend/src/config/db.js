import mongoose from 'mongoose';

export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn('MONGODB_URI missing. Backend will run without database connectivity.');
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
  }
}
