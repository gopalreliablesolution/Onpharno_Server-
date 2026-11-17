import mongoose from 'mongoose';
import dns from 'dns';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/onpharno';
  if (uri.startsWith('mongodb+srv:')) {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch {
      // Continue with system DNS if custom fails
    }
  }
  try {
    const conn = await mongoose.connect(uri);
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ Primary MongoDB connection failed (${error.message}). Attempting local fallback: mongodb://127.0.0.1:27017/onpharno`);
    try {
      const fallbackConn = await mongoose.connect('mongodb://127.0.0.1:27017/onpharno');
      console.log(`🍃 Local MongoDB Connected: ${fallbackConn.connection.host}/${fallbackConn.connection.name}`);
      return fallbackConn;
    } catch (fallbackError) {
      console.error(`❌ MongoDB Connection Error: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;
