import apiClient from './apiClient';

export const fetchScoreConfig = async () => {
  try {
    const response = await apiClient.get('/score-config');
    return response.data?.data || {};
  } catch (error) {
    console.error('Failed to fetch score config:', error);
    return {};
  }
};
