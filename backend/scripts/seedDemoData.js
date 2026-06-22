const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env')
});

const User = require('../src/models/User');
const DailyLog = require('../src/models/DailyLog');
const emissionCalculationService = require('../src/services/emissionCalculation.service');

function randomBetween(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const SCHOOL_ADMINS = [
  {
    name: 'Greenfield International School',
    email: 'admin@greenfield.edu.np',
    password: 'ChangeMe123!',
    schoolName: 'Greenfield International School'
  },
  {
    name: 'Everest Academy',
    email: 'admin@everest.edu.np',
    password: 'ChangeMe123!',
    schoolName: 'Everest Academy'
  }
];

const STUDENT_NAMES = [
  'Lamsal Ashim',
  'Sita Thapa',
  'Rahul KC',
  'Preeti Jha',
  'Ananya Gurung',
  'Rohan Shrestha',
  'Dipika Maharjan',
  'Bikash Tamang',
  'Nisha Rai',
  'Suman Adhikari',
  'Priya Basnet',
  'Arjun Pokhrel',
  'Manisha Pandey',
  'Samir Lama',
  'Kritika Karki',
  'Aashish Poudel',
  'Binita Magar',
  'Rajan Ghimire',
  'Sunita Shrestha',
  'Nabin Tiwari'
];

const GRADES = [8, 9, 10, 11, 12];
const SECTIONS = ['A', 'B', 'C'];
const LOCATION_TYPES = ['urban', 'rural'];

function normalizeEmail(name) {
  return name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '');
}

async function seed() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('Missing MongoDB connection string. Set MONGO_URI or MONGODB_URI.');
  }

  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB');

  await DailyLog.deleteMany({});
  await User.deleteMany({ role: 'student' });
  await User.deleteMany({
    email: { $in: SCHOOL_ADMINS.map((admin) => admin.email) }
  });
  console.log('🗑  Cleared old seed data');

  const createdAdmins = [];

  for (const admin of SCHOOL_ADMINS) {
    const passwordHash = await bcrypt.hash(admin.password, 10);
    const created = await User.create({
      name: admin.name,
      email: admin.email,
      passwordHash,
      role: 'school_admin',
      schoolName: admin.schoolName,
      isActive: true
    });

    await User.findByIdAndUpdate(created._id, { $set: { schoolId: created._id } });
    createdAdmins.push(created);
    console.log(`🏫 Created admin: ${created.email}`);
  }

  const primarySchoolAdmin = createdAdmins[0];
  const students = [];

  for (let index = 0; index < STUDENT_NAMES.length; index += 1) {
    const name = STUDENT_NAMES[index];
    const grade = GRADES[index % GRADES.length];
    const section = SECTIONS[index % SECTIONS.length];
    const streak = randomInt(0, 21);
    const totalLogDays = randomInt(streak, 30);
    const email = `${normalizeEmail(name)}@student.np`;
    const passwordHash = await bcrypt.hash('Student123!', 10);

    const student = await User.create({
      name,
      email,
      passwordHash,
      role: 'student',
      grade,
      section,
      locationType: pickRandom(LOCATION_TYPES),
      schoolId: primarySchoolAdmin._id,
      schoolName: primarySchoolAdmin.schoolName,
      isActive: true,
      streak: {
        current: streak,
        longest: Math.max(streak, streak + randomInt(0, 5)),
        lastLogDate: daysAgo(randomInt(0, 5)).toISOString().slice(0, 10),
        participationScore: randomInt(0, 100)
      },
      practicalMarks: {
        currentStreak: streak,
        longestStreak: Math.max(streak, streak + randomInt(0, 5)),
        totalLogDays,
        lastSyncedAt: streak > 0
          ? daysAgo(randomInt(0, 2))
          : daysAgo(5)
      }
    });

    students.push(student);
    console.log(
      `👩‍🎓 Created student: ${student.name} (Grade ${student.grade}, streak ${student.practicalMarks.currentStreak})`
    );
  }

  const allLogs = [];

  // Weekday patterns — students emit more
  // on weekdays (school days) and less on weekends
  function getDayMultiplier(dayOffset) {
    const date = new Date()
    date.setDate(date.getDate() - dayOffset)
    const dayOfWeek = date.getDay()
    // 0=Sunday, 6=Saturday
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return 0.5  // weekend — much lower
    }
    return 1.0    // weekday — normal
  }

  // Weekly spikes — simulate events
  // Week 1: high (exam week, more car usage)
  // Week 2: drop (awareness drive)
  // Week 3: spike (festival, firewood)
  // Week 4: recovery (normal)
  function getWeekMultiplier(dayOffset) {
    if (dayOffset >= 25) return 1.4  // week 1 high
    if (dayOffset >= 18) return 0.7  // week 2 low
    if (dayOffset >= 11) return 1.5  // week 3 spike
    if (dayOffset >= 4)  return 0.9  // week 4 recovery
    return 1.1                       // this week normal
  }

  // Updated emission profiles with wider ranges
  const EMISSION_PROFILE = {
    8:  {
      transport: [0.5, 5.5],
      food: [0.4, 2.5],
      energy: [0.2, 2.0]
    },
    9:  {
      transport: [0.4, 4.5],
      food: [0.3, 2.2],
      energy: [0.2, 1.8]
    },
    10: {
      transport: [0.3, 4.0],
      food: [0.3, 2.0],
      energy: [0.1, 1.5]
    },
    11: {
      transport: [0.2, 3.5],
      food: [0.2, 1.8],
      energy: [0.1, 1.3]
    },
    12: {
      transport: [0.1, 3.0],
      food: [0.2, 1.5],
      energy: [0.1, 1.0]
    }
  }

  for (const student of students) {
    const logCount = randomInt(5, 28);
    const chosenOffsets = new Set();

    while (chosenOffsets.size < logCount) {
      chosenOffsets.add(randomInt(0, 29));
    }

    for (const dayOffset of chosenOffsets) {
      const dayMult = getDayMultiplier(dayOffset)
      const weekMult = getWeekMultiplier(dayOffset)
      const combined = dayMult * weekMult

      const profile = EMISSION_PROFILE[student.grade]
        || EMISSION_PROFILE[10]

      // Apply combined multiplier to base ranges
      const transportEmission = parseFloat(
        (randomBetween(...profile.transport)
          * combined).toFixed(2)
      )
      const foodEmission = parseFloat(
        (randomBetween(...profile.food)
          * combined).toFixed(2)
      )
      const energyEmission = parseFloat(
        (randomBetween(...profile.energy)
          * combined).toFixed(2)
      )

      const meatFreeDay = Math.random() > (
        combined > 1.2 ? 0.6 : 0.3
      )  // less likely to be meat-free on high days

      const usedPlastic = Math.random() > (
        combined > 1.2 ? 0.3 : 0.6
      )  // more plastic on high emission days

      const wastedFood = Math.random() > 0.5

      const wasteEmission = parseFloat(
        ((usedPlastic ? 0.15 : 0)
          + (wastedFood ? 0.4 : 0)).toFixed(2)
      )

      let totalEmissionKg = parseFloat(
        (transportEmission + foodEmission
          + energyEmission + wasteEmission).toFixed(2)
      )

      // Cap at realistic max
      totalEmissionKg = Math.min(totalEmissionKg, 8.0)

      const logDate = daysAgo(dayOffset);
      const transportationMode = pickRandom(['walk', 'bicycle', 'bus', 'motorbike', 'car']);
      const transportationDistanceKm = randomBetween(0.5, 8);
      const foodWasteGrams = randomInt(0, 60);
      const plasticItemCount = randomInt(0, 8);
      const usageHours = randomBetween(0.5, 6);
      const firewoodKg = randomBetween(0, 2);

      allLogs.push({
        userId: student._id,
        date: logDate.toISOString().slice(0, 10),
        transportation: {
          mode: transportationMode,
          distanceKm: transportationDistanceKm
        },
        food: {
          mealType: meatFreeDay
            ? pickRandom(['vegetarian', 'vegan'])
            : pickRandom(['mixed', 'non-vegetarian']),
          foodWasteGrams
        },
        wasteAndPlastic: {
          plasticItemCount,
          segregated: Math.random() > 0.3
        },
        energy: {
          usageHours,
          firewoodKg
        },
        extraAnswer: {
          questionKey: null,
          value: null
        },
        breakdown: {
          transportKg: transportEmission,
          foodKg: foodEmission,
          wasteKg: wasteEmission,
          energyKg: energyEmission
        },
        totalEmissionKg,
        createdAt: logDate
      });
    }
  }

  if (allLogs.length > 0) {
    await DailyLog.insertMany(allLogs);
  }

  console.log(`📄 Created ${allLogs.length} demo logs`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠  DEMO CREDENTIALS — CHANGE IN PRODUCTION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  for (const admin of SCHOOL_ADMINS) {
    console.log(`Admin: ${admin.email} | Password: ${admin.password} | School: ${admin.schoolName}`);
  }

  for (const student of students.slice(0, 3)) {
    console.log(`Student: ${student.email} | Password: Student123!`);
  }

  console.log(`\nCounts -> Admins: ${createdAdmins.length} | Students: ${students.length} | Logs: ${allLogs.length}`);

  await mongoose.disconnect();
  console.log('\n✅ Seed complete!');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
