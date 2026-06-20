const mongoose = require('mongoose');
const config = require('../src/config/env');
const User = require('../src/models/User');
const DailyLog = require('../src/models/DailyLog');

const NEPAL_OFFSET_MINUTES = 5 * 60 + 45;
const toNepalDateStrFromISO = (iso) => {
  const d = new Date(iso);
  const utc = Date.UTC(
    d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds()
  );
  const nepalMs = utc + NEPAL_OFFSET_MINUTES * 60 * 1000;
  return new Date(nepalMs).toISOString().slice(0,10);
};

(async () => {
  await mongoose.connect(config.MONGO_URI);
  const email = process.argv[2];
  if (!email) { console.error('Usage: node find_mismatched_dates.js <email>'); process.exit(1); }
  const user = await User.findOne({ email: email.toLowerCase() }).lean();
  if (!user) { console.error('User not found'); process.exit(1); }
  const logs = await DailyLog.find({ userId: user._id }).lean();
  const mismatches = [];
  for (const l of logs) {
    const createdNepal = toNepalDateStrFromISO(l.createdAt);
    if (l.date !== createdNepal) {
      mismatches.push({ _id: l._id.toString(), date: l.date, createdAt: l.createdAt, createdNepal });
    }
  }
  if (mismatches.length === 0) {
    console.log('No mismatches found.');
  } else {
    console.log('Mismatches:');
    console.log(JSON.stringify(mismatches, null, 2));
  }
  await mongoose.disconnect();
})();
