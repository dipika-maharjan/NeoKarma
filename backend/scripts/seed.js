/**
 * Seed Script for EmissionFactor Collection
 * Populates initial emission factors with placeholder values.
 *
 * WARNING: All values marked "TODO: confirm with carbon mentor" should be
 * replaced with values from IPCC, UNFCCC, or AsianTransportObservatory after
 * research.
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
    version: 1,
    effectiveDate: new Date('2024-01-01'),
    notes: 'Zero emissions for walking',
    isActive: true
  },
  {
    category: 'transportation',
    subType: 'bicycle',
    factorValue: 0,
    unit: 'kg CO2/km',
    source: 'IPCC',
    version: 1,
    effectiveDate: new Date('2024-01-01'),
    notes: 'Zero direct emissions for cycling',
    isActive: true
  },
  {
    category: 'transportation',
    subType: 'bus',
    factorValue: 0.015,
    unit: 'kg CO2/km',
    source: 'AsianTransportObservatory',
    version: 1,
    effectiveDate: new Date('2024-01-01'),
    notes: 'TODO: confirm with carbon mentor - Asia-specific bus emissions factor',
    isActive: true
  },
  {
    category: 'transportation',
    subType: 'motorbike',
    factorValue: 0.06,
    unit: 'kg CO2/km',
    source: 'AsianTransportObservatory',
    version: 1,
    effectiveDate: new Date('2024-01-01'),
    notes: 'TODO: confirm with carbon mentor - common two-wheeler in Nepal',
    isActive: true
  },
  {
    category: 'transportation',
    subType: 'car',
    factorValue: 0.18,
    unit: 'kg CO2/km',
    source: 'UNFCCC',
    version: 1,
    effectiveDate: new Date('2024-01-01'),
    notes: 'TODO: confirm with carbon mentor - average passenger car emissions',
    isActive: true
  },
  {
    category: 'food',
    subType: 'vegan',
    factorValue: 0.4,
    unit: 'kg CO2/meal',
    source: 'IPCC',
    version: 1,
    effectiveDate: new Date('2024-01-01'),
    notes: 'TODO: confirm with carbon mentor - plant-based meal emissions',
    isActive: true
  },
  {
    category: 'food',
    subType: 'vegetarian',
    factorValue: 0.9,
    unit: 'kg CO2/meal',
    source: 'IPCC',
    version: 1,
    effectiveDate: new Date('2024-01-01'),
    notes: 'TODO: confirm with carbon mentor - vegetarian meal including dairy',
    isActive: true
  },
  {
    category: 'food',
    subType: 'mixed',
    factorValue: 1.5,
    unit: 'kg CO2/meal',
    source: 'IPCC',
    version: 1,
    effectiveDate: new Date('2024-01-01'),
    notes: 'TODO: confirm with carbon mentor - mixed meal emissions',
    isActive: true
  },
  {
    category: 'food',
    subType: 'non-vegetarian',
    factorValue: 2.5,
    unit: 'kg CO2/meal',
    source: 'IPCC',
    version: 1,
    effectiveDate: new Date('2024-01-01'),
    notes: 'TODO: confirm with carbon mentor - meat-based meal emissions',
    isActive: true
  },
  {
    category: 'waste',
    subType: 'plastic',
    factorValue: 0.45,
    unit: 'kg CO2/item',
    source: 'LocalResearch',
    version: 1,
    effectiveDate: new Date('2024-01-01'),
    notes: 'TODO: confirm with carbon mentor - plastic production and disposal emissions per item',
    isActive: true
  },
  {
    category: 'energy',
    subType: 'electricity',
    factorValue: 0.38,
    unit: 'kg CO2/kWh',
    source: 'UNFCCC',
    version: 1,
    effectiveDate: new Date('2024-01-01'),
    notes: 'TODO: confirm with carbon mentor - Nepal grid electricity mix emissions (hydro-dominant)',
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
      if (factor.notes && factor.notes.includes('TODO')) {
        console.log(`  WARNING: ${factor.notes}`);
      }
    });

    console.log('='.repeat(80));
    console.log('\nSeed completed. Review all TODO items with your carbon mentor.');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
