import mongoose from 'mongoose';

/**
 * Connect to MongoDB with connection event listeners and graceful fallback
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/baton';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[Database] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error(`[Database Error] ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] MongoDB disconnected');
    });

    return conn;
  } catch (error) {
    console.error(`[Database] Connection failed: ${error.message}`);
    // Do not terminate process immediately in development so health check and other APIs can still respond
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

