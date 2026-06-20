const fetch = require('node-fetch');

(async () => {
  try {
    const res = await fetch('http://localhost:3001/');
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Length:', text.length);
  } catch (err) {
    console.error('Error fetching frontend:', err.message);
    process.exit(1);
  }
})();
