/**
 * Streak Reminder Service
 *
 * Every 15 minutes, checks users who:
 *  1. Have an active streak (streak.current >= 1)
 *  2. Have NOT logged today
 *  3. Are within a 15-minute window that is ~30 min before their typical log time
 *
 * Typical log time is derived from the createdAt timestamps of their last 7 logs
 * converted to Nepal Standard Time (UTC+5:45).
 *
 * A in-memory Set tracks who has already received a reminder today to avoid
 * duplicate emails. The Set resets every midnight via its own cron.
 */

const cron = require('node-cron');
const User = require('../models/User');
const DailyLog = require('../models/DailyLog');
const sendEmail = require('../utils/sendEmail');
const { getTodayStr } = require('../utils/dateHelpers');

const NEPAL_OFFSET_MS = (5 * 60 + 45) * 60 * 1000; // 5h 45m in ms
const REMINDER_LEAD_MINUTES = 30;  // send reminder this many minutes BEFORE usual log time
const POLL_INTERVAL_MINUTES = 15;  // cron frequency

// Tracks users already reminded today  →  { 'userId_YYYY-MM-DD': true }
let remindedToday = new Set();

/**
 * Convert a UTC Date to Nepal local hour and minute (0-23, 0-59)
 */
function toNepalHourMin(date) {
  const nepalMs = date.getTime() + NEPAL_OFFSET_MS;
  const nepalDate = new Date(nepalMs);
  return { hour: nepalDate.getUTCHours(), minute: nepalDate.getUTCMinutes() };
}

/**
 * Get Nepal local time right now as { hour, minute }
 */
function nowNepal() {
  return toNepalHourMin(new Date());
}

/**
 * Compute the average log time (hour + minute) from the user's recent logs.
 * Returns { hour, minute } in Nepal time, or null if no logs found.
 */
async function getTypicalLogTime(userId) {
  const recentLogs = await DailyLog.find({ userId })
    .sort({ createdAt: -1 })
    .limit(7)
    .select('createdAt');

  if (!recentLogs.length) return null;

  // Convert each createdAt to Nepal time and collect hour+minute as total minutes
  const totalMinutesList = recentLogs.map((log) => {
    const { hour, minute } = toNepalHourMin(new Date(log.createdAt));
    return hour * 60 + minute;
  });

  // Average, handling midnight wrap-around via circular mean
  // (simple linear mean is good enough for typical usage patterns that don't span midnight)
  const avgTotalMinutes = Math.round(
    totalMinutesList.reduce((sum, m) => sum + m, 0) / totalMinutesList.length
  );

  return {
    hour: Math.floor(avgTotalMinutes / 60) % 24,
    minute: avgTotalMinutes % 60
  };
}

/**
 * Check whether now (Nepal time) falls within the reminder window:
 * [typicalTime - REMINDER_LEAD_MINUTES - POLL_INTERVAL_MINUTES/2,
 *  typicalTime - REMINDER_LEAD_MINUTES + POLL_INTERVAL_MINUTES/2]
 *
 * This gives a ±7.5 minute window around the "30 min before" target,
 * ensuring the 15-min poll always catches it once.
 */
function isInReminderWindow(typicalHour, typicalMinute) {
  const { hour: nowHour, minute: nowMinute } = nowNepal();
  const nowTotal = nowHour * 60 + nowMinute;

  // Target = typical time minus lead minutes
  let targetTotal = typicalHour * 60 + typicalMinute - REMINDER_LEAD_MINUTES;
  if (targetTotal < 0) targetTotal += 24 * 60; // wrap past midnight

  const halfPoll = POLL_INTERVAL_MINUTES / 2;
  const lower = (targetTotal - halfPoll + 24 * 60) % (24 * 60);
  const upper = (targetTotal + halfPoll) % (24 * 60);

  // Handle window that crosses midnight
  if (lower <= upper) {
    return nowTotal >= lower && nowTotal <= upper;
  } else {
    return nowTotal >= lower || nowTotal <= upper;
  }
}

/**
 * Build the HTML reminder email body
 */
function buildEmailHtml(userName, streakCount, typicalHour, typicalMinute) {
  const pad = (n) => String(n).padStart(2, '0');
  const ampm = typicalHour >= 12 ? 'PM' : 'AM';
  const displayHour = typicalHour % 12 || 12;
  const displayTime = `${displayHour}:${pad(typicalMinute)} ${ampm}`;

  const flames = streakCount >= 10 ? '🔥🔥🔥' : streakCount >= 5 ? '🔥🔥' : '🔥';

  return `
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
          ${flames} ${streakCount}
        </p>
        <p style="color: #a8d5b5; margin: 8px 0 0; font-size: 15px;">
          day${streakCount === 1 ? '' : 's'} and counting!
        </p>
      </div>

      <p style="color: #303542; font-size: 15px; line-height: 1.6; margin: 0 0 12px;">
        Hi <strong>${userName}</strong>,
      </p>
      <p style="color: #303542; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
        You usually log your daily activity around <strong>${displayTime}</strong> — that's coming up soon!
        Don't let your <strong>${streakCount}-day streak</strong> slip away. It only takes a minute to log today.
      </p>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${process.env.FRONTEND_ORIGIN || 'http://localhost:3000'}/dashboard"
           style="background: #0A3D25; color: #ffffff; padding: 14px 32px; border-radius: 8px;
                  text-decoration: none; font-size: 15px; font-weight: 700; display: inline-block;">
          Log Today's Activity →
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #c8e6d4; margin: 24px 0;" />

      <p style="color: #7a9a85; font-size: 12px; text-align: center; margin: 0; line-height: 1.6;">
        You're getting this because you have an active streak on Neoकर्म.<br/>
        Keep going — every day counts for the planet! 🌱
      </p>
    </div>
  `;
}

class StreakReminderService {
  /**
   * Core job: find eligible users and send reminders
   */
  async sendStreakReminders() {
    const today = getTodayStr();

    try {
      // Find users with active streak who haven't logged today
      const usersAtRisk = await User.find({
        'streak.current': { $gte: 1 },
        'streak.lastLogDate': { $ne: today },
        isActive: true,
        role: 'student'
      }).select('_id name email streak');

      for (const user of usersAtRisk) {
        const reminderKey = `${user._id}_${today}`;

        // Skip if already reminded today
        if (remindedToday.has(reminderKey)) continue;

        // Get their typical log time
        const typicalTime = await getTypicalLogTime(user._id);

        // New users with no history get a fallback window: remind between 6–9 PM NPT
        // (i.e., treat typical time as 7 PM so reminder fires at 6:30 PM)
        const { hour, minute } = typicalTime || { hour: 19, minute: 0 };

        // Check if now is in the reminder window
        if (!isInReminderWindow(hour, minute)) continue;

        // Send email
        try {
          await sendEmail({
            email: user.email,
            subject: `🔥 Don't break your ${user.streak.current}-day streak, ${user.name.split(' ')[0]}!`,
            message: `Hi ${user.name}, you usually log around this time. Don't let your ${user.streak.current}-day streak end today! Visit ${process.env.FRONTEND_ORIGIN}/dashboard to log now.`,
            html: buildEmailHtml(user.name, user.streak.current, hour, minute)
          });

          remindedToday.add(reminderKey);
          console.log(`✅ Streak reminder sent to ${user.email} (streak: ${user.streak.current})`);
        } catch (emailErr) {
          console.error(`❌ Failed to send streak reminder to ${user.email}:`, emailErr.message);
        }
      }
    } catch (err) {
      console.error('❌ Streak reminder job error:', err.message);
    }
  }

  /**
   * Start the cron jobs:
   *  - Every 15 minutes: check and send reminders
   *  - Every midnight (NPT = 18:15 UTC): reset the reminded-today Set
   */
  startCronScheduler() {
    // Poll every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
      await this.sendStreakReminders();
    });

    // Reset the daily reminder Set at midnight NPT (18:15 UTC)
    cron.schedule('15 18 * * *', () => {
      remindedToday = new Set();
      console.log('🔄 Streak reminder daily Set reset at midnight NPT');
    });

    console.log('🔔 Streak reminder cron started (polls every 15 min)');
  }
}

module.exports = new StreakReminderService();
