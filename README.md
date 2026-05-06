# Harit Pathshala Prototype Design

A school carbon-tracking prototype built from the Harit Pathshala design. The app lets students submit weekly activity data, lets schools review carbon emissions, and combines student inputs with school-level emissions when needed.

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

1. Students choose their school and enter weekly activity data.
2. The form records transport, plastic use, food waste, and optional distance.
3. Data is stored in browser localStorage as `studentEmissions`.
4. The carbon report can include or exclude student submissions.
5. If a school has past submissions, the distance input is prefilled from that school's average distance.

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
