import mongoose from 'mongoose';

const MONGODB_URI = process.env.DATABASE_URL?.replace(/^["']|["']$/g, '');

if (!MONGODB_URI) {
  throw new Error('Please define the DATABASE_URL environment variable inside .env.local');
}

console.log('MongoDB URI configured:', MONGODB_URI.substring(0, 50) + '...');

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose;
    }).catch((err) => {
      console.error('MongoDB connection failed:', err.message);
      throw err;
    });
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    console.error('Error awaiting MongoDB connection:', err);
    cached.promise = null; // Reset promise on failure
    throw err;
  }
}

export default connectToDatabase;