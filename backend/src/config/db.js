/**
 * MongoDB connection configuration
 */
const mongoose = require('mongoose');
const config = require('./env');

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log(' MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error(' MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const getDBStatus = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = {
  connectDB,
  getDBStatus
};
