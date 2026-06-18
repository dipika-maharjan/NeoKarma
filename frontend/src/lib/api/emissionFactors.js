const FACTORS_CACHE_KEY = 'neokarma_emission_factors_v1';
const FACTORS_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function fetchFactors() {
  const url = '/api/emission-factors';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load emission factors');
  const json = await res.json();
  return json.data || [];
}

function mapFactors(list) {
  const map = {};
  list.forEach(f => {
    map[`${f.category}_${f.subType}`] = f.factorValue;
  });
  return map;
}

export async function getEmissionFactors() {
  try {
    const raw = localStorage.getItem(FACTORS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.ts < FACTORS_TTL_MS) {
        return parsed.map;
      }
    }

    const list = await fetchFactors();
    const map = mapFactors(list);
    try {
      localStorage.setItem(FACTORS_CACHE_KEY, JSON.stringify({ ts: Date.now(), map }));
    } catch (e) {
      // ignore storage errors
    }
    return map;
  } catch (err) {
    // If fetch failed and we have stale cache, return it
    try {
      const raw = localStorage.getItem(FACTORS_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.map || {};
      }
    } catch (e) {
      // ignore
    }
    return {};
  }
}

export default { getEmissionFactors };
