import { fetchStreak } from '../api/streakApi';

export const getStreak = async () => {
  const response = await fetchStreak();
  return response.data;
};
