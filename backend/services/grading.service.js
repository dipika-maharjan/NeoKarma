const carbonLogRepository = require('../repositories/carbonLog.repository');
const userRepository = require('../repositories/user.repository');

class GradingService {
  /**
   * Formulates practical scores out of 10 based on compliance and participation frequency
   */
  async evaluatePracticalMarks(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('Student profile record not found.');
      error.statusCode = 404;
      throw error;
    }

    // Examine activity across a rolling 30-day observation window
    const logsLogged = await carbonLogRepository.getRecentLogs(userId, 30);
    const entriesSubmittedCount = logsLogged.length;

    // Allocate academic compliance marks purely on logging frequency and honesty
    let dynamicPracticalScore = 0;
    let feedbackNote = '';

    if (entriesSubmittedCount >= 26) {
      dynamicPracticalScore = 10; // Top tier participation marks
      feedbackNote = 'Outstanding environmental monitoring data tracking and excellent compliance records.';
    } else if (entriesSubmittedCount >= 18) {
      dynamicPracticalScore = 8;
      feedbackNote = 'Strong tracking consistency. Keep maintaining your daily streak loops.';
    } else if (entriesSubmittedCount >= 10) {
      dynamicPracticalScore = 5;
      feedbackNote = 'Moderate activity. Consistent input logging is needed to secure full practical marks.';
    } else {
      dynamicPracticalScore = 2;
      feedbackNote = 'Insufficient monitoring data points. Please log your data daily to improve your score.';
    }

    return {
      studentName: user.name,
      academicGrade: user.grade,
      schoolName: user.schoolName,
      activeStreakCount: user.streakCount,
      daysLoggedThisMonth: entriesSubmittedCount,
      assignedPracticalParticipationMark: dynamicPracticalScore,
      maxPossibleMark: 10,
      feedbackNote
    };
  }
}

module.exports = new GradingService();