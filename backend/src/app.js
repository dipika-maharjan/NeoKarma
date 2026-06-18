/**
 * Express App Configuration
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/db');
const config = require('./config/env');

const errorHandler = require('./middlewares/errorHandler.middleware');
const apiRoutes = require('./routes');
const AppError = require('./utils/AppError');
const mongoose = require('mongoose');

const app = express();

/* ---------------- TRUST PROXY ---------------- */
app.set('trust proxy', 1);

/* ---------------- SECURITY ---------------- */
app.use(helmet());

/* ---------------- CORS ---------------- */
app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

/* ---------------- BODY PARSER ---------------- */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

/* ---------------- LOGGING ---------------- */
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

/* ---------------- DB CONNECTION ---------------- */
connectDB().then((conn) => {
  if (conn) console.log('DB ready');
});

/* ---------------- HEALTH CHECK ---------------- */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

/* ---------------- ROOT ---------------- */
app.get('/', (req, res) => {
  res.json({
    message: 'नेओकर्म (Neoकर्म) - Carbon Footprint Tracking API',
    version: '1.0.0',
    docs: '/api/health'
  });
});

/* ---------------- ROUTES ---------------- */
app.use('/api', apiRoutes);

/* ---------------- 404 ---------------- */
app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

/* ---------------- ERROR HANDLER ---------------- */
app.use(errorHandler);

module.exports = app;