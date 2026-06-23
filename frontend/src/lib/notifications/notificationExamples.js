// Hook to easily trigger notifications from anywhere in the app
// Usage: const { showNotification } = useNotifications();
// showNotification({ title: 'Log saved', message: '...', type: 'success' })

// Example integration points:

// 1. AFTER USER LOGS A DAILY ACTIVITY (in CalculatorPage.jsx)
// After successful form submission, add:
/*
showNotification({
  id: `log-saved-${new Date().toISOString()}`,
  type: 'success',
  title: 'Daily log saved',
  message: 'Great job! Your latest log is now part of your progress tracking.',
  actionLabel: 'See result',
  actionHref: '/calculator/result'
});
*/

// 2. WHEN CARBON MIRROR UPDATES (in CarbonMirrorPage.jsx)
// After fetching mirror data, add:
/*
showNotification({
  id: `mirror-updated-${new Date().toISOString()}`,
  type: 'info',
  title: 'New Carbon Mirror insight available',
  message: "Your Carbon Mirror has updated with today's class impact. Tap to view the latest story.",
  actionLabel: 'View mirror',
  actionHref: '/carbon-mirror'
});
*/

// 3. WHEN USER UNLOCKS A MILESTONE (in DashboardPage.jsx)
// After reaching 30 days or other milestone:
/*
showNotification({
  id: `milestone-${new Date().toISOString()}`,
  type: 'success',
  title: '🏆 Milestone unlocked!',
  message: 'You've logged for 30 days. Your personalized AI recommendations are now active.',
  actionLabel: 'View recommendations',
  actionHref: '/plan'
});
*/

// 4. WHEN PLAN IS GENERATED (in RecommendationsView.jsx)
/*
showNotification({
  id: `plan-ready-${new Date().toISOString()}`,
  type: 'success',
  title: 'Your personalized plan is ready',
  message: 'Based on your 30 days of logging, we've created a custom action plan just for you.',
  actionLabel: 'View plan',
  actionHref: '/plan'
});
*/

// 5. WHEN USER ACHIEVES A STREAK (in Navbar.jsx or auth context)
/*
showNotification({
  id: `streak-${currentStreak}-${new Date().toISOString()}`,
  type: 'success',
  title: `🔥 ${currentStreak} day streak!`,
  message: 'You are on fire! Keep logging daily to maintain your streak.',
  actionLabel: 'Log today',
  actionHref: '/calculator'
});
*/

export const notificationExamples = {
  logSaved: {
    type: 'success',
    title: 'Daily log saved',
    message: 'Great job! Your latest log is now part of your progress tracking.',
    actionLabel: 'See result',
    actionHref: '/calculator/result'
  },
  mirrorUpdated: {
    type: 'info',
    title: 'New Carbon Mirror insight available',
    message: "Your Carbon Mirror has updated with today's class impact. Tap to view the latest story.",
    actionLabel: 'View mirror',
    actionHref: '/carbon-mirror'
  },
  planReady: {
    type: 'success',
    title: 'Your personalized plan is ready',
    message: 'Based on your 30 days of logging, we've created a custom action plan just for you.',
    actionLabel: 'View plan',
    actionHref: '/plan'
  },
  streakAchieved: {
    type: 'success',
    title: '🔥 Day streak achieved!',
    message: 'You are on fire! Keep logging daily to maintain your streak.',
    actionLabel: 'Log today',
    actionHref: '/calculator'
  },
  milestoneUnlocked: {
    type: 'success',
    title: '🏆 Milestone unlocked!',
    message: 'You've logged for 30 days. Your personalized AI recommendations are now active.',
    actionLabel: 'View recommendations',
    actionHref: '/plan'
  }
};
