# नेओकर्म Frontend - Complete React/Next.js Implementation

## Overview

A production-ready React/Next.js 16 frontend for the Neoकर्म carbon footprint tracking platform. Built with Tailwind CSS, Recharts, and lucide-react icons.

---

## Tech Stack

- **Framework**: Next.js 16.2.9 (App Router)
- **UI Library**: React 19.2.4
- **Styling**: Tailwind CSS v4
- **Icons**: lucide-react (NO emojis, professional icons only)
- **Charts**: Recharts 3.8.1
- **HTTP Client**: Axios 1.17.0
- **Cookies**: js-cookie 3.0.7
- **State Management**: React Context API

---

## Folder Structure

```
src/
├── app/                      # Next.js App Router
│   ├── page.js              # Root redirector
│   ├── layout.js            # Root layout with AuthProvider
│   ├── globals.css          # Global Tailwind styles
│   ├── dashboard/page.js    # Dashboard route
│   ├── calculator/page.js   # Carbon calculator route
│   ├── carbon-mirror/page.js # Carbon mirror route
│   ├── result/page.js       # Result visualization route
│   ├── login/page.js        # Login page
│   └── register/page.js     # Registration page
│
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── MetricCard.jsx
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   ├── Badge.jsx
│   │   ├── ProgressRing.jsx
│   │   ├── Skeleton.jsx
│   │   └── index.js
│   ├── layout/              # Layout components
│   │   └── (for future use)
│   ├── Navbar.jsx          # Navigation bar (updated)
│   ├── Footer.jsx          # Footer component
│   └── DashboardSummary.jsx # Dashboard summary (existing)
│
├── pages/                   # Page component logic
│   ├── DashboardPage.jsx    # Dashboard logic
│   ├── CalculatorPage.jsx   # Calculator form
│   ├── CarbonMirrorPage.jsx # Carbon mirror visualization
│   └── ResultPage.jsx       # Result display
│
├── lib/
│   ├── api/                 # API client layer
│   │   ├── axios.js         # Axios instance with interceptors
│   │   ├── cookie.js        # Cookie management
│   │   ├── endpoints.js     # API endpoint constants
│   │   ├── authApi.js       # Auth API calls
│   │   ├── calculatorApi.js # Daily log API calls
│   │   ├── mirrorApi.js     # Carbon mirror API calls
│   │   ├── streakApi.js     # Streak API calls
│   │   └── dashboardApi.js  # Dashboard API calls
│   │
│   └── actions/             # Action wrappers (business logic)
│       ├── authActions.js
│       ├── calculatorActions.js
│       ├── mirrorActions.js
│       ├── streakActions.js
│       └── dashboardActions.js
│
├── context/
│   └── AuthContext.jsx      # Auth state management
│
├── hooks/                   # Custom React hooks (for future)
│
└── utils/                   # Utility functions (for future)
```

---

## Key Components

### UI Component System

All components use lucide-react for icons (NO EMOJIS).

- **Button**: Primary, secondary, outline, danger, success variants
- **Card**: Default, elevated, highlight variants
- **MetricCard**: Display CO₂ metrics with icons and trends
- **Input**: Labeled text input with validation
- **Select**: Dropdown with label and options
- **Badge**: Status indicators (success, warning, danger, etc.)
- **ProgressRing**: Circular progress indicator (streak display)
- **Skeleton**: Loading placeholder

### Page Components

#### 1. **Login Page** (`/login`)
- Email/password authentication
- "Remember me" optional
- Sign up link
- Error handling

#### 2. **Register Page** (`/register`)
- Full name, email, password
- Grade selection (8-12)
- Location type (urban/rural)
- School name (optional)
- Form validation

#### 3. **Calculator Page** (`/calculator`)
- Two-column layout (desktop)
- Transportation inputs (mode + distance)
- Food inputs (meal type + waste)
- Waste & plastic inputs
- Energy usage inputs
- Real-time emission preview
- Submit and error handling

#### 4. **Result Page** (`/result`)
- Total CO₂ KPI display
- Breakdown cards (transport, food, energy)
- Carbon mirror visualization
- Recommendations
- Navigation buttons

#### 5. **Carbon Mirror Page** (`/carbon-mirror`)
- Hero section
- Current emissions display
- Tree equivalent visualization
- What-if simulator with sliders
- Live calculation updates
- Responsive range inputs

#### 6. **Dashboard Page** (`/dashboard`)
- Welcome greeting + user name
- Today's footprint KPI card
- Current streak ring
- Weekly emissions bar chart
- Monthly trend line chart
- Breakdown metrics (transport, food, energy)
- Action buttons for quick navigation

---

## API Integration

### axios Client (`lib/api/axios.js`)

- Base URL from `NEXT_PUBLIC_API_BASE_URL` env var
- Automatic Bearer token injection from cookies
- Request/response interceptors
- Error handling with clear messages

### Endpoint Constants (`lib/api/endpoints.js`)

```javascript
/auth/register
/auth/login
/profile

/daily-log
/daily-log/today
/daily-log/history

/carbon-mirror
/carbon-mirror/what-if

/streak

/dashboard/summary
```

### Action Wrappers (`lib/actions/*`)

Clean separation between API calls and business logic:
- `authActions`: Register, login, logout, profile
- `calculatorActions`: Submit log, fetch logs
- `mirrorActions`: Get mirror, what-if scenarios
- `streakActions`: Fetch current streak
- `dashboardActions`: Get dashboard summary

---

## Authentication Flow

1. **Login/Register**: User credentials → `authApi` → token stored in cookies
2. **axios Interceptor**: Every request automatically includes Bearer token
3. **Protected Routes**: `AuthContext` checks token, redirects if missing
4. **Logout**: Clear cookies + context state

---

## Design System

### Colors
- Primary Green: `#1B5E20`
- Secondary Green: `#43A047`
- Light Background: `#E8F5E9`
- Accent Blue: `#1976D2`
- Danger Red: `#E53935`

### Typography
- Font: Inter / Poppins (via Tailwind)
- Large numeric emphasis on CO₂ values
- Clear hierarchy with bold headings

### Spacing
- Desktop: 80px (`px-12`)
- Tablet: 40px (`px-8`)
- Mobile: 16px (`px-4`)
- Max width: 1200px (`max-w-6xl`)

### Icons
- **ONLY** lucide-react
- Examples: `Leaf`, `Zap`, `Car`, `Utensils`, `TrendingUp`, `TrendingDown`
- No emoji anywhere

---

## State Management

### AuthContext
Manages:
- `user`: Current user object
- `token`: JWT token
- `loading`: Auth loading state
- `isAuthenticated`: Boolean flag
- `login()`: Login action
- `logout()`: Logout action

### Usage
```javascript
import { useAuth } from '@/context/AuthContext';

const { user, isAuthenticated, login, logout } = useAuth();
```

---

## Responsive Design

### Breakpoints
- Desktop: 1440px (full layout)
- Laptop: 1280px–1440px
- Tablet: 768px (grid to 2-3 columns)
- Mobile: 375px (single column, stacked)

### Grid System
- Desktop: 3 columns
- Tablet: 2 columns
- Mobile: 1 column

---

## Getting Started

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

### Development

```bash
npm run dev
```

Server runs at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

---

## Key Features

### No Emojis
- All indicators use lucide-react icons
- Professional, dashboard-grade appearance
- Consistent icon usage throughout

### Responsive
- Works on desktop (1440px), laptop (1280px), tablet (768px), mobile (375px)
- Grid and flex layouts
- Touch-friendly buttons and inputs

### Real-time Calculations
- Calculator preview updates as you type
- What-if simulator shows live impact
- Dashboard refreshes on navigation

### Dark/Light Mode Ready
- Color system supports both themes
- Currently light-only, easily extendable

### Performance
- Skeleton loaders for API calls
- Client-side form validation
- Optimized re-renders with React.memo (where needed)

---

## Form Validation

### Calculator
- Distance: non-negative numbers
- Waste count: non-negative numbers
- Energy: non-negative numbers

### Register
- Email: valid email format
- Password: 6+ characters (enforced by backend)
- Grade: 8-12 range
- Name: required

### Login
- Email + password required

---

## Charts & Visualizations

### Recharts Components
- **Bar Chart**: Weekly emissions breakdown
- **Line Chart**: Monthly trend visualization
- **Custom Styling**: Green colors matching design system

### Metric Cards
- Large numeric display for CO₂
- Icon + label + trend indicator
- Color-coded trends (green for improved, red for worsened)

---

## Mobile-First Approach

- All pages test on 375px width
- Touch-friendly buttons (min 44px height)
- Readable text at all sizes
- Proper spacing on small screens

---

## Testing

To test the full flow:

1. **Register**: `/register` → Create account
2. **Login**: Auto-redirects to `/dashboard`
3. **Calculator**: `/calculator` → Submit daily log
4. **Result**: Auto-navigate after submission
5. **Carbon Mirror**: `/carbon-mirror` → Explore what-if
6. **Dashboard**: `/dashboard` → View analytics

---

## Future Enhancements

- [ ] Dark mode toggle
- [ ] Offline support (Service Worker)
- [ ] Analytics tracking
- [ ] Share functionality
- [ ] Notifications
- [ ] Advanced filtering on history
- [ ] PDF report export
- [ ] Leaderboards
- [ ] Achievement badges

---

## Troubleshooting

### Token not persisting
- Check `setCookie` in `lib/api/cookie.js`
- Ensure cookies are enabled in browser
- Verify API is returning token in login response

### API calls failing
- Verify backend is running on `:5000`
- Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
- Check browser console for CORS errors

### Components not rendering
- Verify imports use `'use client'` where needed
- Check that pages are in correct app router directories
- Ensure AuthProvider wraps the app in `layout.js`

---

## Code Style

- ES6+ JavaScript
- Functional components with hooks
- Tailwind CSS utility classes
- Consistent naming: camelCase for variables, PascalCase for components
- JSDoc comments for complex functions

---

## Dependencies

```json
{
  "dependencies": {
    "axios": "^1.17.0",
    "js-cookie": "^3.0.7",
    "lucide-react": "^0.344.0",
    "next": "16.2.9",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "recharts": "^3.8.1"
  }
}
```

---

## License

Built for नेओकर्म (Neoकर्म) carbon footprint tracking platform.

---

**Ready to deploy!** All pages are production-ready with:
- Full API integration
- Responsive design
- Error handling
- Loading states
- Professional UI
- Zero emojis
- lucide-react icons throughout
