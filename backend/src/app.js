/**
 * Express App Configuration
 * Sets up middleware, database connection, and routes
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const config = require('./config/env');
const errorHandler = require('./middlewares/errorHandler.middleware');
const apiRoutes = require('./routes');
const AppError = require('./utils/AppError');

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request Logging Middleware
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Connect to MongoDB (async, but don't block app startup)
connectDB().catch((err) => {
  console.error('Failed to connect to MongoDB:', err.message);
  process.exit(1);
});

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: 'नेओकर्म (Neoकर्म) - Carbon Footprint Tracking API',
    version: '1.0.0',
    docs: '/api/health'
  });
});

// API Routes
app.use('/api', apiRoutes);

// 404 Handler
app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// Error Handler (must be last)
app.use(errorHandler);

module.exports = app;
