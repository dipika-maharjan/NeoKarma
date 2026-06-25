const fetch = require('node-fetch');
const url = 'http://localhost:5000/api';
const email = `testuser${Date.now()}@example.com`;
const password = 'TestPass123!';

(async () => {
  try {
    const registerRes = await fetch(`${url}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'API Test User',
        email,
        password,
        grade: '10',
        section: 'A',
        locationType: 'urban'
      })
    });
    const registerJson = await registerRes.json();
    console.log('REGISTER STATUS', registerRes.status);
    console.log('REGISTER RESPONSE', JSON.stringify(registerJson, null, 2));
    if (!registerRes.ok) {
      process.exit(1);
    }
    const token = registerJson.data?.token;
    if (!token) {
      console.error('No token received from registration');
      process.exit(1);
    }
    console.log('TOKEN OK', token.slice(0, 20) + '...');

    const payload = {
      transportationMode: 'bus',
      transportationDistanceKm: 10,
      foodMealType: 'vegetarian',
      wasteAndPlasticCount: 2,
      energyUsageHours: 3,
      energyUsageKg: 0
    };

    const logRes = await fetch(`${url}/daily-log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const logJson = await logRes.json();
    console.log('STATUS', logRes.status);
    console.log(JSON.stringify(logJson, null, 2));
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  }
})();
