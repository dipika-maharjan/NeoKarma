# ![Neoकर्म](/public/name.png) Neoकर्म

### Nepal's School Carbon Action System
*Measure. Reduce. Grow.*

Hacking for a Carbon-Free Future 2026
Shequal Foundation | UNESCO Kathmandu | UNICEF Nepal

A school carbon-tracking prototype built from the Neoकर्म design. The app lets students submit weekly activity data, lets schools review carbon emissions, and combines student inputs with school-level emissions when needed.

## What the app does

- Student weekly input for transport, plastic use, food waste, school, and trip distance
- School carbon report with a toggle to include student submissions in the total
- Per-school submission filtering and school-average distance prefill
- Monthly submission summary stored in browser localStorage
- Carbon breakdown charts and impact cards for quick review

## What's Strong

- The emission methodology section cites DEFRA/BEIS 2023 and links to the official GOV.UK dataset, showing researched, practical conversion factors.
- The data flow explanation clearly documents browser-local persistence and what localStorage does and doesn't do.
- The student submission UX (auto-prefill of school name and average distance) demonstrates real-world thinking for classroom use.

## Getting started

Install dependencies:

```bash
npm i
```

Start the local dev server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

## Project structure

- `src/app/screens/StudentInput.tsx` - student submission form
- `src/app/screens/CarbonReport.tsx` - school carbon report and student-data toggle
- `src/app/components/StudentSubmissionsView.tsx` - current-month student submission list
- `src/app/utils/studentDataStorage.ts` - localStorage persistence and emission calculations
- `src/app/data/emissionFactors.ts` - emission factors and source notes
- `src/app/data/schools.ts` - maintained list of schools shown in the UI

## Core Features

- Bilingual carbon calculator (Nepali + English) using IPCC and DEFRA emission factors
- School archetype classification (Remote / Semi-Urban / Urban) adapts recommendations to Nepal context
- AI-ready recommendation engine with Nepal-specific actions per school type
- Auto-generated 3-month action plan with week-by-week checklists and photo proof upload
- Verification system with bill upload and teacher confirmation
- Impact credit system connecting schools to Nepal NGOs (AEPC, WWF Nepal, Nepal Climate Change Fund)
- Public Impact Ledger showing total CO2 reduced across participating schools
- Fair leaderboard comparing schools only within the same archetype

## Data flow

### School session & authentication

1. A school (e.g., an admin or teacher) registers their school using the Register screen
2. The school profile (name, district, province, archetype) is saved to browser localStorage
3. The school is marked as "logged in" and redirected to the Dashboard
4. On all subsequent visits, if a school profile is active, the user is auto-redirected from landing to Dashboard
5. The school can log out from the profile dropdown in the Layout header, which clears the browser session and returns to landing

### Student submission flow

1. Students arrive and see the StudentInput screen
2. If a school is already logged in via the browser session, that school name is auto-prefilled in the form
3. If the school has prior submissions, the average trip distance is auto-prefilled from past data
4. Students enter transport mode, plastic use, food waste, and optionally adjust the distance
5. On submit, the weekly snapshot is stored to localStorage under that school's data
6. After a brief celebration screen (with tree counter, score ring, and impact summary), the student is auto-navigated to the Carbon Report

### School dashboard & reports

1. The Dashboard shows the currently logged-in school's profile and monthly aggregate emissions
2. The Carbon Report can filter by school, toggle student submissions on/off, and show a breakdown of emissions by category
3. Both pages use the same active school profile from the browser session

## Emission methodology

### Source choice

The transport factors are based on DEFRA / BEIS greenhouse gas conversion factors for 2023:

- GOV.UK page: https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023
- Recommended because it provides public, regularly updated conversion factors in practical reporting units
- Useful for school-level operational reporting, especially transport and waste-style reporting workflows

### Units and calculation approach

- Transport is calculated using kg CO2e per passenger-km multiplied by the student distance in km
- If distance is not entered, the app uses a default round-trip distance of 5 km
- Plastic and food waste use DEFRA waste-disposal factors mapped to simple assumed masses per yes/no response
- Plastic uses the DEFRA 2023 waste-disposal factor for `Plastics: average plastics` with an assumed 50 g item mass
- Food waste uses the DEFRA 2023 waste-disposal factor for `Organic: food and drink waste` with an assumed 200 g item mass

### Important note

The transport and waste factors are DEFRA-derived, but the student form still uses simple assumptions to map yes/no responses into kilograms. If you need audit-grade reporting, replace the assumed masses with actual measured quantities or ask for exact weights at input time.

## Browser storage

This prototype uses browser localStorage only. Clearing site data will remove student submissions and school-average distances.

## Screenshots

Screenshots are included in the repository under `src/assets/screenshots`. Key images shown below:

### Home
![Home](/src/assets/screenshots/home.png)

### School Registration (1)
![School Registration 1](/src/assets/screenshots/school-registration1.png)

### School Registration (2)
![School Registration 2](/src/assets/screenshots/school-registration2.png)

### School Registration (3)
![School Registration 3](/src/assets/screenshots/school-registration3.png)

### Student Weekly Input
![Student Weekly Input](/src/assets/screenshots/student-weekly-input.png)

### Dashboard
![Dashboard](/src/assets/screenshots/dashboard.png)

### Carbon Report
![Carbon Report](/src/assets/screenshots/carbon-report.png)

### Impact Ledger
![Impact Ledger](/src/assets/screenshots/impact-ledger.png)

### Actions for School
![Recommendations / Actions](/src/assets/screenshots/actionsforschool.png)

### Action Plan
![Action Plan](/src/assets/screenshots/action-plan.png)

### Data Entry
![Data Entry](/src/assets/screenshots/dataentry.png)

### Verification
![Verification](/src/assets/screenshots/verification.png)

### Support Connector
![Support Connector](/src/assets/screenshots/support.png)

### Leaderboard
![Leaderboard](/src/assets/screenshots/leaderboard.png)

## Team

Built for Hacking for a Carbon-Free Future 2026
Team Name: Neoकर्म
