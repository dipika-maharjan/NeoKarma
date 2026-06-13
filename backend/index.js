const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Layer Import
const carbonRoutes = require('./routes/carbon.routes');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Mount your N-Layer API Routes
app.use('/api/carbon', carbonRoutes);

app.get('/', (req, res) => {
  res.send('Neo Karma API running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
