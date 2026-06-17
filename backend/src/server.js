/**
 * Server Entry Point
 * Starts the Express server
 */
const app = require('./app');
const config = require('./config/env');
const mitigationPlanService = require('./services/mitigationPlan.service');

const PORT = config.PORT;

const server = app.listen(PORT, () => {
  console.log(`neokarma Backend Server Running on Port: ${PORT.toString().padEnd(48)}               
  `);
  
  // Start the mitigation plan daily generation scheduler
  mitigationPlanService.startCronScheduler();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(' Unhandled Rejection:', err);
  process.exit(1);
});
