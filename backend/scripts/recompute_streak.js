const mongoose = require('mongoose');
const config = require('../src/config/env');
const User = require('../src/models/User');
const DailyLog = require('../src/models/DailyLog');
const { getTodayStr, isConsecutiveDays } = require('../src/utils/dateHelpers');

async function recomputeForEmail(email) {
  await mongoose.connect(config.MONGO_URI);
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    console.error('User not found:', email);
    process.exit(1);
  }

  const logs = await DailyLog.find({ userId: user._id }).sort({ date: 1 }).lean();
  const dates = logs.map(l => l.date);

  // compute longest and current streak based on dates
  let current = 0;
  let longest = 0;
  let lastDate = null;

  for (const d of dates) {
    if (!lastDate) {
      current = 1;
    } else if (isConsecutiveDays(lastDate, d)) {
      current += 1;
    } else if (lastDate === d) {
      // duplicate date - ignore
    } else {
      if (current > longest) longest = current;
      current = 1;
    }
    lastDate = d;
    if (current > longest) longest = current;
  }

  const today = getTodayStr();
  const lastLogDate = dates.length ? dates[dates.length - 1] : null;
  const participationScore = user.streak.participationScore || 0; // preserve existing participation

  user.streak.current = current;
  user.streak.longest = longest;
  user.streak.lastLogDate = lastLogDate;
  user.streak.participationScore = participationScore;

  await user.save();

  console.log('Updated streak for', email, { current, longest, lastLogDate });
  await mongoose.disconnect();
}

if (require.main === module) {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node recompute_streak.js <email>');
    process.exit(1);
  }
  recomputeForEmail(email).catch(err => { console.error(err); process.exit(1); });
}
