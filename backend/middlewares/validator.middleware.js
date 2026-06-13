/**
 * Middleware to validate daily carbon log submissions
 */
const validateDailyLog = (req, res, next) => {
  const { userId, inputs } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User identification ID is required.' });
  }

  if (!inputs) {
    return res.status(400).json({ success: false, message: 'Daily activity inputs are missing.' });
  }

  const { transportType, transportDistanceKM, mealsServed, wasteGeneratedKG, energyUsageKWH } = inputs;

  // Validate 1: Transportation
  const validTransportTypes = ['walk', 'bicycle', 'bus', 'motorbike', 'car'];
  if (!validTransportTypes.includes(transportType)) {
    return res.status(400).json({ 
      success: false, 
      message: `Invalid transport type. Must be one of: ${validTransportTypes.join(', ')}` 
    });
  }
  if (typeof transportDistanceKM !== 'number' || transportDistanceKM < 0) {
    return res.status(400).json({ success: false, message: 'Transport distance must be a positive number.' });
  }

  // Validate 2: Food Consumption / Lunch Habits
  const validMealTypes = ['vegetarian', 'non-vegetarian', 'vegan'];
  if (!validMealTypes.includes(mealsServed)) {
    return res.status(400).json({ 
      success: false, 
      message: `Invalid meal selection. Must be one of: ${validMealTypes.join(', ')}` 
    });
  }

  // Validate 3: Waste Generation
  if (typeof wasteGeneratedKG !== 'number' || wasteGeneratedKG < 0) {
    return res.status(400).json({ success: false, message: 'Waste generated must be a positive number.' });
  }

  // Validate 4: Electricity/Energy Usage
  if (typeof energyUsageKWH !== 'number' || energyUsageKWH < 0) {
    return res.status(400).json({ success: false, message: 'Energy consumption must be a positive number.' });
  }

  // Validations passed! Move forward to Controller layer safely
  next();
};

module.exports = { validateDailyLog };