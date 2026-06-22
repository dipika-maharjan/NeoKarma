# Walkthrough: Plan Page & AI Recommendations Overhaul

We have successfully overhauled the user's Plan/Recommendations experience to implement expert-rule-based recommendations, dynamic calendar routing, category emission charts, and a simulation playground.

## Changes Implemented

### 1. Backend Custom Routing Check
In [mitigationPlan.service.js](file:///d:/new%20Neokarma/NeoKarma/backend/src/services/mitigationPlan.service.js):
- Added logic checking if the user is in the first week of the calendar month (day 1 to 7) OR if their log count is under 7.
- Under either condition, it returns the `GENERAL_PLAN` with generic recommendations. After that, it generates the personalized `WEEKLY_PLAN` using logs from the calculator.

### 2. Enhanced Expert-Rule-Based AI Engine
In [fallbackRuleProvider.js](file:///d:/new%20Neokarma/NeoKarma/backend/src/services/ai/fallbackRuleProvider.js):
- Built out a rich rule evaluation system scanning transport modes, vegetarian/mixed diet ratios, average food waste, single-use plastic habits, unsegregated trash records, device usage hours, and rural firewood consumption.
- Generates high-fidelity recommendation plans with custom badges (e.g. HIGH IMPACT), action descriptions, and estimated carbon savings.

### 3. Redesigned Premium Frontend View
In [RecommendationsView.jsx](file:///d:/new%20Neokarma/NeoKarma/frontend/src/components/RecommendationsView.jsx):
- **Dynamic Plan Status Banner**: Shows whether the user is in the General Awareness Phase or has unlocked the full AI Rule-Based recommendations.
- **Recharts Carbon Profile Chart**: Renders a clean category breakdown (Transport, Food, Energy, Waste) comparing the relative carbon contributions.
- **What-If Projection Simulator**: Slider and toggle inputs for commuting, eating, device, and plastic choices that update potential carbon reductions and equivalent tree counts in real-time.
- **Tab Alignment**: Handles both `WEEKLY_PLAN` and `MONTHLY_PLAN` categories accurately.
- **Visual polish**: Clean shadow gradients, responsive flex positioning, card translations, hover scales, and animated check buttons.

## Verification

- **Database Seeding and Dynamic User Fallback**: Enhanced [seedDailyLogsForUser.js](file:///d:/new%20Neokarma/NeoKarma/backend/scripts/seedDailyLogsForUser.js) to dynamically register the target student in MongoDB (using bcrypt to hash `password123`) if they do not yet exist, preventing any missing user errors. Successfully seeded 90 days of progressive daily history for `guragainaruna@gmail.com` and `sudip1@gmail.com`.
- **Backend Build**: Verified server executes and connects to MongoDB.
- **Frontend Build**: Verified frontend compiles without typings/typographic errors.
