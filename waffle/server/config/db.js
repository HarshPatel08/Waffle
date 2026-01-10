const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined in environment variables');
    throw new Error('MONGODB_URI is not defined');
  }

  console.log('[DB] Connecting to MongoDB...');
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);
  return conn;
};

module.exports = connectDB;
