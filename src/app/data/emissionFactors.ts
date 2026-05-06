// Emission factors (kg CO2e per unit)
// Source: DEFRA/BEIS "Greenhouse gas reporting: conversion factors 2023" (condensed set)
// https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023
// Transport factors use the Passenger vehicles sheet (per passenger-km).
// Waste factors use the Waste disposal sheet:
// - Organic: food and drink waste, landfill
// - Plastics: average plastics, landfill
// The app maps simple yes/no inputs to assumed masses so these DEFRA factors can be used.

const EMISSION_FACTORS = {
  transport_per_pkm: {
    // kg CO2e per passenger-km (DEFRA condensed 2023, rounded)
    walking: 0,
    bike: 0,
    bus: 0.089, // bus (local, per passenger-km)
    motorbike: 0.103, // motorcycle/motorbike
    car: 0.18065, // average car per passenger-km
  },
  waste_disposal_per_kg: {
    // kg CO2e per kg waste (derived from DEFRA 2023 condensed waste disposal factors)
    food_waste_landfill: 0.7002098817534277, // row 50 / landfill / kg-to-kg
    plastics_average_landfill: 0.008884130131626865, // row 75 / landfill / kg-to-kg
  },
  // Assumed mass per student input so the disposal factors can be applied.
  // These assumptions are intentionally simple and documented in the README.
  assumed_item_mass_kg: {
    plastic_item: 0.05, // 50g of single-use plastic brought to school
    food_waste_item: 0.2, // 200g of food waste for the weekly yes/no input
  },
  // default round-trip distance (km) used when student doesn't provide distance
  default_roundtrip_km: 5,
  // citation url
  source_url: 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023',
};

export default EMISSION_FACTORS;
