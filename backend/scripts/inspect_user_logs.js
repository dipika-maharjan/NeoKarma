const mongoose = require('mongoose');
const config = require('../src/config/env');
const User = require('../src/models/User');
const DailyLog = require('../src/models/DailyLog');

async function main() {
  try {
    await mongoose.connect(config.MONGO_URI);
  } catch (err) {
    console.error('Connection error:', err.message);
    process.exit(1);
  }

  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node scripts/inspect_user_logs.js <email>');
    process.exit(1);
  }

  const user = await User.findOne({ email: email.toLowerCase() }).lean();
  if (!user) {
    console.error('User not found for', email);
    process.exit(1);
  }

  console.log('User:', { _id: user._id.toString(), email: user.email, name: user.name, streak: user.streak });

  const logs = await DailyLog.find({ userId: user._id }).sort({ date: 1 }).lean();
  console.log('\nDailyLog count:', logs.length);
  for (const l of logs) {
    console.log(JSON.stringify({ _id: l._id.toString(), date: l.date, totalEmissionKg: l.totalEmissionKg, createdAt: l.createdAt, updatedAt: l.updatedAt }, null, 2));
  }

  // print last 120 days presence
  const presence = logs.map(l => l.date);
  console.log('\nDates present:\n', presence.join(', '));

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
