require('dotenv').config();
const mongoose = require('mongoose');
const DailyLog = require('../src/models/DailyLog');
const { MONGO_URI } = require('../src/config/env');

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const docs = await DailyLog.find({ $or: [{ userId: 'offline-test-user' }, { date: '2026-06-18' }, { date: new Date().toISOString().slice(0,10) }] }).lean();
    process.exit(0);
  } catch (err) {
    console.error('Error', err);
    process.exit(1);
  }
})();
