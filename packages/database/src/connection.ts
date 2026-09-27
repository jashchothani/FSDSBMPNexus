import mongoose from 'mongoose';

let isConnected = false;
let mongoMemoryServer: any = null;

/**
 * Connect to MongoDB with automatic local memory server fallback on port 27017 if local MongoDB is not running.
 * Safe to call multiple times — only connects once.
 */
export async function connectDB(uri?: string): Promise<void> {
  if (isConnected) return;

  const targetUri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sbmpnexus';

  try {
    mongoose.set('strictQuery', true);

    await mongoose.connect(targetUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log(`✅ MongoDB connected successfully to ${targetUri}`);

    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error.message);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('⚠️ MongoDB disconnected');
    });
  } catch (error: any) {
    console.warn(`⚠️ Could not connect to primary MongoDB at ${targetUri} (${error.message})`);
    console.log('⚡ Starting embedded MongoDB standalone server on port 27017...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbName: 'sbmpnexus',
        },
      });

      const fallbackUri = mongoMemoryServer.getUri();
      console.log(`✅ Embedded MongoDB Server active at: ${fallbackUri}`);
      console.log(`💡 MongoDB Compass Connection String: mongodb://127.0.0.1:27017/sbmpnexus`);

      await mongoose.connect(fallbackUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      });

      isConnected = true;
      console.log('✅ Connected to embedded MongoDB successfully!');
    } catch (memError: any) {
      // If port 27017 is busy, try random port
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create({
          instance: { dbName: 'sbmpnexus' },
        });

        const fallbackUri = mongoMemoryServer.getUri();
        console.log(`✅ Embedded MongoDB Server active at: ${fallbackUri}`);
        console.log(`💡 MongoDB Compass Connection String: ${fallbackUri}`);

        await mongoose.connect(fallbackUri, {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
        });

        isConnected = true;
        console.log('✅ Connected to embedded MongoDB fallback successfully!');
      } catch (finalError: any) {
        console.error('❌ Failed to start embedded MongoDB server:', finalError.message);
        throw finalError;
      }
    }
  }
}

/**
 * Disconnect from MongoDB and stop memory server if running.
 */
export async function disconnectDB(): Promise<void> {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('📦 MongoDB disconnected');
  }
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
    mongoMemoryServer = null;
    console.log('🛑 Embedded MongoDB Server stopped');
  }
}

/**
 * Get the mongoose connection status.
 */
export function isDBConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}
