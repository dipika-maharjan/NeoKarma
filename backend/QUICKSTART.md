#  Neoकर्म Backend — Quick Start Guide

Get the backend running in **2 minutes**.

## Prerequisites

- **Node.js** LTS (v16+) — [Download](https://nodejs.org/)
- **MongoDB Atlas** account (free tier is fine) — [Sign up](https://www.mongodb.com/cloud/atlas)
- **Git** (optional)

## Step 1: Clone/Setup (if not already done)

```bash
cd d:\NeoKarma\backend
```

## Step 2: Install Dependencies

```bash
npm install
```

This installs ~35 packages including Express, Mongoose, JWT, bcryptjs, validators, security headers, logging, and more.

**Expected output:**
```
added XX packages in Yse
```

## Step 3: Configure Environment

Open `.env` and update:

```env
# Keep existing MongoDB URI (should already be there)
MONGO_URI=mongodb+srv://neokarma:si95077orr8YyjVm@cluster0.3yqn1q8.mongodb.net/?appName=Cluster0

# Add JWT secret (change this in production!)
JWT_SECRET=my-super-secret-jwt-key-12345

# Set frontend origin (if running Next.js frontend locally)
FRONTEND_ORIGIN=http://localhost:3000

# Optional: external AI service (leave blank to use fallback)
AI_SERVICE_URL=

# Carbon metrics (tree absorption rate)
KG_CO2_PER_TREE_PER_YEAR=21
```

All other keys already have sensible defaults.

## Step 4: Seed Emission Factors

```bash
npm run seed
```

**Expected output:**
```
 Connected to MongoDB
 Inserted 10 emission factors
 Seeded Emission Factors:
═════════════════════════════
transportation | walk ... | 0 kg CO2/km | IPCC
transportation | bus  ... | 0.015 kg CO2/km | AsianTransportObservatory
food | non-vegetarian ... | 2.8 kg CO2/meal | IPCC
[... 7 more factors ...]
 Seed completed!
```

This populates the database with default emission factors. All are marked "TODO: confirm with carbon mentor" — you can update these values later in MongoDB or via API.

## Step 5: Start Server

### Development Mode (with hot reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

**Expected output:**
```
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║     नेओकर्म (Neoकर्म) Backend Server Running             ║
║                                                          ║
║     Environment: development                            ║
║     Port: 5000                                           ║
║     Database: mongodb+srv://neokarma:...                ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

## Step 6: Test the Server

### Option A: Browser (Simple Check)
Open [http://localhost:5000](http://localhost:5000)

You should see:
```json
{
  "message": "नेओकर्म (Neoकर्म) - Carbon Footprint Tracking API",
  "version": "1.0.0",
  "docs": "/api/health"
}
```

### Option B: Health Check
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-06-16T10:30:45.123Z"
}
```

### Option C: Full API Testing (Recommended)

**Using Postman:**
1. Download [Postman](https://www.postman.com/downloads/)
2. Open Postman
3. Click **Import** → Select `postman/Neoकर्म-Backend.postman_collection.json`
4. In the collection, set `baseUrl` variable to `http://localhost:5000`
5. Run requests in order:
   - Register → Login (to get token) → Submit Daily Log → View Dashboard

**Using VS Code REST Client:**
1. Install [REST Client extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
2. Open `api-test.http` in VS Code
3. Replace `YOUR_TOKEN_HERE` with actual token from login response
4. Click "Send Request" on any endpoint

**Using curl:**
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "test@example.com",
    "password": "password123",
    "grade": 10,
    "locationType": "urban"
  }'

# Login (copy token from response)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Submit daily log (replace TOKEN)
curl -X POST http://localhost:5000/api/daily-log \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transportationMode": "bus",
    "transportationDistanceKm": 10,
    "foodMealType": "vegetarian",
    "wasteAndPlasticCount": 2,
    "energyUsageHours": 3
  }'
```

## Common Issues

### 1. "MongoDB connection failed"
- Check `MONGO_URI` in `.env`
- Verify MongoDB Atlas IP whitelist (add your IP)
- Check internet connection

### 2. "Port 5000 already in use"
```bash
# Kill process on port 5000
# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -i :5000
kill -9 <PID>
```

### 3. "Cannot find module 'express'"
```bash
npm install
```

### 4. "JWT_SECRET is not defined"
Add `JWT_SECRET=any-secret-key` to `.env`

## File Structure

After setup, your backend looks like:

```
backend/
├── src/
│   ├── config/        # Database & environment setup
│   ├── models/        # 5 MongoDB schemas
│   ├── repositories/  # 5 data access layers
│   ├── services/      # 9 business logic layers (including AI!)
│   ├── controllers/   # 7 route handlers
│   ├── routes/        # 9 endpoint definitions
│   ├── middlewares/   # Security & validation
│   ├── validators/    # Input validation rules
│   ├── utils/         # Helper functions
│   ├── app.js         # Express app config
│   └── server.js      # Server entry point
├── scripts/
│   └── seed.js        # Database seeding
├── postman/
│   └── Neoकर्म-Backend.postman_collection.json
├── api-test.http      # REST Client test file
├── .env               # Configuration
├── package.json
└── README.md          # Full documentation
```

## Next Steps

1. **Read full docs**: Open [README.md](README.md) for complete API reference
2. **Integrate frontend**: Set `FRONTEND_ORIGIN` in `.env` to your Next.js frontend URL
3. **Connect AI service**: Set `AI_SERVICE_URL` when your teammate's AI service is ready
   - If not set, app automatically uses fallback rule-based provider
4. **Configure emission factors**: Review seed values with carbon mentor, update via MongoDB or admin API (todo)

## Architecture Overview

The backend follows a **strict n-layered design**:

```
HTTP Request
    ↓
Routes (define endpoints, validate input)
    ↓
Controllers (parse request, call service)
    ↓
Services (all business logic here)
    ↓
Repositories (read/write to database)
    ↓
MongoDB
```

This keeps code clean, testable, and maintainable.

## Key Features

✅ Student registration & JWT login
✅ Daily emission logging (4 categories)
✅ Real-time carbon mirror (trees equivalent)
✅ AI-powered mitigation plans (with intelligent fallback)
✅ Streak tracking & participation scoring
✅ Urban/rural-specific data collection
✅ What-if scenario modeling
✅ Monthly progress snapshots
✅ Transparent emission factors (all from database)
✅ Rate limiting & security headers
✅ Comprehensive error handling

## Testing Checklist

After startup, verify:

- [ ] Server runs without errors
- [ ] Health check returns `connected`
- [ ] Can register a student
- [ ] Can login with credentials
- [ ] Can submit a daily log
- [ ] Can retrieve dashboard summary
- [ ] Can trigger mitigation plan generation
- [ ] Can view carbon mirror

## Scripts

```bash
npm start      # Run production server
npm run dev    # Run development server (hot reload)
npm run seed   # Seed database with emission factors
```

## Environment Variables Reference

| Key | Default | Purpose |
|-----|---------|---------|
| `MONGO_URI` | *(required)* | MongoDB connection string |
| `PORT` | 5000 | Server port |
| `NODE_ENV` | development | dev or production |
| `JWT_SECRET` | *(required)* | JWT signing key |
| `JWT_EXPIRE` | 7d | Token expiry |
| `FRONTEND_ORIGIN` | http://localhost:3000 | CORS allowed origin |
| `AI_SERVICE_URL` | *(optional)* | External AI service endpoint |
| `AI_SERVICE_TIMEOUT` | 8000 | AI service timeout in ms |
| `KG_CO2_PER_TREE_PER_YEAR` | 21 | Carbon metric (configurable) |

## Support

For detailed information:
- **API Endpoints**: See [README.md](README.md#-api-endpoints)
- **Database Schema**: See [README.md](README.md#-database-models)
- **Architecture**: See [README.md](README.md#-architecture-principles)
- **Integration**: See [README.md](README.md#-integration-points)

---

**You're all set!** 🎉 The backend is now ready for frontend integration and testing.
