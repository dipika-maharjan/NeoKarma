require('dotenv').config({ path: '.env' });
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const config = require('../src/config/env');

(async () => {
  try {
    const userId = '6a3171e1a2d82ce7ed5928b2'; // guragainaruna
    const token = jwt.sign({ userId, email: 'guragainaruna@gmail.com', role: 'student' }, config.JWT_SECRET, { expiresIn: '7d' });

    // Build a simple daily log payload for today (Nepal local)
    const d = new Date();
    // compute Nepal local date
    const utc = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds());
    const nepalMs = utc + (5 * 60 + 45) * 60 * 1000;
    const todayNepal = new Date(nepalMs).toISOString().slice(0,10);

    const payload = {
      transportationMode: 'walk',
      transportationDistanceKm: 1.2,
      foodMealType: 'vegetarian',
      wasteAndPlasticCount: 0,
      energyUsageHours: 2,
      energyUsageKg: 0,
      date: todayNepal
    };

    const res = await fetch('http://localhost:5000/api/daily-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
