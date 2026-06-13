const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Layer Import
const authRoutes = require('./routes/auth.routes');
const calculatorRoutes = require('./routes/calculator.routes');
const mitigationRoutes = require('./routes/mitigation.routes');
const gradingRoutes = require('./routes/grading.routes');

// Centralized Error Handling Middleware Import
const errorHandler = require('./middlewares/errorHandler.middleware');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Mount your N-Layer API Routes
app.use('/api/auth', authRoutes);             // For Signup & Login
app.use('/api/calculator', calculatorRoutes); // For Daily Tracking & Carbon Mirror
app.use('/api/mitigation', mitigationRoutes); // For 1-Month AI Recommendations
app.use('/api/grading', gradingRoutes);       // For Streaks & Practical Mark Reports

app.get('/', (req, res) => {
  res.send('Neo Karma API running');
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
