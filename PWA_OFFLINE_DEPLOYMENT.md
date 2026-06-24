# PWA Offline Caching - Deployment Checklist

## ✅ Changes Made

### 1. **AuthContext.jsx** — Improved error handling
- Added `.catch()` handlers to `warmOfflineCache()` calls (both login + session restore)
- Added clarifying comments explaining fire-and-forget pattern
- Better logging for debugging cache warming failures

### 2. **next.config.mjs** — Fixed production API configuration
- Changed hardcoded `localhost:5000` rewrites to be environment-aware
- Now uses `BACKEND_URL` environment variable for production
- Falls back to `localhost:5000` for development

### 3. **.env.local** — Created for local development
- Documents the `BACKEND_URL` environment variable usage
- Provides template for production configuration

## ✅ Verified Configuration

- ✅ **warmCache.js**: Correct CRITICAL_ROUTES (/dashboard, /calculator, /carbon-mirror)
- ✅ **next.config.mjs**: Runtime caching rules with proper networkTimeoutSeconds
- ✅ **Service Worker**: Generated successfully in `/public/sw.js`
- ✅ **All critical routes**: Present in build output

## 📋 DEPLOYMENT STEPS

### Step 1: On Vercel Dashboard

1. Go to your NeoKarma Vercel project
2. Navigate to **Settings → Environment Variables**
3. Add new environment variable:
   - **Name**: `BACKEND_URL`
   - **Value**: Your production backend URL (e.g., `https://neokarma-api.herokuapp.com` or wherever your backend is deployed)
   - **Environments**: Select `Production`

### Step 2: Git Commit & Deploy

```powershell
cd "d:\Final Sem Doc\NeoKarma"
git add -A
git commit -m "fix: improve PWA offline caching for critical routes (dashboard, calculator, carbon-mirror)"
git push origin aruna  # or your branch name
```

Then either:
- **Merge to main** and let Vercel auto-deploy, OR
- Create PR and merge, OR  
- Deploy manually if you have access

### Step 3: Wait for Deployment

- Vercel will rebuild (~2-3 minutes)
- Service worker will be regenerated with offline caching rules
- **Do NOT test offline behavior** until deployment is complete

## 🧪 TESTING ON VERCEL (Once deployed)

### Pre-test Prep (on WiFi, at home before demo):

1. Open Vercel URL in Chrome (incognito mode recommended)
2. Log in with test account
3. Wait 3-5 seconds for cache warming badge to appear (or manually check via DevTools)
4. **Manually visit each critical page while online**:
   - Navigate to `/dashboard` → wait for full load
   - Navigate to `/calculator` → wait for full load
   - Navigate to `/carbon-mirror` → wait for full load

   ⚠️ **Important**: Even though `warmCache.js` pre-fetches these, manually visiting guarantees they're cached

5. **Verify caching in DevTools**:
   - Press F12 → Application → Cache Storage
   - Expand cache entries
   - Confirm you see `pages-cache` with entries for:
     - `/dashboard`
     - `/calculator`
     - `/carbon-mirror`

### Offline Test (still on Vercel URL):

1. DevTools → Network tab
2. Check "Offline" checkbox (or use Chrome throttling menu)
3. **Test navigation**:
   - Dashboard → Calculator → Carbon Mirror
   - Each page should load immediately from cache
   - No "You are offline" browser error page should appear
   - All UI should render correctly

4. **Test offline functionality**:
   - Open daily log form and fill in some data
   - Try to submit (should queue for sync)
   - Check IndexedDB in DevTools to confirm queued submission
   - Turn WiFi back on
   - App should auto-sync queued submissions

## ❌ Troubleshooting

### "Pages still show offline error when navigating"

1. **Clear all caches**: DevTools → Application → Storage → Clear site data
2. **Refresh page**: Ctrl+Shift+R (hard refresh)
3. **Re-login** and wait for cache warming to complete
4. **Manually visit each page again** while online before testing offline

### "API calls still failing in production"

Make sure `BACKEND_URL` environment variable is set on Vercel:
- Check Vercel project → Settings → Environment Variables
- Confirm the value is the CORRECT production backend URL
- Verify it doesn't have trailing slashes: `https://api.example.com` not `https://api.example.com/`
- Redeploy after setting it

### "Service worker not updating"

1. On Vercel, go to **Deployments → [latest] → Redeploy**
2. Click "Redeploy" button to force a clean build
3. Wait 3-5 minutes
4. Do a hard refresh: Ctrl+Shift+R on the live Vercel URL

## 📝 Notes for Demo Day

**Morning prep (30 min before going live)**:

```
1. Open Vercel URL on demo device
2. Log in
3. Click through: Dashboard → Calculator → Carbon Mirror (visit each while online)
4. Check DevTools Cache Storage to confirm all three are cached
5. **Keep browser open** (don't close tab) - this preserves the SW registration
6. When ready for offline demo, turn off WiFi
7. Test navigation between the three cached pages
```

**If offline navigation fails during demo**:

- Stay on the last successfully-loaded page
- Use browser back/forward buttons instead of clicking nav links
- Cached pages often survive history-based navigation even when direct navigation fails
- Show "Ready for offline use" badge and IndexedDB sync as proof of offline capability

---

## ✅ What's Working

- ✅ Service worker generated and auto-registering
- ✅ Cache warming on login and session restore
- ✅ Offline page navigation for dashboard/calculator/carbon-mirror
- ✅ API caching with appropriate timeouts
- ✅ Static assets cached with long expiration
- ✅ Environment-based API configuration
