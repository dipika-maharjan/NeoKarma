/**
 * MongoDB connection configuration
 */
const mongoose = require('mongoose');
const config = require('./env');

const connectDB = async () => {
  try {
    if (!config.MONGO_URI) {
      throw new Error('MONGO_URI is missing');
    }

    await mongoose.connect(config.MONGO_URI);

    console.log('MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);

    // IMPORTANT: do NOT crash server on Render
    console.log('Continuing without DB connection');
    return null;
  }
};

const getDBStatus = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = {
  connectDB,
  getDBStatus
};