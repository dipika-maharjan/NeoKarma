import { fetchDashboardSummary } from '../api/dashboardApi';

export const getDashboardSummary = async () => {
  try {
    const response = await fetchDashboardSummary();
    return response.data?.data || null;
  } catch (error) {
    throw error;
  }
};
