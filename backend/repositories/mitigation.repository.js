const MitigationPlan = require('../models/MitigationPlan');

class MitigationRepository {
  /**
   * Permanently save a newly generated personalized 1-month mitigation roadmap
   */
  async savePlan(planData) {
    const plan = new MitigationPlan(planData);
    return await plan.save();
  }

  /**
   * Find the student's currently active mitigation roadmap plan
   */
  async findActivePlan(userId) {
    return await MitigationPlan.findOne({ userId, isActive: true })
      .sort({ generatedDate: -1 });
  }

  /**
   * Deactivate previous mitigation roadmaps when generating a fresh plan
   */
  async deactivateOldPlans(userId) {
    return await MitigationPlan.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );
  }
}

module.exports = new MitigationRepository();