/**
 * Seed Daily Logs for Test User — Past 1 Month
 * Populates realistic daily log data for guragainaruna@gmail.com
 * for the past 30 days (today + 29 prior days) to demonstrate the
 * streak, dashboard trends, carbon mirror, and mitigation plan eligibility
 * (most "after 30 days" features need a full month of history to trigger).
 *
 * Run: npm run seed:logs
 * (Add to package.json: "seed:logs": "node scripts/seedDailyLogsForUser.js")
 */
require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const DailyLog = require('../src/models/DailyLog');
const emissionFactorRepository = require('../src/repositories/emissionFactor.repository');

const NUM_DAYS = 30; // today + past 29 days = 30 total days of history

/**
 * Helper: format Date to YYYY-MM-DD string
 */
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Helper: calculate emissions given inputs and factors
 */
async function calculateBreakdown(transportMode, distance, mealType, plasticCount, energyHours) {
  const transportFactor = await emissionFactorRepository.findActive('transportation', transportMode);
  const foodFactor = await emissionFactorRepository.findActive('food', mealType);
  const wasteFactor = await emissionFactorRepository.findActive('waste', 'plastic');
  const energyFactor = await emissionFactorRepository.findActive('energy', 'electricity');

  const breakdown = {
    transportKg: transportFactor ? parseFloat((transportFactor.factorValue * distance).toFixed(3)) : 0,
    foodKg: foodFactor ? parseFloat(foodFactor.factorValue.toFixed(3)) : 0,
    wasteKg: wasteFactor ? parseFloat((wasteFactor.factorValue * plasticCount).toFixed(3)) : 0,
    energyKg: energyFactor ? parseFloat((energyFactor.factorValue * energyHours).toFixed(3)) : 0
  };

  const totalEmissionKg = parseFloat(
    (breakdown.transportKg + breakdown.foodKg + breakdown.wasteKg + breakdown.energyKg).toFixed(3)
  );

  return { breakdown, totalEmissionKg };
}

/**
 * Helper: calculate streak based on logs
 */
async function calculateStreak(userId) {
  const logs = await DailyLog.find({ userId })
    .sort({ date: -1 })
    .limit(NUM_DAYS + 5); // small buffer in case of pre-existing logs beyond our seed window

  if (logs.length === 0) return { current: 0, longest: 0 };

  // Sort by date ascending to check consecutive days
  const sortedLogs = logs.sort((a, b) => new Date(a.date) - new Date(b.date));

  let currentStreak = 1;
  let longestStreak = 1;

  for (let i = 1; i < sortedLogs.length; i++) {
    const prevDate = new Date(sortedLogs[i - 1].date);
    const currDate = new Date(sortedLogs[i].date);
    const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      currentStreak++;
      if (currentStreak > longestStreak) longestStreak = currentStreak;
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
    // diffDays === 0 (duplicate date) is ignored — shouldn't happen since
    // dates are generated uniquely below, but guards against weirdness
    // if pre-existing logs overlap with the seeded window.
  }

  return { current: currentStreak, longest: longestStreak };
}

/**
 * Build a realistic, varied log entry for a given day index (0 = oldest, NUM_DAYS-1 = today).
 * Cycles through different transport modes, meal types, and energy/plastic usage so the
 * 30-day trend looks like a real student's life, not 30 identical days.
 *
 * Deliberately shapes a gentle downward emissions trend across the month (higher emissions
 * in the earlier days, lower in the most recent days) so the demo can visually show
 * "improvement over time" on the dashboard/carbon mirror — matches the pitch narrative of
 * a student becoming more aware and reducing their footprint.
 */
function buildLogEntryForDay(dayIndex, dateStr) {
  const transportCycle = ['walk', 'bicycle', 'bus', 'bus', 'motorbike', 'car', 'bicycle'];
  const mealCycle = ['vegetarian', 'mixed', 'vegetarian', 'non-vegetarian', 'mixed', 'vegan', 'vegetarian'];

  const transportMode = transportCycle[dayIndex % transportCycle.length];
  const mealType = mealCycle[dayIndex % mealCycle.length];

  // Distance varies by mode so numbers stay realistic (walking/cycling = short, car/bus = longer)
  const distanceByMode = {
    walk: 1.5,
    bicycle: 4,
    bus: 8,
    motorbike: 6,
    car: 10
  };
  const distanceKm = distanceByMode[transportMode] ?? 5;

  // Improvement trend: early in the month (low dayIndex) = more plastic/energy use,
  // later in the month (high dayIndex, closer to today) = slightly better habits.
  // This is intentional for demo storytelling, not random noise.
  const progressRatio = dayIndex / (NUM_DAYS - 1); // 0 (oldest) -> 1 (today)
  const plasticItemCount = progressRatio < 0.5 ? 2 : (dayIndex % 3 === 0 ? 1 : 0);
  const foodWasteGrams = progressRatio < 0.5 ? 60 : (dayIndex % 4 === 0 ? 30 : 0);
  const energyHours = progressRatio < 0.5 ? 5 : 3;
  const segregated = progressRatio >= 0.5; // started segregating waste properly partway through

  return {
    date: dateStr,
    transportation: { mode: transportMode, distanceKm },
    food: { mealType, foodWasteGrams },
    wasteAndPlastic: { plasticItemCount, segregated },
    energy: { usageHours: energyHours }
  };
}

async function seedDailyLogs() {
  try {
    console.log(`Seeding ${NUM_DAYS} days of daily logs for test user...`);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB\n');

    // Find the user by email
    const user = await User.findOne({ email: 'guragainaruna@gmail.com' });
    if (!user) {
      throw new Error('User guragainaruna@gmail.com not found. Please create the user first.');
    }

    console.log(`✓ Found user: ${user.name} (${user.email})\n`);

    const userId = user._id;

    // Build the list of dates: today going back NUM_DAYS-1 days, oldest first
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to midnight to avoid off-by-one issues with diffDays

    const dateEntries = [];
    for (let i = NUM_DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dateEntries.push(formatDate(d));
    }

    console.log(`Will seed logs from ${dateEntries[0]} (30 days ago) through ${dateEntries[dateEntries.length - 1]} (today)\n`);

    // Build the full set of log entries using the cyclical/trend generator
    const logEntries = dateEntries.map((dateStr, idx) => buildLogEntryForDay(idx, dateStr));

    const createdLogs = [];

    for (const entry of logEntries) {
      // Calculate emissions
      const emissionResult = await calculateBreakdown(
        entry.transportation.mode,
        entry.transportation.distanceKm,
        entry.food.mealType,
        entry.wasteAndPlastic.plasticItemCount,
        entry.energy.usageHours
      );

      // Upsert log (avoid duplicates if script is re-run)
      const log = await DailyLog.findOneAndUpdate(
        { userId, date: entry.date },
        {
          userId,
          date: entry.date,
          transportation: entry.transportation,
          food: entry.food,
          wasteAndPlastic: entry.wasteAndPlastic,
          energy: entry.energy,
          breakdown: emissionResult.breakdown,
          totalEmissionKg: emissionResult.totalEmissionKg,
          createdAt: new Date()
        },
        { upsert: true, new: true }
      );

      createdLogs.push(log);
    }

    console.log(`✓ Upserted ${createdLogs.length} daily logs (${dateEntries[0]} → ${dateEntries[dateEntries.length - 1]})\n`);

    // Calculate and display streak
    const streak = await calculateStreak(userId);
    console.log(`\n Streak calculation:\n   Current: ${streak.current} days\n   Longest: ${streak.longest} days\n`);

    // Persist streak to user document so dashboard and profile show updated values
    try {
      const lastLogDate = dateEntries[dateEntries.length - 1]; // today
      const newParticipation = (user.streak && user.streak.participationScore) ? user.streak.participationScore + createdLogs.length : createdLogs.length;
      await User.findByIdAndUpdate(userId, {
        streak: {
          current: streak.current,
          longest: streak.longest,
          lastLogDate,
          participationScore: newParticipation
        }
      }, { new: true, runValidators: true });

      console.log('✓ User streak persisted to database.');
    } catch (err) {
      console.warn('Could not persist streak to user document:', err.message);
    }

    // Print summary table
    console.log(' Seeded Daily Logs Summary:');
    console.log('═'.repeat(100));
    console.log(
      `${'Date'.padEnd(12)} | ${'Transport'.padEnd(15)} | ${'Meal'.padEnd(15)} | ${'Plastic'.padEnd(8)} | ${'Energy'.padEnd(8)} | ${'Total CO₂'.padEnd(12)}`
    );
    console.log('─'.repeat(100));

    createdLogs.forEach((log) => {
      const transportStr = `${log.transportation.mode} (${log.transportation.distanceKm}km)`;
      const mealStr = log.food.mealType;
      const plasticStr = `${log.wasteAndPlastic.plasticItemCount} items`;
      const energyStr = `${log.energy.usageHours}h`;
      const totalStr = `${log.totalEmissionKg} kg`;

      console.log(
        `${log.date.padEnd(12)} | ${transportStr.padEnd(15)} | ${mealStr.padEnd(15)} | ${plasticStr.padEnd(8)} | ${energyStr.padEnd(8)} | ${totalStr.padEnd(12)}`
      );
    });

    console.log('═'.repeat(100));

    // Quick aggregate stats for sanity-checking the demo narrative
    const totalCo2 = createdLogs.reduce((sum, log) => sum + log.totalEmissionKg, 0);
    const avgCo2 = totalCo2 / createdLogs.length;
    const firstWeekAvg =
      createdLogs.slice(0, 7).reduce((sum, log) => sum + log.totalEmissionKg, 0) / 7;
    const lastWeekAvg =
      createdLogs.slice(-7).reduce((sum, log) => sum + log.totalEmissionKg, 0) / 7;

    console.log(`\n Month total: ${totalCo2.toFixed(2)} kg CO₂  |  Daily average: ${avgCo2.toFixed(2)} kg CO₂`);
    console.log(` First week avg: ${firstWeekAvg.toFixed(2)} kg CO₂  →  Last week avg: ${lastWeekAvg.toFixed(2)} kg CO₂`);
    console.log(
      ` Trend: ${lastWeekAvg < firstWeekAvg ? '↓ improving' : '↑ worsening'} (${Math.abs(
        (((firstWeekAvg - lastWeekAvg) / firstWeekAvg) * 100)
      ).toFixed(1)}% change)\n`
    );

    console.log(' 30-day daily logs seeded successfully!');
    console.log(
      `\n Next: Log in as ${user.email} and verify the dashboard shows a ${NUM_DAYS}-day history, ` +
      `streak displays as ${streak.current} days, and the AI mitigation plan / carbon mirror ` +
      `30-day-trigger features are now unlocked.\n`
    );

    process.exit(0);
  } catch (error) {
    console.error(' Seed failed:', error.message);
    process.exit(1);
  }
}

seedDailyLogs();