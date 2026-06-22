(async () => {
  const base = 'http://localhost:5000';
  const fetch = global.fetch || (await import('node-fetch')).default;

  const email = 'ci_tester@example.com';
  const password = 'Pass1234!';

  try {
    // Registering user (silent in CI)
    let res = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'CI Tester', email, password, grade: '8', locationType: 'urban' })
    });
    const regBody = await res.text();
    // response intentionally not logged

    // Logging in (silent)
    res = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const loginJson = await res.json();
    // login response intentionally not logged

    const token = loginJson?.data?.token;
    if (!token) {
      console.error('No token returned; aborting');
      process.exit(1);
    }

    // submitting daily log #1 (silent)
    res = await fetch(`${base}/api/daily-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ transportationMode: 'car', transportationDistanceKm: 5, foodMealType: 'vegetarian', wasteAndPlasticCount: 1, energyUsageHours: 2, energyFirewoodKg: 0 })
    });
    const submit1 = await res.json();
    // submit1 response intentionally not logged

    // submitting duplicate daily log #2 (silent)
    res = await fetch(`${base}/api/daily-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ transportationMode: 'car', transportationDistanceKm: 5, foodMealType: 'vegetarian', wasteAndPlasticCount: 1, energyUsageHours: 2, energyFirewoodKg: 0 })
    });
    const submit2 = await res.json();
    // submit2 response intentionally not logged

    process.exit(0);
  } catch (err) {
    console.error('Error in CI test', err);
    process.exit(1);
  }
})();
