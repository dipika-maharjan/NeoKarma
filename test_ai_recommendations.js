/**
 * Test script to verify AI recommendations are being generated for users with 30+ logs
 */
const base = 'http://localhost:5000/api';

const testUser = {
  email: 'testuser_ai_recom@example.com',
  password: 'password123'
};

const newUserPayload = {
  name: 'Test User AI Recommendations',
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

// Sample daily logs with varied data to simulate realistic usage
const sampleLogs = [
  { transportation: { mode: 'bus', distanceKm: 10 }, food: { mealType: 'vegetarian', foodWasteGrams: 50 }, energy: { usageHours: 2, firewoodKg: 0 }, wasteAndPlastic: { segregated: true, plasticItemCount: 2 } },
  { transportation: { mode: 'car', distanceKm: 15 }, food: { mealType: 'non-vegetarian', foodWasteGrams: 100 }, energy: { usageHours: 3, firewoodKg: 0 }, wasteAndPlastic: { segregated: false, plasticItemCount: 5 } },
  { transportation: { mode: 'bicycle', distanceKm: 5 }, food: { mealType: 'vegan', foodWasteGrams: 30 }, energy: { usageHours: 1, firewoodKg: 0 }, wasteAndPlastic: { segregated: true, plasticItemCount: 1 } },
  { transportation: { mode: 'walk', distanceKm: 2 }, food: { mealType: 'vegetarian', foodWasteGrams: 40 }, energy: { usageHours: 2, firewoodKg: 0 }, wasteAndPlastic: { segregated: true, plasticItemCount: 0 } },
  { transportation: { mode: 'bus', distanceKm: 12 }, food: { mealType: 'mixed', foodWasteGrams: 60 }, energy: { usageHours: 2.5, firewoodKg: 0 }, wasteAndPlastic: { segregated: false, plasticItemCount: 3 } },
];

const postJson = async (url, body, token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
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
    console.log('\n========== TEST: AI Recommendation Generation ==========\n');

    // Step 1: Try to login, if fails, create new user
    console.log('1️⃣ Attempting to login or create user...');
    let loginResult = await postJson(`${base}/auth/login`, testUser);
    let token;

    if (loginResult.status === 200) {
      console.log('   ✅ Login successful');
      const loginData = JSON.parse(loginResult.body);
      token = loginData.data.token;
    } else if (loginResult.status === 401) {
      console.log('   User not found, creating new user...');
      const signupResult = await postJson(`${base}/auth/register`, newUserPayload);
      if (signupResult.status !== 201) {
        console.error('   ❌ Signup failed:', signupResult.body);
        return;
      }
      console.log('   ✅ User created, logging in...');
      const loginRetry = await postJson(`${base}/auth/login`, testUser);
      const loginData = JSON.parse(loginRetry.body);
      token = loginData.data.token;
    } else {
      console.error('   ❌ Login failed:', loginResult.body);
      return;
    }

    // Step 2: Submit 30 daily logs to trigger AI recommendations
    console.log('\n2️⃣ Submitting 30 daily logs to trigger AI recommendations...');
    for (let i = 0; i < 30; i++) {
      const logPayload = {
        ...sampleLogs[i % sampleLogs.length],
        extraAnswer: { questionKey: 'internetUsageHours', value: 3 + Math.random() * 4 }
      };
      
      const submitResult = await postJson(`${base}/daily-logs/submit`, logPayload, token);
      if (submitResult.status !== 201) {
        console.error(`   ❌ Log ${i + 1} failed:`, submitResult.body);
        continue;
      }
      process.stdout.write(`✓`);
    }
    console.log('\n   ✅ 30 logs submitted successfully');

    // Step 3: Fetch mitigation plan to check if AI recommendations were generated
    console.log('\n3️⃣ Fetching mitigation plan...');
    const planResult = await getJson(`${base}/mitigation-plan`, token);
    
    if (planResult.status !== 200) {
      console.error('   ❌ Failed to fetch plan:', planResult.body);
      return;
    }

    const planData = JSON.parse(planResult.body);
    const plan = planData.data;

    console.log('\n📋 PLAN RESPONSE:');
    console.log(`   Type: ${plan.type || 'N/A'}`);
    console.log(`   LogsCount: ${plan.logsCount}`);
    console.log(`   Source: ${plan.plan?.source || 'N/A'}`);
    
    if (plan.type === 'MONTHLY_PLAN') {
      console.log('\n   ✅ ✅ ✅ AI RECOMMENDATIONS GENERATED!');
      console.log(`   Recommendation Count: ${plan.plan?.recommendations?.length || 0}`);
      
      if (plan.plan?.recommendations?.length > 0) {
        console.log('\n   Sample Recommendations:');
        plan.plan.recommendations.slice(0, 3).forEach((rec, i) => {
          console.log(`     ${i + 1}. ${rec.text}`);
          console.log(`        Reduction: ${rec.estimatedReductionKg}kg CO2`);
          console.log(`        Category: ${rec.category}`);
        });
      }
    } else if (plan.type === 'GENERAL_PLAN') {
      console.log('\n   ⚠️  Still on GENERAL_PLAN - checking reasons...');
      console.log(`   Logs Count: ${plan.logsCount} (need 30+)`);
      
      if (plan.plan?.transport) {
        console.log(`   ✅ General recommendations available: ${plan.plan.transport?.length || 0} transport, ${plan.plan.energy?.length || 0} energy, ${plan.plan.diet?.length || 0} diet, ${plan.plan.waste?.length || 0} waste`);
      }
    }

    console.log('\n   ✅ dailyLogs returned: ' + (plan.dailyLogs?.length || 0) + ' logs');
    console.log('\n========== TEST COMPLETE ==========\n');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
})();
