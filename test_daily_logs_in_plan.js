/**
 * Test script to verify that /api/mitigation-plan endpoint returns dailyLogs
 */
const base = 'http://localhost:5000/api';

const testUser = {
  email: 'testuser_tracking@example.com',
  password: 'password123'
};

const newUserPayload = {
  name: 'Test User Tracking',
  email: testUser.email,
  password: testUser.password,
  grade: 10,
  locationType: 'urban',
  schoolName: 'Test School',
  extraProfile: {
    questionKey: 'internetUsageHours',
    value: 3
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

const getJson = async (url, token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const resp = await fetch(url, { method: 'GET', headers });
  const text = await resp.text();
  return { status: resp.status, body: text };
};

(async () => {
  try {
    console.log('\n========== TEST: Verify dailyLogs in Plan Response ==========\n');

    // Step 1: Try to login existing test user
    console.log('1️⃣ Attempting to login...');
    let loginResult = await postJson(`${base}/auth/login`, testUser);
    console.log('   Status:', loginResult.status);
    
    let token = null;
    let userId = null;

    if (loginResult.status === 200) {
      console.log('   ✅ Login successful');
      const loginData = JSON.parse(loginResult.body);
      token = loginData.data?.token;
      userId = loginData.data?.user?._id;
    } else {
      // If login fails, register new user
      console.log('   ⚠️ Login failed, registering new user...');
      const registerResult = await postJson(`${base}/auth/register`, newUserPayload);
      console.log('   Register Status:', registerResult.status);
      
      if (registerResult.status === 201) {
        const registerData = JSON.parse(registerResult.body);
        token = registerData.data?.token;
        userId = registerData.data?.user?._id;
        console.log('   ✅ Registration successful');
      } else {
        console.log('   ❌ Registration failed:', registerResult.body);
        return;
      }
    }

    if (!token || !userId) {
      console.log('   ❌ No token or userId obtained');
      return;
    }

    // Step 2: Submit a daily log (so we have data)
    console.log('\n2️⃣ Submitting a daily log...');
    const logPayload = {
      transportationMode: 'bus',
      transportationDistanceKm: 10,
      foodMealType: 'vegetarian',
      wasteAndPlasticCount: 2,
      energyUsageHours: 2,
      extraAnswer: {
        questionKey: 'internetUsageHours',
        value: 3
      }
    };

    const logResult = await postJson(`${base}/daily-log`, logPayload, token);
    console.log('   Status:', logResult.status);
    if (logResult.status === 201 || logResult.status === 200) {
      console.log('   ✅ Daily log submitted');
      const logData = JSON.parse(logResult.body);
      console.log('   Log ID:', logData.data?._id);
    } else {
      console.log('   ⚠️ Log submit response:', logResult.body.substring(0, 200));
    }

    // Submit multiple logs to test tracking
    console.log('\n   Submitting 3 more logs for better tracking data...');
    for (let i = 0; i < 3; i++) {
      const variedLog = {
        transportationMode: i % 2 === 0 ? 'bus' : 'bicycle',
        transportationDistanceKm: 5 + i * 2,
        foodMealType: i % 2 === 0 ? 'vegetarian' : 'vegan',
        wasteAndPlasticCount: i + 1,
        energyUsageHours: 2 - i * 0.3,
        extraAnswer: {
          questionKey: 'internetUsageHours',
          value: 2 + i
        }
      };
      const res = await postJson(`${base}/daily-log`, variedLog, token);
      console.log(`   Log ${i + 2}: Status ${res.status}`);
    }

    // Step 3: GET the mitigation plan and check for dailyLogs
    console.log('\n3️⃣ Fetching mitigation plan...');
    const planResult = await getJson(`${base}/mitigation-plan`, token);
    console.log('   Status:', planResult.status);

    if (planResult.status === 200) {
      const planData = JSON.parse(planResult.body);
      
      console.log('\n📋 PLAN RESPONSE STRUCTURE:');
      console.log('   Type:', planData.data?.type);
      console.log('   LogsCount:', planData.data?.logsCount);
      
      // CHECK IF dailyLogs IS IN RESPONSE
      const dailyLogs = planData.data?.dailyLogs;
      if (dailyLogs !== undefined) {
        console.log('\n   ✅ ✅ ✅ dailyLogs IS IN RESPONSE!');
        console.log('   dailyLogs length:', dailyLogs.length);
        if (dailyLogs.length > 0) {
          console.log('   First log structure:', JSON.stringify(dailyLogs[0], null, 2));
          
          // Verify the structure
          const firstLog = dailyLogs[0];
          console.log('\n   Checking field structure:');
          console.log('     - food.mealType:', firstLog.food?.mealType ? '✅' : '❌');
          console.log('     - transportation.mode:', firstLog.transportation?.mode ? '✅' : '❌');
          console.log('     - energy.usageHours:', firstLog.energy?.usageHours ? '✅' : '❌');
          console.log('     - wasteAndPlastic.segregated:', firstLog.wasteAndPlastic?.segregated !== undefined ? '✅' : '❌');
          console.log('     - breakdown.foodKg:', firstLog.breakdown?.foodKg ? '✅' : '❌');
          console.log('     - totalEmissionKg:', firstLog.totalEmissionKg ? '✅' : '❌');
        }
      } else {
        console.log('\n   ❌ ❌ ❌ dailyLogs NOT in response!');
        console.log('   Response keys:', Object.keys(planData.data));
      }

      console.log('\n   Full response:', JSON.stringify(planData, null, 2));
    } else {
      console.log('   ❌ Failed to fetch plan');
      console.log('   Response:', planResult.body);
    }

    console.log('\n========== TEST COMPLETE ==========\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
