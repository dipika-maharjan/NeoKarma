# 🌍 NeoKarma - Carbon Footprint Behavior-Change Platform

**Empowering Grade 8-12 students in Nepal to track, reduce, and offset their carbon footprint through gamified engagement and AI-powered insights.**

![Status](https://img.shields.io/badge/status-MVP-yellow)
![License](https://img.shields.io/badge/license-MIT-green)
![Node.js](https://img.shields.io/badge/Node.js-v16+-green)
![React](https://img.shields.io/badge/React-19.2.4-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green)

---

## Overview

NeoKarma is a **full-stack carbon footprint tracking and behavior-change platform** designed for secondary school students in Nepal. The platform educates students about their environmental impact across four key emission categories (transportation, food, waste, and energy) while gamifying carbon reduction through streaks, scores, and AI-generated mitigation strategies.

**Key Target:** Students aged 13-18 in Grades 8-12 across Nepali schools

---

## Core Features

### **Carbon Calculator**

- Track daily emissions across 4 categories:
  - 🚗 **Transportation** (vehicles, public transit)
  - 🍽️ **Food** (dietary choices)
  - 🗑️ **Waste** (consumption & disposal)
  - ⚡ **Energy** (electricity, fuel usage)
- Evidence-based emission factors with real-time calculations
- Monthly snapshot tracking for trend analysis

### **Carbon Mirror**

- Visual representation of carbon impact compared to tree absorption rates
- "Carbon debt" vs. "carbon credit" visualization
- Personal carbon offsetting progress
- Achievement badges and milestones

### **AI-Powered Mitigation Plans**

- Intelligent recommendations for carbon reduction
- Personalized action plans based on user behavior
- Smart suggestions ranked by impact potential
- Integration with external AI service (configurable)

### **Gamified Streaks & Scoring**

- Daily participation streaks for consistent engagement
- **School integration**: Participation scores contribute to school grading
- Streak reminders via email notifications
- Leaderboard functionality
- Achievement tracking

### **Admin Panel**

- User management and role assignment
- Class/section management
- Emission factor configuration
- Scoring system tuning
- Streak monitoring and reset

### **Bilingual Support**

- Full support for **English** and **Nepali**
- Context-aware translations
- Culturally adapted content

### **Progressive Web App (PWA)**

- Offline-first functionality with IndexedDB
- Works on mobile and desktop
- Install as native app on any device

---

## Tech Stack

### Backend

| Layer              | Technology                          |
| ------------------ | ----------------------------------- |
| **Runtime**        | Node.js (v16+)                      |
| **Framework**      | Express.js 5.2.1                    |
| **Database**       | MongoDB + Mongoose 9.7.0            |
| **Auth**           | JWT (jsonwebtoken 9.0.3) + bcryptjs |
| **API Validation** | express-validator 7.0.0             |
| **Email**          | Nodemailer 9.0.1                    |
| **Scheduling**     | node-cron 3.0.2                     |
| **Security**       | Helmet.js 7.1.0, express-rate-limit |
| **Logging**        | Morgan 1.10.0                       |
| **Storage**        | IndexedDB (idb 8.0.3)               |

### Frontend

| Layer           | Technology       |
| --------------- | ---------------- |
| **Framework**   | Next.js 16.2.9   |
| **UI Library**  | React 19.2.4     |
| **Styling**     | Tailwind CSS 4.0 |
| **Icons**       | Lucide React     |
| **Charts**      | Recharts 3.8.1   |
| **HTTP Client** | Axios 1.17.0     |
| **i18n**        | next-intl 4.13.0 |
| **PDF Export**  | jsPDF 4.2.1      |
| **PWA**         | next-pwa 5.6.0   |
| **Cookies**     | js-cookie 3.0.7  |
| **Linting**     | ESLint 9.0       |

---

## 🚀 Deployment

### Current Status

- **Frontend:** Deployed on [Vercel](https://vercel.com)
- **Backend:** Deployed on [Render](https://render.com)

### 🌐 Live Demo

https://neo-karma.vercel.app/

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** v16+ and npm
- **MongoDB Atlas** account (or local MongoDB)
- Git

### Local Setup

#### 1️⃣ Clone the Repository

```bash
git clone <repository-url>
cd NeoKarma
```

#### 2️⃣ Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file from template
cp .env.example .env

# Edit .env with your actual configuration
# See .env.example for all available options
# IMPORTANT: Set MONGO_URI and JWT_SECRET for production

# Seed the database with initial emission factors
npm run seed

# Start development server
npm run dev

# Server runs on http://localhost:5000
```

#### Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local file from template
cp .env.example .env.local

# Edit .env.local to point to your backend API
# Note: Frontend uses NEXT_PUBLIC_ prefix for client-side variables

# Start development server
npm run dev

# Frontend runs on http://localhost:3000
```

---

## 🔐 Environment Variables

See the example files for complete configuration:

- **Backend:** [backend/.env.example](./backend/.env.example)
- **Frontend:** [frontend/.env.example](./frontend/.env.example)

### Backend Key Variables

| Variable          | Description                     | Example                                              |
| ----------------- | ------------------------------- | ---------------------------------------------------- |
| `MONGO_URI`       | MongoDB connection string       | `mongodb+srv://user:pass@cluster.mongodb.net/db`     |
| `JWT_SECRET`      | JWT authentication secret       | Random 32+ character string                          |
| `JWT_EXPIRE`      | Token expiration time           | `7d`, `30d`, `24h`                                   |
| `FRONTEND_ORIGIN` | Allowed CORS origins            | `http://localhost:3000,https://neo-karma.vercel.app` |
| `EMAIL_USER`      | Gmail address for notifications | `your-email@gmail.com`                               |
| `EMAIL_PASS`      | Gmail app password              | Generated from Google Account                        |
| `AI_SERVICE_URL`  | External AI service endpoint    | `https://api.ai-service.com`                         |

### Frontend Key Variables

| Variable                       | Description         | Example                 |
| ------------------------------ | ------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL`          | Backend API URL     | `http://localhost:5000` |
| `NEXT_PUBLIC_DEFAULT_LANGUAGE` | Default UI language | `en` or `ne`            |

---

## 📁 Project Structure

```
NeoKarma/
├── backend/                      # Node.js/Express Backend
│   ├── src/
│   │   ├── app.js               # Express app configuration
│   │   ├── server.js            # Server entry point
│   │   ├── config/              # Configuration (DB, env)
│   │   ├── controllers/         # Route handlers
│   │   │   ├── auth.controller.js
│   │   │   ├── dailyLog.controller.js
│   │   │   ├── dashboard.controller.js
│   │   │   ├── mitigationPlan.controller.js
│   │   │   ├── carbonMirror.controller.js
│   │   │   ├── streak.controller.js
│   │   │   └── admin.controller.js
│   │   ├── models/              # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── DailyLog.js
│   │   │   ├── MitigationPlan.js
│   │   │   ├── EmissionFactor.js
│   │   │   ├── MonthlySnapshot.js
│   │   │   └── Certificate.js
│   │   ├── repositories/        # Data access layer
│   │   ├── services/            # Business logic
│   │   │   ├── auth.service.js
│   │   │   ├── emissionCalculation.service.js
│   │   │   ├── mitigationPlan.service.js
│   │   │   ├── streak.service.js
│   │   │   └── ai/              # AI integration
│   │   ├── routes/              # API endpoints
│   │   ├── middlewares/         # Auth, validation, error handling
│   │   ├── validators/          # Input validation schemas
│   │   └── utils/               # Helper functions
│   ├── scripts/                 # Database seeding
│   ├── package.json
│   └── README.md
│
├── frontend/                     # Next.js Frontend
│   ├── src/
│   │   ├── app/                 # Next.js app directory
│   │   ├── components/          # React components
│   │   ├── context/             # React context (global state)
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utility libraries
│   │   ├── views/               # Page views
│   │   └── i18n/                # Internationalization config
│   ├── messages/                # i18n translations
│   │   ├── en.json              # English translations
│   │   └── ne.json              # Nepali translations
│   ├── public/                  # Static assets & PWA manifest
│   ├── next.config.mjs          # Next.js configuration
│   ├── next-intl.config.js      # i18n configuration
│   ├── middleware.ts            # Next.js middleware
│   ├── package.json
│   └── README.md
│
└── README.md                     # This file
```

---

## 🔌 API Overview

### Authentication Routes (`/api/auth`)

- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /refresh-token` - Refresh JWT token

### Daily Log Routes (`/api/daily-logs`)

- `GET /` - Get all daily logs (with filters)
- `POST /` - Create new daily log
- `PUT /:id` - Update daily log
- `DELETE /:id` - Delete daily log
- `GET /stats` - Get statistics

### Dashboard Routes (`/api/dashboard`)

- `GET /` - Get dashboard summary
- `GET /analytics` - Get detailed analytics
- `GET /monthly-snapshot` - Get monthly data

### Mitigation Plan Routes (`/api/mitigation-plans`)

- `GET /` - Get mitigation plans
- `POST /` - Create new plan
- `PUT /:id` - Update plan

### Carbon Mirror Routes (`/api/carbon-mirror`)

- `GET /` - Get carbon mirror visualization data
- `POST /calculate` - Calculate offset status

### Streak Routes (`/api/streaks`)

- `GET /` - Get streak information
- `POST /remind` - Send streak reminder email

### Admin Routes (`/api/admin`)

- User management endpoints
- Emission factor management
- Score configuration

## Database Models

### User

```javascript
{
  _id, name, email, password, role,
  school, class, dateOfBirth, gender,
  profilePicture, totalCarbonLogged,
  createdAt, updatedAt
}
```

### DailyLog

```javascript
{
  _id, userId, date,
  transportation: { mode, distance, factor },
  food: { type, quantity, factor },
  waste: { type, amount, factor },
  energy: { type, consumption, factor },
  totalEmissions,
  notes,
  createdAt, updatedAt
}
```

### MitigationPlan

```javascript
{
  _id, userId,
  actions: [{ title, description, impact, status }],
  aiGenerated, targetEmissionReduction,
  createdAt, completionDate
}
```

### MonthlySnapshot

```javascript
{
  _id, userId, month, year,
  totalEmissions, averageDaily,
  categoryBreakdown: { transportation, food, waste, energy },
  treeEquivalent, createdAt
}
```

_See backend models for complete schema definitions_

---

## Key Workflows

### 1. Student Daily Log Entry

1. Student logs emissions (4 categories)
2. System calculates total CO₂ based on emission factors
3. Daily log saved to database
4. Monthly snapshot updated
5. Streak counter incremented (if not already logged today)

### 2. Carbon Mirror Visualization

1. System retrieves all user's logs
2. Calculates total emissions vs. tree absorption equivalent
3. Shows carbon "debt" or "credit" status
4. Displays progress towards carbon neutrality

### 3. AI Mitigation Plan Generation

1. User requests mitigation plan
2. AI service analyzes user's emission patterns
3. Generates personalized action recommendations
4. Ranks by impact potential
5. User can accept/modify/track progress

### 4. Streak & Gamification

1. Background job checks for daily participation
2. Extends streak if user logged today
3. Resets streak if missed day
4. Sends email reminder if streak at risk
5. Updates school participation score

---

## 🚦 Running & Developing

### Scripts

#### Backend

```bash
npm start    # Production server
npm run dev  # Development with auto-reload (nodemon)
npm run seed # Seed database with emission factors
```

#### Frontend

```bash
npm run dev    # Development server (http://localhost:3000)
npm run build  # Production build
npm start      # Start production server
npm run lint   # Run ESLint
```

---

## Development Status

### Implemented

- Carbon calculator with 4 emission categories
- User authentication (JWT + bcryptjs)
- Daily log tracking and aggregation
- Monthly snapshot generation
- Streak system with email reminders
- Admin panel with user management
- Bilingual UI (English + Nepali)
- PWA functionality (offline support)
- PDF export for reports

---

## 🐛 Troubleshooting

### Backend Won't Start

- Check MongoDB connection: `MONGO_URI` in `.env`
- Ensure `JWT_SECRET` is set
- Verify Node.js version: `node --version` (should be v16+)
- Check port 5000 is not in use: `netstat -ano | findstr :5000`

### Frontend Build Issues

- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check API URL: Ensure `NEXT_PUBLIC_API_URL` points to running backend

### Database Seed Failed

- Ensure MongoDB is running and accessible
- Check `MONGO_URI` format
- Verify network access if using MongoDB Atlas

### Email Reminders Not Working

- Ensure `EMAIL_USER` and `EMAIL_PASS` are set
- Use Gmail app-specific password (not regular password)
- Check spam folder for test emails

---

## Documentation

- **Backend API Docs:** See [backend/README.md](./backend/README.md)
- **Frontend Docs:** See [frontend/README.md](./frontend/README.md)
- **Environment Setup:** See [Environment Variables](#-environment-variables) section above

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Team

**NeoKarma Team** - All contributors

---

## 🌱 Contributing to Carbon Reduction

Beyond the platform, we encourage all users to:

- 🚴 Use public transport or carpool
- 🌱 Adopt sustainable eating habits
- ♻️ Reduce, reuse, recycle
- 💡 Use renewable energy
- 🌳 Plant trees and support reforestation

**Together, we can create a more sustainable future for Nepal and the world.**

---

**Status:** MVP (Minimum Viable Product)
