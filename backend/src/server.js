/**
 * Server Entry Point
 */
const app = require('./app');
const config = require('./config/env');
const mitigationPlanService = require('./services/mitigationPlan.service');
const streakReminderService = require('./services/streakReminder.service');

const PORT = config.PORT || 5000;

/* ---------------- START SERVER ---------------- */
const server = app.listen(PORT, () => {
  console.log(`NeoKarma Backend Running on PORT: ${PORT}`);

  // Delay cron to prevent startup blocking
  setTimeout(() => {
    try {
      mitigationPlanService.startCronScheduler();
      console.log('Cron scheduler started');
    } catch (err) {
      console.error('Cron scheduler error:', err.message);
    }

    try {
      streakReminderService.startCronScheduler();
    } catch (err) {
      console.error('Streak reminder cron error:', err.message);
    }
  }, 10000);
});

/* ---------------- GRACEFUL SHUTDOWN ---------------- */
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received');
  server.close(() => process.exit(0));
});

/* ---------------- UNHANDLED ERRORS ---------------- */
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // DO NOT kill server on Render (prevents downtime during demo)
});