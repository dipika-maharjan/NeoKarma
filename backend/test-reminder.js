require('dotenv').config();
const mongoose = require('mongoose');
const config = require('./src/config/env');
const User = require('./src/models/User');
const streakReminderService = require('./src/services/streakReminder.service');

// Replace with the email address you want to test with
const TEST_EMAIL = 'guragainaruna@gmail.com';

async function testReminder() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log('Connected to MongoDB');

    // Grab any student user from the database to test with
    // You can also change the email here to send to your specific email:
    const user = await User.findOne({ email: 'guragainaruna@gmail.com' });
    if (!user) {
      console.log('No student users found in the database. Please create a user first.');
      process.exit(1);
    }

    console.log(`Found user: ${user.name}`);
    console.log(`Current streak: ${user.streak.current}`);

    // Force send the reminder
    const now = new Date();
    // Simulate typical time as "right now" for testing purposes
    const testHour = now.getHours();
    const testMinute = now.getMinutes();

    const buildEmailHtml = require('./src/services/streakReminder.service').__get__ ? 
                           require('./src/services/streakReminder.service').__get__('buildEmailHtml') : null;
    
    // We'll just recreate the email builder here for the test script to guarantee it works
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;
                  border: 1px solid #d4e6dc; border-radius: 12px; background: #f4faf6;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0A3D25; margin: 0; font-size: 28px;">Neoकर्म</h1>
          <p style="color: #5a9070; margin: 4px 0 0; font-size: 13px;">Carbon Footprint Tracker</p>
        </div>
        <div style="background: #0A3D25; border-radius: 10px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="color: #a8d5b5; margin: 0 0 8px; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">
            Your Current Streak
          </p>
          <p style="color: #ffffff; font-size: 56px; font-weight: 900; margin: 0; line-height: 1;">
            🔥 ${user.streak.current || 5}
          </p>
        </div>
        <p style="color: #303542; font-size: 15px; line-height: 1.6; margin: 0 0 12px;">
          Hi <strong>${user.name}</strong>,
        </p>
        <p style="color: #303542; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
          This is a TEST reminder. In production, this would remind you to log your activity!
        </p>
      </div>
    `;

    const sendEmail = require('./src/utils/sendEmail');
    await sendEmail({
      email: user.email,
      subject: `[TEST]  Don't break your ${user.streak.current || 5}-day streak!`,
      message: `Test reminder for ${user.name}`,
      html: html
    });

    console.log(` Test reminder sent successfully to ${user.email}`);
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testReminder();
