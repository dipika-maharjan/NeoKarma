# नेओकर्म (Neoकर्म) Backend API

**Carbon Footprint Behavior-Change Platform for Grade 8–12 Students in Nepal**

A clean, n-layered Node.js backend that tracks student carbon emissions across four categories (transportation, food, waste, energy), generates AI-powered mitigation plans, and powers a participation-score system tied to school grading.

##  Quick Start

### Prerequisites
- Node.js LTS (v16+)
- MongoDB Atlas account (connection string in `.env`)
- npm or yarn

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (see .env.example or below)
cp .env.example .env
# Edit .env with your MongoDB connection string and JWT secret

# 3. Seed the database with emission factors
npm run seed

# 4. Start development server
npm run dev

# Server runs on http://localhost:5000
```

##  Environment Variables

Required keys in `.env`:

```env
# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Server
PORT=5000
NODE_ENV=development

# Authentication
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=7d

# CORS - Frontend origin
FRONTEND_ORIGIN=http://localhost:3000

# AI Mitigation Service (optional)
AI_SERVICE_URL=https://your-ai-service.com/generate-plan
AI_SERVICE_TIMEOUT=8000

# Carbon Metrics
# Mature tree absorbs ~21kg CO2/year (configurable by carbon mentor)
KG_CO2_PER_TREE_PER_YEAR=21
```

## Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── env.js             # Environment validation
│   ├── models/
│   │   ├── User.js            # Student profile + streak + extra profile
│   │   ├── DailyLog.js        # One log per user per day
│   │   ├── EmissionFactor.js  # Configurable emission factors (seedable)
│   │   ├── MitigationPlan.js  # AI-generated action plans
│   │   └── MonthlySnapshot.js # Cached monthly aggregates
│   ├── repositories/
│   │   ├── user.repository.js
│   │   ├── dailyLog.repository.js
│   │   ├── emissionFactor.repository.js
│   │   ├── mitigationPlan.repository.js
│   │   └── monthlySnapshot.repository.js
│   ├── services/
│   │   ├── auth.service.js                    # Registration & login
│   │   ├── emissionCalculation.service.js     # CO2 computation
│   │   ├── streak.service.js                  # Streak tracking
│   │   ├── carbonMirror.service.js            # Tree equivalent visualization
│   │   ├── mitigationPlan.service.js          # Plan orchestration
│   │   └── ai/
│   │       ├── aiProvider.interface.js        # Interface contract
│   │       ├── externalAiProvider.js          # External AI service caller
│   │       └── fallbackRuleProvider.js        # Deterministic fallback
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── profile.controller.js
│   │   ├── dailyLog.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── carbonMirror.controller.js
│   │   ├── mitigationPlan.controller.js
│   │   └── streak.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── profile.routes.js
│   │   ├── dailyLog.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── carbonMirror.routes.js
│   │   ├── mitigationPlan.routes.js
│   │   ├── streak.routes.js
│   │   ├── emissionFactors.routes.js
│   │   └── index.js            # Main router
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── errorHandler.middleware.js
│   │   └── validate.middleware.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   └── dailyLog.validator.js
│   ├── utils/
│   │   ├── AppError.js
│   │   ├── asyncHandler.js
│   │   └── dateHelpers.js
│   ├── app.js                  # Express app config
│   └── server.js               # Server entry point
├── scripts/
│   └── seed.js                 # Emission factor seeding
├── .env                        # Environment config
├── package.json
└── README.md
```

## API Endpoints

### Authentication (No Auth Required)

```
POST /api/auth/register
  {
    "name": "String",
    "email": "String (unique)",
    "password": "String (min 6 chars)",
    "grade": 8-12,
    "locationType": "urban" | "rural",
    "schoolName": "String (optional)",
    "extraProfile": { "questionKey": "String", "value": Mixed } (optional)
  }
  Returns: { token, user }

POST /api/auth/login
  { "email": "String", "password": "String" }
  Returns: { token, user }
```

### Profile (Auth Required)

```
GET /api/profile
  Returns: User document with all fields

PATCH /api/profile
  { "name": "String", "schoolName": "String", "extraProfile": {} }
  Returns: Updated user
```

### Daily Log (Auth Required)

```
POST /api/daily-log
  {
    "transportationMode": "walk|bicycle|bus|motorbike|car",
    "transportationDistanceKm": Number,
    "foodMealType": "vegetarian|non-vegetarian|vegan",
    "wasteAndPlasticCount": Number,
    "energyUsageHours": Number,
    "extraAnswer": { "questionKey": "String", "value": Mixed } (optional)
  }
  Returns: { log, mirror }

GET /api/daily-log/today
  Returns: { hasLoggedToday: Boolean, data: Log | null }

GET /api/daily-log/history?from=YYYY-MM-DD&to=YYYY-MM-DD
  Returns: { count, data: [Logs] }
```

### Dashboard (Auth Required)

```
GET /api/dashboard/summary
  Returns: {
    student: { name, grade, locationType },
    streak: { current, longest, lastLogDate, participationScore },
    weekly: { totalDaysLogged, totalEmissionKg, averagePerDay },
    monthly: { totalDaysLogged, totalEmissionKg, averagePerDay, breakdown, highestCategory }
  }
```

### Carbon Mirror (Auth Required)

```
GET /api/carbon-mirror
  Returns: {
    today: { story, treesEquivalent, status, kgCO2 },
    thisMonth: { story, treesEquivalent, status, kgCO2 },
    monthComparison: { deltaKg, direction, message, percentChange }
  }

POST /api/carbon-mirror/what-if
  { "originalTotalKg": Number, "hypotheticalInputs": {...} }
  Returns: { originalKg, hypotheticalKg, reductionKg, reductionPercent, newMirror }
```

### Mitigation Plan (Auth Required)

```
GET /api/mitigation-plan
  Returns: Current active plan or null

POST /api/mitigation-plan/generate
  Manually trigger plan generation (for demo/testing)
  Returns: Generated plan

GET /api/mitigation-plan/history
  Returns: All plans (active and inactive) for user
```

### Streak (Auth Required)

```
GET /api/streak
  Returns: { current, longest, lastLogDate, participationScore }
```

### Emission Factors (Auth Required, Read-Only)

```
GET /api/emission-factors
  Returns: All active emission factors (for debugging/transparency)
```

### Health Check (No Auth)

```
GET /api/health
  Returns: { status, database: "connected|disconnected", timestamp }
```

##  Business Logic Overview

### Emission Calculation
- **Never hardcodes** emission factors; reads from `EmissionFactor` collection
- Supports dynamic factor updates by carbon mentors without code changes
- Currently sources: IPCC, UNFCCC, AsianTransportObservatory

### Streak & Participation Scoring
- **Streak**: unbroken chain of daily logs
- **Participation Score**: cumulative points for consistency
- Important: Participation score rewards honesty and consistency, NOT low emissions
  - A student with high emissions but daily logging gets the same participation points as an eco-conscious student
  - This prevents incentivizing fake/low data

### Carbon Mirror
- Converts emissions (kg CO2) to tree-equivalent visualization
- Default: 1 mature tree absorbs ~21kg CO2/year = ~0.0575kg/day
- Configurable via `.env` key `KG_CO2_PER_TREE_PER_YEAR`
- Supports what-if scenarios: "What if I took the bus 3 times instead of car?"

### Mitigation Plan Generation
- **AI Provider Abstraction**: Enables seamless switching between external AI and rule-based fallback
- **External AI**: Calls `AI_SERVICE_URL` with 30-day aggregated data, 8-second timeout
- **Fallback Rule-Based**: Deterministic rules engine guarantees plan generation even if external AI unavailable
  - Ensures demo works end-to-end
  - Provides intelligent recommendations without ML dependency
- Auto-triggers after 30 days of logging (scheduled via node-cron - ready to implement)

### Urban/Rural Extra Profile Slot
- User model includes `extraProfile: { questionKey, value }`
- **Urban students**: e.g., internet usage hours, device time
- **Rural students**: e.g., cooking fuel type (LPG vs. firewood), alternative transport modes
- Fully data-driven: can swap question via API without schema migration

## Security & Production

### Implemented
-  JWT token-based authentication
-  bcryptjs password hashing
-  Rate limiting on auth endpoints (5 requests per 15 min)
-  Helmet for HTTP headers
-  CORS configured with frontend origin
-  Input validation via express-validator
-  Centralized error handling

### Recommended for Production
1. Change `JWT_SECRET` to a cryptographically strong string
2. Set `NODE_ENV=production`
3. Use MongoDB Atlas IP whitelist
4. Enable TLS/SSL on production domain
5. Set up monitoring (logs, error tracking)
6. Implement request rate limiting globally (currently only on auth)
7. Add request/response logging to external AI service calls
8. Implement circuit breaker pattern for AI service reliability

##  Seeding Emission Factors

The seed script populates the `EmissionFactor` collection with placeholder values. **All values marked "TODO: confirm with carbon mentor" should be replaced with verified research.**

```bash
npm run seed
```

This creates factors for:
- **Transportation**: walk, bicycle, bus, motorbike, car
- **Food**: vegan, vegetarian, non-vegetarian
- **Waste**: plastic item count
- **Energy**: electricity usage (kWh)

Factors are fully configurable post-seed via MongoDB or API (admin endpoints - not yet created).

## Database Models

### User
```js
{
  name: String,
  email: String (unique),
  passwordHash: String,
  grade: 8-12,
  locationType: "urban" | "rural",
  schoolName: String,
  extraProfile: { questionKey, value }, // Swappable slot
  streak: { current, longest, lastLogDate, participationScore },
  isActive: Boolean,
  timestamps: { createdAt, updatedAt }
}
```

### DailyLog
```js
{
  userId: ObjectId,
  date: String (YYYY-MM-DD, unique per user),
  transportation: { mode, distanceKm },
  food: { mealType, foodWasteGrams },
  wasteAndPlastic: { plasticItemCount, segregated },
  energy: { usageHours },
  extraAnswer: { questionKey, value },
  breakdown: { transportKg, foodKg, wasteKg, energyKg }, // Computed
  totalEmissionKg: Number, // Computed
  timestamps: { createdAt, updatedAt }
}
```

### MitigationPlan
```js
{
  userId: ObjectId,
  periodStart: String (YYYY-MM-DD),
  periodEnd: String (YYYY-MM-DD),
  baseEmissionKg: Number,
  status: "pending" | "generated" | "failed",
  source: "external-ai" | "fallback-rule-based",
  recommendations: [{
    text, description, estimatedReductionKg, effortLevel, category, context
  }],
  isActive: Boolean,
  generatedAt: Date
}
```

### MonthlySnapshot
```js
{
  userId: ObjectId,
  month: String (YYYY-MM),
  totalEmissionKg: Number,
  logsCount: Number,
  breakdown: { transportKg, foodKg, wasteKg, energyKg },
  treeEquivalentKg: Number,
  comparedToPreviousMonth: { deltaKg, direction: "improved"|"worsened"|"noData" }
}
```

##  Testing

### Postman Collection
A complete Postman collection is available in `postman/Neoकर्म-Backend.postman_collection.json`.

**Import steps:**
1. Open Postman
2. Click "Import" → Select the JSON file
3. Set environment variables:
   - `baseUrl`: http://localhost:5000
   - `token`: (auto-filled after login)

### Manual Testing Example

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aarav Sharma",
    "email": "aarav@example.com",
    "password": "password123",
    "grade": 10,
    "locationType": "urban",
    "schoolName": "ABC School"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aarav@example.com","password":"password123"}'

# Submit daily log (with token from login)
curl -X POST http://localhost:5000/api/daily-log \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "transportationMode": "bus",
    "transportationDistanceKm": 15,
    "foodMealType": "vegetarian",
    "wasteAndPlasticCount": 2,
    "energyUsageHours": 3
  }'
```

##  Integration Points

### AI Mitigation Plan Service
The backend is ready to integrate with external AI. Your teammate can:
1. Create a service at any endpoint
2. Set `AI_SERVICE_URL` in `.env`
3. Return recommendations array in the shape:
   ```json
   {
     "recommendations": [
       {
         "text": "Switch to bus",
         "description": "...",
         "estimatedReductionKg": 3.2,
         "effortLevel": "medium",
         "category": "transportation",
         "context": "Based on your 8+ car trips..."
       }
     ]
   }
   ```
4. If your service times out or fails, the fallback rule-based provider ensures the app never breaks

**Fallback Provider** is production-ready and provides intelligent recommendations even without external AI.

##  Known Limitations & Future Work

1. **PDF Export**: Placeholder route returns 501 Not Implemented — implement after core features stabilize
2. **Scheduled Plan Generation**: node-cron task framework is ready, scheduling logic needs completion
3. **Admin Panel**: No admin endpoints for managing emission factors yet
4. **Notifications**: No push notifications for streaks or milestones
5. **Export History**: Only JSON via API; CSV/Excel export not yet implemented

##  Architecture Principles

### N-Layered Design
1. **Routes**: Define endpoints, attach validators and middleware
2. **Controllers**: Parse requests, call services, format responses
3. **Services**: All business logic lives here
4. **Repositories**: Only layer that touches the database
5. **Models**: Schema definitions only

### No Business Logic in Routes or Controllers
- Controllers are thin wrappers around service methods
- All business rules live in services
- Repositories are pure data access layers

### Dependency Injection
- Services don't instantiate repositories; they require them
- Enables testing and mocking
- Clear dependency graph

##  Development Workflow

```bash
# Install dependencies
npm install

# Seed database
npm run seed

# Start development server with hot reload
npm run dev

# In another terminal, check health
curl http://localhost:5000/api/health
```

##  License

MIT

##  Team

**Neoकर्म Backend Team**
- Architecture & Core Services
- Database Schema & Repositories
- API Layer with Validation
- AI Provider Abstraction

---

**Last Updated**: December 2024
**Backend Version**: 1.0.0
