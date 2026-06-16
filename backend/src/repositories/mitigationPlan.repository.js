/**
 * MitigationPlan Repository
 * All database operations related to MitigationPlan model
 */
const MitigationPlan = require('../models/MitigationPlan');

class MitigationPlanRepository {
  /**
   * Find the current active plan for a user
   */
  async findActivePlan(userId) {
    return await MitigationPlan.findOne({
      userId,
      isActive: true
    }).sort({ generatedAt: -1 });
  }

  /**
   * Find all plans for a user (including inactive, for history)
   */
  async findByUser(userId) {
    return await MitigationPlan.find({ userId }).sort({ generatedAt: -1 });
  }

  /**
   * Create a new mitigation plan
   */
  async create(planData) {
    const plan = new MitigationPlan(planData);
    return await plan.save();
  }

  /**
   * Update a plan
   */
  async update(planId, updateData) {
    return await MitigationPlan.findByIdAndUpdate(planId, updateData, {
      new: true,
      runValidators: true
    });
  }

  /**
   * Deactivate old plans for a user (called when generating a new one)
   */
  async deactivateOldPlans(userId) {
    return await MitigationPlan.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );
  }

  /**
   * Find a plan by ID
   */
  async findById(planId) {
    return await MitigationPlan.findById(planId);
  }

  /**
   * Find plans pending generation (status: 'pending')
   */
  async findPending() {
    return await MitigationPlan.find({ status: 'pending' });
  }
}

module.exports = new MitigationPlanRepository();
