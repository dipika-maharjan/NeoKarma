import { fetchScoreConfig } from '../api/scoreConfigApi';

export const getScoreConfig = async () => {
  try {
    const config = await fetchScoreConfig();
    return config;
  } catch (error) {
    console.error('Error fetching score config:', error);
    return {};
  }
};
