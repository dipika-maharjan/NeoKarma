(async () => {
  const base = 'http://localhost:5000';
  const fetch = global.fetch || (await import('node-fetch')).default;

  const email = 'ci_tester@example.com';
  const password = 'Pass1234!';

  try {
    console.log('Registering user...');
    let res = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'CI Tester', email, password, grade: '8', locationType: 'urban' })
    });
    const regBody = await res.text();
    console.log('Register status', res.status);
    console.log(regBody);

    console.log('\nLogging in...');
    res = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const loginJson = await res.json();
    console.log('Login status', res.status);
    console.log(JSON.stringify(loginJson, null, 2));

    const token = loginJson?.data?.token;
    if (!token) {
      console.error('No token returned; aborting');
      process.exit(1);
    }

    console.log('\nSubmitting daily log #1...');
    res = await fetch(`${base}/api/daily-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ transportationMode: 'car', transportationDistanceKm: 5, foodMealType: 'vegetarian', wasteAndPlasticCount: 1, energyUsageHours: 2, energyFirewoodKg: 0 })
    });
    const submit1 = await res.json();
    console.log('Submit1 status', res.status);
    console.log(JSON.stringify(submit1, null, 2));

    console.log('\nSubmitting daily log #2 (duplicate)...');
    res = await fetch(`${base}/api/daily-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ transportationMode: 'car', transportationDistanceKm: 5, foodMealType: 'vegetarian', wasteAndPlasticCount: 1, energyUsageHours: 2, energyFirewoodKg: 0 })
    });
    const submit2 = await res.json();
    console.log('Submit2 status', res.status);
    console.log(JSON.stringify(submit2, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Error in CI test', err);
    process.exit(1);
  }
})();
