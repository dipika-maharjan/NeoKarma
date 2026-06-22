/**
 * Seed Daily Logs for Test User — Past 3 Months (90 Days)
 * Populates realistic daily log data for guragainaruna@gmail.com
 * for the past 90 days to demonstrate long-term streaks, dashboard trends,
 * carbon mirror, and advanced mitigation plan eligibility.
 *
 * Run: npm run seed:logs
 */
require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const DailyLog = require('../src/models/DailyLog');
const emissionFactorRepository = require('../src/repositories/emissionFactor.repository');

const NUM_DAYS = 90; // 3 months of history

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
    .limit(NUM_DAYS + 5);

  if (logs.length === 0) return { current: 0, longest: 0 };

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
  }

  return { current: currentStreak, longest: longestStreak };
}

/**
 * Build a realistic, macro-progressive log entry over 90 days.
 * * - Month 1 (Days 0-29): High carbon habits (unaware phase)
 * - Month 2 (Days 30-59): Transitional habits (awareness phase)
 * - Month 3 (Days 60-89): Sustainable habits (optimized phase)
 */
function buildLogEntryForDay(dayIndex, dateStr) {
  let transportCycle, mealCycle;
  let plasticItemCount, foodWasteGrams, energyHours, segregated;

  // Distances matched to transportation modes
  const distanceByMode = { walk: 1.5, bicycle: 4, bus: 8, motorbike: 6, car: 12 };

  if (dayIndex < 30) {
    // --- MONTH 1: Heavy carbon footprint ---
    transportCycle = ['car', 'motorbike', 'bus', 'car', 'motorbike', 'walk', 'bus'];
    mealCycle = ['non-vegetarian', 'mixed', 'non-vegetarian', 'mixed', 'vegetarian', 'non-vegetarian', 'mixed'];
    
    plasticItemCount = dayIndex % 3 === 0 ? 3 : 2;
    foodWasteGrams = dayIndex % 2 === 0 ? 80 : 40;
    energyHours = 6;
    segregated = false;

  } else if (dayIndex < 60) {
    // --- MONTH 2: Making conscious changes ---
    transportCycle = ['bus', 'motorbike', 'bicycle', 'bus', 'walk', 'car', 'bicycle'];
    mealCycle = ['mixed', 'vegetarian', 'mixed', 'non-vegetarian', 'vegetarian', 'mixed', 'vegan'];
    
    plasticItemCount = dayIndex % 4 === 0 ? 1 : 2;
    foodWasteGrams = dayIndex % 3 === 0 ? 40 : 0;
    energyHours = 4;
    segregated = dayIndex % 2 === 0; // starts recycling half the time

  } else {
    // --- MONTH 3: Highly sustainable eco-champ ---
    transportCycle = ['walk', 'bicycle', 'bus', 'walk', 'bicycle', 'bus', 'car']; // car only once a week max
    mealCycle = ['vegetarian', 'vegan', 'vegetarian', 'mixed', 'vegan', 'vegetarian', 'vegan'];
    
    plasticItemCount = dayIndex % 5 === 0 ? 1 : 0; // mostly zero plastic
    foodWasteGrams = dayIndex % 7 === 0 ? 20 : 0; // minimal waste
    energyHours = 3;
    segregated = true; // completely locked in green habits
  }

  const transportMode = transportCycle[dayIndex % transportCycle.length];
  const mealType = mealCycle[dayIndex % mealCycle.length];
  const distanceKm = distanceByMode[transportMode] ?? 5;

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
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOne({ email: 'guragainaruna@gmail.com' });
    if (!user) {
      throw new Error('User guragainaruna@gmail.com not found. Please create the user first.');
    }

    // Found user; seeding logs (no verbose output)
    const userId = user._id;

    // Generate dates sequentially from 90 days ago up until today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateEntries = [];
    for (let i = NUM_DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dateEntries.push(formatDate(d));
    }

    // date range generated for seeding

    const logEntries = dateEntries.map((dateStr, idx) => buildLogEntryForDay(idx, dateStr));
    const createdLogs = [];

    for (const entry of logEntries) {
      const emissionResult = await calculateBreakdown(
        entry.transportation.mode,
        entry.transportation.distanceKm,
        entry.food.mealType,
        entry.wasteAndPlastic.plasticItemCount,
        entry.energy.usageHours
      );

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

    // Upsert complete

    // Calculate and save streak info
    const streak = await calculateStreak(userId);
    // Streak calculation completed

    try {
      const lastLogDate = dateEntries[dateEntries.length - 1];
      const newParticipation = (user.streak && user.streak.participationScore) ? user.streak.participationScore + createdLogs.length : createdLogs.length;
      
      await User.findByIdAndUpdate(userId, {
        streak: {
          current: streak.current,
          longest: streak.longest,
          lastLogDate,
          participationScore: newParticipation
        }
      }, { new: true, runValidators: true });

      // User streak persisted
    } catch (err) {
      console.warn('Could not persist streak to user document:', err.message);
    }

    // Performance Metrics / Trend calculation
    const totalCo2 = createdLogs.reduce((sum, log) => sum + log.totalEmissionKg, 0);
    const avgCo2 = totalCo2 / createdLogs.length;
    
    // Compare first 2 weeks vs last 2 weeks to calculate true progressive trend
    const firstTwoWeeksAvg = createdLogs.slice(0, 14).reduce((sum, log) => sum + log.totalEmissionKg, 0) / 14;
    const lastTwoWeeksAvg = createdLogs.slice(-14).reduce((sum, log) => sum + log.totalEmissionKg, 0) / 14;

    // Summary metrics suppressed

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seedDailyLogs();