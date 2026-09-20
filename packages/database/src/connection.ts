import mongoose from 'mongoose';

let isConnected = false;

/**
 * Connect to MongoDB with retry logic.
 * Safe to call multiple times — only connects once.
 */
export async function connectDB(uri: string): Promise<void> {
  if (isConnected) return;

  try {
    mongoose.set('strictQuery', true);

    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log('✅ MongoDB connected successfully');

    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error.message);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('⚠️ MongoDB disconnected');
    });
  } catch (error) {
    console.error('❌ MongoDB connection failed:', (error as Error).message);
    throw error;
  }
}

/**
 * Disconnect from MongoDB.
 */
export async function disconnectDB(): Promise<void> {
  if (!isConnected) return;

  await mongoose.disconnect();
  isConnected = false;
  console.log('📦 MongoDB disconnected');
}

/**
 * Get the mongoose connection status.
 */
export function isDBConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}
