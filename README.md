# ![App Name](/public/name.png) Prototype Design

A school carbon-tracking prototype built from the ![App Name](/public/name.png) design. The app lets students submit weekly activity data, lets schools review carbon emissions, and combines student inputs with school-level emissions when needed.

## What the app does

- Student weekly input for transport, plastic use, food waste, school, and trip distance
- School carbon report with a toggle to include student submissions in the total
- Per-school submission filtering and school-average distance prefill
- Monthly submission summary stored in browser localStorage
- Carbon breakdown charts and impact cards for quick review

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

## Notes for future improvements

- Replace the simplified plastic and food-waste estimates with exact dataset-backed factors
- Persist data to a backend or database instead of localStorage
- Add authentication and school-specific access control
- Add a source/version badge for the active emission-factor dataset in the UI

## License / attribution

See `ATTRIBUTIONS.md` for design and source attribution details.
