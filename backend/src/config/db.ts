import mongoose from 'mongoose';
import logger from './logger'

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGO_URI || 'mongodb+srv://meetsoni1075:clerk-auth@clerk.tqqzrmo.mongodb.net';
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  logger.info('Connected to MongoDB');
}
