/**
 * Seed script for final emission factors
 * Updated based on mentor's finalized emission factor sheet
 * Run: node scripts/seedEmissionFactors.js
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const EmissionFactor = require('../src/models/EmissionFactor');

const emissionFactorsData = [
  // ── TRANSPORT ──────────────────────────────────────────────────────────
  {
    category: 'transportation',
    subType: 'walk',
    factorValue: 0,
    unit: 'kg CO2/km',
    source: 'IPCC 2006 Guidelines Vol 2 Ch 2',
    sourceUrl: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/pdf/2_Volume2/V2_2_Ch2_Stationary_Combustion.pdf',
    notes: 'Zero direct emissions for walking — no fuel combustion.',
    isActive: true
  },
  {
    category: 'transportation',
    subType: 'bicycle',
    factorValue: 0,
    unit: 'kg CO2/km',
    source: 'IPCC 2006 Guidelines Vol 2 Ch 2',
    sourceUrl: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/pdf/2_Volume2/V2_2_Ch2_Stationary_Combustion.pdf',
    notes: 'Zero direct emissions for cycling — no fuel combustion.',
    isActive: true
  },
  {
    category: 'transportation',
    subType: 'bus',
    factorValue: 0.016,
    unit: 'kg CO2/km',
    source: 'IPCC 2006 Guidelines Vol 2 Ch 2 + Nepal fleet data',
    sourceUrl: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/pdf/2_Volume2/V2_2_Ch2_Stationary_Combustion.pdf',
    notes: 'Derived: IPCC diesel factor (2.65 kg CO2/L) ÷ Nepal avg mileage (4 km/L) ÷ 40 passengers = 0.016 kg CO2/km/passenger.',
    isActive: true
  },
  {
    category: 'transportation',
    subType: 'motorbike',
    factorValue: 0.066,
    unit: 'kg CO2/km',
    source: 'IPCC 2006 Guidelines Vol 2 Ch 2 + Nepal fleet data',
    sourceUrl: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/pdf/2_Volume2/V2_2_Ch2_Stationary_Combustion.pdf',
    notes: 'Derived: IPCC petrol factor (2.31 kg CO2/L) ÷ Nepal avg mileage (35 km/L) = 0.066 kg CO2/km.',
    isActive: true
  },
  {
    category: 'transportation',
    subType: 'car',
    factorValue: 0.19,
    unit: 'kg CO2/km',
    source: 'IPCC 2006 Guidelines Vol 2 Ch 2 + Nepal fleet data',
    sourceUrl: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/pdf/2_Volume2/V2_2_Ch2_Stationary_Combustion.pdf',
    notes: 'Derived: IPCC petrol factor (2.31 kg CO2/L) ÷ Nepal avg mileage (12 km/L) = 0.1925 ≈ 0.19 kg CO2/km.',
    isActive: true
  },

  // ── FOOD ───────────────────────────────────────────────────────────────
  // All food values derived from ingredient-level calculation using:
  // FAOSTAT Emissions Intensities for rice, eggs, chicken (fao.org/faostat/en/#data/EI)
  // Poore & Nemecek 2018 (Science 360:6392) for lentils and vegetables
  // Portion sizes validated via student survey
  // Survey link: https://docs.google.com/forms/d/e/1FAIpQLSfpWET2MCQs-AvyBN9qxMIKrqsQH0YB4pguiWWJtzUxNQ_IIA/viewform
  {
    category: 'food',
    subType: 'vegetarian',
    factorValue: 0.33,
    unit: 'kg CO2/meal',
    source: 'FAOSTAT Emissions Intensities 2022',
    sourceUrl: 'https://www.fao.org/faostat/en/#data/EI',
    notes: `Ingredient-level calculation for Nepali vegetarian dal-bhat (medium portion, survey-validated):
      Rice 150g × 1.0 kg CO2/kg (FAOSTAT Nepal) = 0.150 kg CO2
      Lentils 150g × 0.9 kg CO2/kg (Poore & Nemecek 2018) = 0.135 kg CO2
      Vegetables 80g × 0.53 kg CO2/kg (Poore & Nemecek 2018) = 0.042 kg CO2
      TOTAL = 0.327 ≈ 0.33 kg CO2/meal
      Poore & Nemecek chart: https://ourworldindata.org/grapher/ghg-per-kg-poore`,
    isActive: true
  },
  {
    category: 'food',
    subType: 'vegan',
    factorValue: 0.33,
    unit: 'kg CO2/meal',
    source: 'FAOSTAT Emissions Intensities 2022',
    sourceUrl: 'https://www.fao.org/faostat/en/#data/EI',
    notes: 'Same as vegetarian dal-bhat base — no animal products. 0.33 kg CO2/meal.',
    isActive: true
  },
  {
    category: 'food',
    subType: 'mixed',
    factorValue: 0.4,
    unit: 'kg CO2/meal',
    source: 'FAOSTAT Emissions Intensities 2022',
    sourceUrl: 'https://www.fao.org/faostat/en/#data/EI',
    notes: `Ingredient-level calculation for Nepali mixed meal (dal-bhat + egg, survey-validated):
      Rice 150g × 1.0 kg CO2/kg (FAOSTAT) = 0.150 kg CO2
      Lentils 150g × 0.9 kg CO2/kg (Poore & Nemecek 2018) = 0.135 kg CO2
      Vegetables 80g × 0.53 kg CO2/kg (Poore & Nemecek 2018) = 0.042 kg CO2
      Egg 50g × 0.83 kg CO2/kg (FAOSTAT) = 0.042 kg CO2
      TOTAL = 0.369 ≈ 0.4 kg CO2/meal
      Poore & Nemecek chart: https://ourworldindata.org/grapher/ghg-per-kg-poore`,
    isActive: true
  },
  {
    category: 'food',
    subType: 'non-vegetarian',
    factorValue: 1.2,
    unit: 'kg CO2/meal',
    source: 'FAOSTAT Emissions Intensities 2022',
    sourceUrl: 'https://www.fao.org/faostat/en/#data/EI',
    notes: `Ingredient-level calculation for Nepali non-veg meal (dal-bhat + chicken, survey-validated):
      Rice 150g × 1.0 kg CO2/kg (FAOSTAT) = 0.150 kg CO2
      Lentils 150g × 0.9 kg CO2/kg (Poore & Nemecek 2018) = 0.135 kg CO2
      Vegetables 80g × 0.53 kg CO2/kg (Poore & Nemecek 2018) = 0.042 kg CO2
      Chicken 100g × 0.91 kg CO2/kg (FAOSTAT) = 0.910 kg CO2
      TOTAL = 1.237 ≈ 1.2 kg CO2/meal
      Poore & Nemecek chart: https://ourworldindata.org/grapher/ghg-per-kg-poore`,
    isActive: true
  },

  // ── WASTE ──────────────────────────────────────────────────────────────
  {
    category: 'waste',
    subType: 'plastic',
    factorValue: 0.046,
    unit: 'kg CO2/item',
    source: 'Other',
    sourceUrl: 'https://www.climatiq.io/data/emission-factor/3145e681-1309-47f0-bd8a-bc41e6009704',
    notes: `Derived from plastic lifecycle emission factor 3.7 kg CO2/kg (Climatiq.io):
      1 kg plastic = 80 plastic sheets/bags (standard pack)
      1 item = 1/80 kg = 0.0125 kg plastic
      CO2 per item = 0.0125 × 3.7 = 0.046 kg CO2/item
      Formula: plastic_emission_kg = number_of_items × 0.046
      Example: 2 items × 0.046 = 0.093 kg CO2`,
    isActive: true
  },
  {
    category: 'waste',
    subType: 'food_waste',
    factorValue: 0.827,
    unit: 'kg CO2/kg waste',
    source: 'IPCC 2006 Guidelines Vol 5 Ch 2 — Solid Waste Disposal',
    sourceUrl: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/vol5.html',
    notes: `IPCC 2006 Vol 5 Ch 2 landfill emission factor: 0.827 kg CO2e/kg solid waste.
      Applied per kg of food wasted.
      Survey-validated: average student wastes ~150g food per day.
      Daily food waste emission = 0.827 × 0.15 = 0.124 kg CO2/day.`,
    isActive: true
  },

  // ── ENERGY ─────────────────────────────────────────────────────────────
  {
    category: 'energy',
    subType: 'electricity',
    factorValue: 0.023,
    unit: 'kg CO2/kWh',
    source: 'Asian Transport Observatory — Nepal Transport and Climate Policy Report',
    sourceUrl: 'https://asiantransportobservatory.org/documents/212/Nepal-transport-and-climate-policy.pdf',
    notes: 'Nepal grid emission intensity from ATO Nepal report. Nepal grid is hydropower-dominant (>90%); 0.023 kg CO2/kWh reflects actual grid carbon intensity.',
    isActive: true
  },
  {
    category: 'energy',
    subType: 'firewood',
    factorValue: 1.65,
    unit: 'kg CO2/kg',
    source: 'IPCC 2006 Guidelines Vol 2 Ch 2 — Stationary Combustion (Wood/Wood Waste)',
    sourceUrl: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/pdf/2_Volume2/V2_2_Ch2_Stationary_Combustion.pdf',
    notes: `IPCC 2006 Vol 2 Ch 2, Table 2.2 default emission factor for Wood/Wood Waste:
      = 112,000 kg CO2/TJ
      Calorific value of dry firewood (IPCC default) = 15.6 MJ/kg
      Calculation: 112,000 × 15.6 / 1,000,000 = 1.747 kg CO2/kg (dry wood)
      Adjusted for ~20% moisture content of typical Nepali household firewood:
      1.747 × 0.945 (dry matter fraction) ≈ 1.65 kg CO2/kg
      Used for rural/semi-urban students using firewood for cooking or heating.`,
    isActive: true
  }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing emission factors
    await EmissionFactor.deleteMany({});
    console.log('Cleared existing emission factors');

    // Insert new emission factors
    const result = await EmissionFactor.insertMany(emissionFactorsData);
    console.log(`✓ Successfully seeded ${result.length} emission factors`);

    // Log summary
    const factors = await EmissionFactor.find({ isActive: true }).sort({ category: 1, subType: 1 });
    console.log('\nSeeded Emission Factors:');
    console.log('========================');
    factors.forEach(f => {
      console.log(`${f.category.padEnd(15)} ${f.subType.padEnd(18)} → ${f.factorValue} ${f.unit}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding emission factors:', error);
    process.exit(1);
  }
};

seed();
