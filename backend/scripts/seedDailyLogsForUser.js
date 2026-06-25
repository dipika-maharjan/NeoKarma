/**
 * Seed Daily Logs — Smooth Realistic Trend Version
 */
require('dotenv').config({ path: '../.env' });

const mongoose = require('mongoose');
const User = require('../src/models/User');
const DailyLog = require('../src/models/DailyLog');
const emissionCalculationService = require('../src/services/emissionCalculation.service');

const NUM_DAYS = 90;

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Smooth interpolation helper
 */
function smoothStep(t) {
  return t * t * (3 - 2 * t);
}

/**
 * Core smooth arc generator (NO PHASE JUMPS)
 */
function buildArcProgress(dayIndex) {
  const t = dayIndex / NUM_DAYS; // 0 → 1

  let base = 1 - smoothStep(t); // smooth decay

  // mild weekly lifestyle cycle (weekends higher emissions)
  const weekly = Math.sin(dayIndex * (2 * Math.PI) / 7) * 0.04;

  // tiny randomness (prevents artificial straight line)
  const noise = (Math.random() - 0.5) * 0.025;

  return Math.max(0, Math.min(1, base + weekly + noise));
}

/**
 * Smooth behavior mapping (NO BUCKETING)
 */
function pickTransport(p) {
  if (p > 0.7) return 'car';
  if (p > 0.45) return 'motorbike';
  if (p > 0.2) return 'bus';
  return 'walk';
}

function pickMeal(p) {
  if (p > 0.7) return 'non-vegetarian';
  if (p > 0.45) return 'mixed';
  if (p > 0.2) return 'vegetarian';
  return 'vegan';
}

/**
 * Main log builder
 */
function buildLogEntry(dayIndex, dateStr) {
  const p = buildArcProgress(dayIndex);

  return {
    date: dateStr,
    arc: p, // optional debug field

    transportation: {
      mode: pickTransport(p),
      distanceKm: +(18 - p * 14).toFixed(2)
    },

    food: {
      mealType: pickMeal(p),
      foodWasteGrams: Math.round(10 + p * 140)
    },

    wasteAndPlastic: {
      plasticItemCount: Math.round(p * 8),
      segregated: p < 0.35
    },

    energy: {
      usageHours: Math.round(2 + p * 6)
    }
  };
}

/**
 * Seed runner
 */
async function seedDailyLogs() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const targetEmail = process.argv[2] || 'guragainaruna@gmail.com';
    const user = await User.findOne({ email: targetEmail });
    if (!user) throw new Error(`User not found for email: ${targetEmail}`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dates = [];

    for (let i = NUM_DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(formatDate(d));
    }

    const logs = [];

    for (let i = 0; i < dates.length; i++) {
      const entry = buildLogEntry(i, dates[i]);

      const emissionResult = await emissionCalculationService.calculateEmissions({
        transportationMode: entry.transportation.mode,
        transportationDistanceKm: entry.transportation.distanceKm,
        foodMealType: entry.food.mealType,
        wasteAndPlasticCount: entry.wasteAndPlastic.plasticItemCount,
        energyUsageHours: entry.energy.usageHours,
        energyUsageKg: 0
      });

      const log = await DailyLog.findOneAndUpdate(
        { userId: user._id, date: entry.date },
        {
          userId: user._id,
          date: entry.date,
          ...entry,
          breakdown: emissionResult.breakdown,
          totalEmissionKg: emissionResult.totalEmissionKg,
          createdAt: new Date()
        },
        { upsert: true, new: true }
      );

      logs.push(log);
    }

    // streak update (unchanged logic)
    const streakLogs = await DailyLog.find({ userId: user._id }).sort({ date: 1 });

    let current = 1;
    let longest = 1;

    for (let i = 1; i < streakLogs.length; i++) {
      const prev = new Date(streakLogs[i - 1].date);
      const curr = new Date(streakLogs[i].date);
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);

      if (diff === 1) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 1;
      }
    }

    await User.findByIdAndUpdate(user._id, {
      streak: {
        current,
        longest,
        lastLogDate: dates[dates.length - 1]
      }
    });
    process.exit(0);

  } catch (err) {
    process.exit(1);
  }
}

seedDailyLogs();