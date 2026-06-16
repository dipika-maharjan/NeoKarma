/**
 * EmissionFactor Repository
 * All database operations related to EmissionFactor model
 */
const EmissionFactor = require('../models/EmissionFactor');

class EmissionFactorRepository {
  /**
   * Find active emission factor for a category-subType pair
   */
  async findActive(category, subType) {
    return await EmissionFactor.findOne({
      category,
      subType,
      isActive: true
    });
  }

  /**
   * Find all active factors for a category
   */
  async findByCategory(category) {
    return await EmissionFactor.find({
      category,
      isActive: true
    });
  }

  /**
   * Get all active factors (for admin/debugging)
   */
  async findAllActive() {
    return await EmissionFactor.find({ isActive: true }).sort({ category: 1, subType: 1 });
  }

  /**
   * Create a new emission factor
   */
  async create(factorData) {
    const factor = new EmissionFactor(factorData);
    return await factor.save();
  }

  /**
   * Create multiple factors (for seeding)
   */
  async createMany(factors) {
    return await EmissionFactor.insertMany(factors);
  }

  /**
   * Update a factor
   */
  async update(factorId, updateData) {
    return await EmissionFactor.findByIdAndUpdate(factorId, updateData, {
      new: true,
      runValidators: true
    });
  }

  /**
   * Deactivate a factor (soft delete)
   */
  async deactivate(factorId) {
    return await EmissionFactor.findByIdAndUpdate(
      factorId,
      { isActive: false },
      { new: true }
    );
  }

  /**
   * Find factor by ID (including inactive)
   */
  async findById(factorId) {
    return await EmissionFactor.findById(factorId);
  }
}

module.exports = new EmissionFactorRepository();
