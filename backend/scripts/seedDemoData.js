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

  for (const student of students) {
    const logCount = randomInt(5, 28);
    const chosenOffsets = new Set();

    while (chosenOffsets.size < logCount) {
      chosenOffsets.add(randomInt(0, 29));
    }

    for (const dayOffset of chosenOffsets) {
      const logDate = daysAgo(dayOffset);
      const meatFreeDay = Math.random() > 0.4;
      const mealType = meatFreeDay
        ? pickRandom(['vegetarian', 'vegan'])
        : pickRandom(['mixed', 'non-vegetarian']);

      const transportationMode = pickRandom(['walk', 'bicycle', 'bus', 'motorbike', 'car']);
      const transportationDistanceKm = randomBetween(0.5, 8);
      const foodWasteGrams = randomInt(0, 60);
      const plasticItemCount = randomInt(0, 8);
      const usageHours = randomBetween(0.5, 6);
      const firewoodKg = randomBetween(0, 2);

      const emissionResult = await emissionCalculationService.calculateEmissions({
        transportationMode,
        transportationDistanceKm,
        foodMealType: mealType,
        wasteAndPlasticCount: plasticItemCount,
        energyUsageHours: usageHours,
        energyFirewoodKg: firewoodKg
      });

      allLogs.push({
        userId: student._id,
        date: logDate.toISOString().slice(0, 10),
        transportation: {
          mode: transportationMode,
          distanceKm: transportationDistanceKm
        },
        food: {
          mealType,
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
        breakdown: emissionResult.breakdown,
        totalEmissionKg: emissionResult.totalEmissionKg,
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
