const base = 'http://localhost:5000/api';
const loginPayload = {
  email: 'aarav@example.com',
  password: 'password123'
};

const registerPayload = {
  name: 'Aarav Sharma',
  email: 'aarav@example.com',
  password: 'password123',
  grade: 10,
  locationType: 'urban',
  schoolName: 'ABC International School',
  extraProfile: {
    questionKey: 'internetUsageHours',
    value: 5
  }
};

const dailyLogPayload = {
  transportationMode: 'bus',
  transportationDistanceKm: 15,
  foodMealType: 'vegetarian',
  wasteAndPlasticCount: 2,
  energyUsageHours: 3,
  extraAnswer: {
    questionKey: 'internetUsageHours',
    value: 4
  }
};

const postJson = async (url, body, token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  const text = await resp.text();
  return { status: resp.status, body: text };
};

(async () => {
  try {
    let loginResult = await postJson(`${base}/auth/login`, loginPayload);
    // Login attempt results suppressed

    let token = null;
    try {
      const loginJson = JSON.parse(loginResult.body);
      token = loginJson?.data?.token;
    } catch (err) {
      // ignore parse error
    }

    if (!token) {
      // Registration attempt suppressed

      if (registerResult.status === 201 || registerResult.status === 200) {
        loginResult = await postJson(`${base}/auth/login`, loginPayload);
        // Login retry suppressed
        try {
          const loginJson = JSON.parse(loginResult.body);
          token = loginJson?.data?.token;
        } catch (err) {}
      }
    }

    if (!token) {
      console.error('Token missing after login/register attempt');
      process.exit(1);
    }

    await postJson(`${base}/daily-log`, dailyLogPayload, token);
    await postJson(`${base}/daily-log`, dailyLogPayload, token);
  } catch (error) {
    console.error('ERROR:', error);
    process.exit(1);
  }
})();