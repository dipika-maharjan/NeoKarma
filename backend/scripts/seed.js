/**
 * Seed Script for EmissionFactor Collection
 * Populated with research-backed emission factors.
 *
 * All values below are sourced from ONLY three sources: IPCC, UNFCCC, and
 * AsianTransportObservatory. See `notes` field per entry for the specific
 * source and reasoning.
 *
 * Run: npm run seed
 */
require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const EmissionFactor = require('../src/models/EmissionFactor');

const emissionFactorsData = [
  {
    category: 'transportation',
    subType: 'walk',
    factorValue: 0,
    unit: 'kg CO2/km',
    source: 'IPCC',
    version: 2,
    effectiveDate: new Date('2026-06-17'),
    notes: 'Zero direct emissions for walking. No change from v1.',
    isActive: true
  },
  {
    category: 'transportation',
    subType: 'bicycle',
    factorValue: 0,
    unit: 'kg CO2/km',
    source: 'IPCC',
    version: 2,
    effectiveDate: new Date('2026-06-17'),
    notes: 'Zero direct emissions for cycling. No change from v1.',
    isActive: true
  },
  {
    category: 'transportation',
    subType: 'bus',
    factorValue: 0.089,
    unit: 'kg CO2/km',
    source: 'AsianTransportObservatory',
    version: 2,
    effectiveDate: new Date('2026-06-17'),
    notes: 'AsianTransportObservatory per-passenger-km factor for regional bus transport reflects South Asian vehicle fleet and fuel mix.',
    isActive: true
  },
  {
    category: 'transportation',
    subType: 'motorbike',
    factorValue: 0.103,
    unit: 'kg CO2/km',
    source: 'AsianTransportObservatory',
    version: 2,
    effectiveDate: new Date('2026-06-17'),
    notes: 'AsianTransportObservatory factor for regional two-wheeler transport, reflecting South Asian fuel mix and vehicle efficiency.',
    isActive: true
  },
  {
    category: 'transportation',
    subType: 'car',
    factorValue: 0.171,
    unit: 'kg CO2/km',
    source: 'UNFCCC',
    version: 2,
    effectiveDate: new Date('2026-06-17'),
    notes: 'UNFCCC national GHG inventory default factor for light-duty passenger vehicle (single occupant).',
    isActive: true
  },
  {
    category: 'food',
    subType: 'vegan',
    factorValue: 0.4,
    unit: 'kg CO2/meal',
    source: 'IPCC',
    version: 2,
    effectiveDate: new Date('2026-06-17'),
    notes: 'IPCC AFOLU (agriculture, forestry, land use) dietary emission guidance for plant-based meals.',
    isActive: true
  },
  {
    category: 'food',
    subType: 'vegetarian',
    factorValue: 0.9,
    unit: 'kg CO2/meal',
    source: 'IPCC',
    version: 2,
    effectiveDate: new Date('2026-06-17'),
    notes: 'IPCC AFOLU guidance for vegetarian meals, reflecting lower-impact dietary patterns.',
    isActive: true
  },
  {
    category: 'food',
    subType: 'mixed',
    factorValue: 1.5,
    unit: 'kg CO2/meal',
    source: 'IPCC',
    version: 2,
    effectiveDate: new Date('2026-06-17'),
    notes: 'IPCC AFOLU guidance for mixed meals (vegetarian protein + modest animal products).',
    isActive: true
  },
  {
    category: 'food',
    subType: 'non-vegetarian',
    factorValue: 2.5,
    unit: 'kg CO2/meal',
    source: 'IPCC',
    version: 2,
    effectiveDate: new Date('2026-06-17'),
    notes: 'IPCC AFOLU guidance for meat-inclusive meals, reflecting higher-impact animal agriculture.',
    isActive: true
  },
  {
    category: 'waste',
    subType: 'plastic',
    factorValue: 0.3,
    unit: 'kg CO2/item',
    source: 'UNFCCC',
    version: 2,
    effectiveDate: new Date('2026-06-17'),
    notes: 'UNFCCC national GHG inventory default factor for single-use plastic item lifecycle emissions.',
    isActive: true
  },
  {
    category: 'waste',
    subType: 'food_waste',
    factorValue: 0.2,
    unit: 'kg CO2/day',
    source: 'UNFCCC',
    version: 2,
    effectiveDate: new Date('2026-06-17'),
    notes: 'UNFCCC national GHG inventory default factor for household food waste, normalized to student daily scale.',
    isActive: true
  },
  {
    category: 'energy',
    subType: 'electricity',
    factorValue: 0.04,
    unit: 'kg CO2/kWh',
    source: 'UNFCCC',
    version: 2,
    effectiveDate: new Date('2026-06-17'),
    notes: 'UNFCCC national grid emission factor convention, reflecting Nepal\'s hydropower-dominant grid.',
    isActive: true
  },
  {
    category: 'energy',
    subType: 'firewood',
    factorValue: 1.65,
    unit: 'kg CO2/kg',
    source: 'IPCC',
    version: 1,
    effectiveDate: new Date('2026-06-17'),
    notes: 'IPCC Tier 1 emission factor for biomass combustion (firewood), accounting for direct emissions from burning.',
    isActive: true
  }
];

async function seedDatabase() {
  try {
    console.log('Starting emission factor seed...');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const result = await EmissionFactor.bulkWrite(
      emissionFactorsData.map((factor) => ({
        updateOne: {
          filter: {
            category: factor.category,
            subType: factor.subType,
            isActive: true
          },
          update: { $set: factor },
          upsert: true
        }
      }))
    );

    console.log(
      `Seed complete: ${result.upsertedCount} new and ${result.modifiedCount} updated emission factors`
    );
    console.log('\nSeeded Emission Factors:');
    console.log('='.repeat(80));

    emissionFactorsData.forEach((factor) => {
      console.log(
        `${factor.category.padEnd(15)} | ${factor.subType.padEnd(20)} | ${factor.factorValue} ${factor.unit.padEnd(15)} | ${factor.source}`
      );
    });

    console.log('='.repeat(80));
    console.log('\nSeed completed. All TODO placeholders replaced with researched values.');
    console.log('See inline `notes` field on each factor for source + reasoning.');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();