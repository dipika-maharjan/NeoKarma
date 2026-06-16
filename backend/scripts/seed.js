/**
 * Seed Script for EmissionFactor Collection
 * Populates initial emission factors with placeholder values
 * 
 * WARNING: All values marked "TODO: confirm with carbon mentor" should be replaced
 * with values from IPCC, UNFCCC, or AsianTransportObservatory after research
 * 
 * Run: npm run seed
 */
require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const EmissionFactor = require('../src/models/EmissionFactor');

const emissionFactorsData = [
  // ==================== TRANSPORTATION ====================
  {
    category: 'transportation',
    subType: 'walk',
    factorValue: 0,
    unit: 'kg CO2/km',
    source: 'IPCC',
    version: 1,
    effectiveDate: new Date('2024-01-01'),
    notes: 'Zero emissions for walking'
  },
  {
    category: 'transportation',
    subType: 'bicycle',
    factorValue: 0,
    unit: 'kg CO2/km',
    source: 'IPCC',
    version: 1,
    effectiveDate: new Date('2024-01-01'),
    notes: 'Zero direct emissions for cycling'
  },
  {
    category: 'transportation',
    subType: 'bus',
    factorValue: 0.015,
    unit: 'kg CO2/km',
    source: 'AsianTransportObservatory',
    version: 1,
    effectiveDate: new Date('2024-01-01'),
    notes: 'TODO: confirm with carbon mentor - Asia-specific bus emissions factor'
  },
  {
    category: 'transportation',
    subType: 'motorbike',
    factorValue: 0.06,
    unit: 'kg CO2/km',
    source: 'AsianTransportObservatory',
    version: 1,
    effectiveDate: new Date('2024-01-01'),
    notes: 'TODO: confirm with carbon mentor - common two-wheeler in Nepal'
  },
  {
    category: 'transportation',
    subType: 'car',
    factorValue: 0.18,
    unit: 'kg CO2/km',
    source: 'UNFCCC',
    version: 1,
    effectiveDate: new Date('2024-01-01'),
    notes: 'TODO: confirm with carbon mentor - average passenger car emissions'
  },

  // ==================== FOOD ====================
  {
    category: 'food',
    subType: 'vegan',
    factorValue: 0.4,
    unit: 'kg CO2/meal',
    source: 'IPCC',
    version: 1,
    effectiveDate: new Date('2024-01-01'),
    notes: 'TODO: confirm with carbon mentor - plant-based meal emissions'
  },
  {
    category: 'food',
    subType: 'vegetarian',
    factorValue: 1.1,
    unit: 'kg CO2/meal',
    source: 'IPCC',
    version: 1,
    effectiveDate: new Date('2024-01-01'),
    notes: 'TODO: confirm with carbon mentor - vegetarian meal including dairy'
  },
  {
    category: 'food',
    subType: 'non-vegetarian',
    factorValue: 2.8,
    unit: 'kg CO2/meal',
    source: 'IPCC',
    version: 1,
    effectiveDate: new Date('2024-01-01'),
    notes: 'TODO: confirm with carbon mentor - meat-based meal emissions'
  },

  // ==================== WASTE & PLASTIC ====================
  {
    category: 'waste',
    subType: 'plastic',
    factorValue: 0.45,
    unit: 'kg CO2/item',
    source: 'LocalResearch',
    version: 1,
    effectiveDate: new Date('2024-01-01'),
    notes: 'TODO: confirm with carbon mentor - plastic production and disposal emissions per item'
  },

  // ==================== ENERGY ====================
  {
    category: 'energy',
    subType: 'electricity',
    factorValue: 0.38,
    unit: 'kg CO2/kWh',
    source: 'UNFCCC',
    version: 1,
    effectiveDate: new Date('2024-01-01'),
    notes: 'TODO: confirm with carbon mentor - Nepal grid electricity mix emissions (hydro-dominant)'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting emission factor seed...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing factors (optional - comment out to preserve existing data)
    // await EmissionFactor.deleteMany({});
    // console.log('🗑️  Cleared existing emission factors');

    // Insert seed data
    const insertedFactors = await EmissionFactor.insertMany(emissionFactorsData, {
      ordered: false // Continue on duplicate key errors
    });
    console.log(`✅ Inserted ${insertedFactors.length} emission factors`);

    // Display inserted data
    console.log('\n📋 Seeded Emission Factors:');
    console.log('═'.repeat(80));
    insertedFactors.forEach((factor) => {
      console.log(
        `${factor.category.padEnd(15)} | ${factor.subType.padEnd(20)} | ${factor.factorValue} ${factor.unit.padEnd(15)} | ${factor.source}`
      );
      if (factor.notes && factor.notes.includes('TODO')) {
        console.log(`  ⚠️  ${factor.notes}`);
      }
    });

    console.log('═'.repeat(80));
    console.log(
      '\n✨ Seed completed! Review all "TODO" items above with your carbon mentor.'
    );

    process.exit(0);
  } catch (error) {
    // If error is duplicate key and we're not clearing, that's fine
    if (error.code === 11000) {
      console.log('⚠️  Some factors already exist (duplicate key). Skipping duplicates.');
      process.exit(0);
    }

    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
