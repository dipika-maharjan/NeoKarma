require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

const schoolAdmins = [
  {
    name: 'Greenfield International School',
    email: 'admin@greenfield.edu.np',
    password: 'ChangeMe123!',
    role: 'school_admin',
    schoolName: 'Greenfield International School'
  },
  {
    name: 'Everest Academy',
    email: 'admin@everest.edu.np',
    password: 'ChangeMe123!',
    role: 'school_admin',
    schoolName: 'Everest Academy'
  }
];

async function seedSchoolAdmins() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    for (const admin of schoolAdmins) {
      const existing = await User.findOne({ email: admin.email });
      if (existing) {
        console.log(`Admin already exists: ${admin.email}`);
        continue;
      }

      const passwordHash = await bcrypt.hash(admin.password, 10);
      const created = await User.create({
        name: admin.name,
        email: admin.email,
        passwordHash,
        role: admin.role,
        schoolName: admin.schoolName,
        schoolId: null,
        grade: null,
        locationType: null,
        practicalMarks: {
          currentStreak: 0,
          longestStreak: 0,
          totalLogDays: 0,
          marksAwarded: 0,
          lastSyncedAt: null
        }
      });

      created.schoolId = created._id;
      await created.save();

      console.log('DEMO CREDENTIALS — CHANGE IN PRODUCTION');
      console.log(`Email: ${admin.email}`);
      console.log(`Password: ${admin.password}`);
      console.log(`School Admin ID: ${created._id}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('School admin seed failed:', error.message);
    process.exit(1);
  }
}

seedSchoolAdmins();
