(async () => {
  const base = 'http://localhost:5000';
  const fetch = global.fetch || (await import('node-fetch')).default;
  const email = 'ci_tester@example.com';
  const password = 'Pass1234!';

  try {
    const loginRes = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const loginJson = await loginRes.json();
    // login response and token suppressed in CI
    const token = loginJson.data?.token;

    const mirrorRes = await fetch(`${base}/api/carbon-mirror`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    const text = await mirrorRes.text();
    // mirror response suppressed in CI
  } catch (err) {
    console.error(err);
  }
})();
