import { submitDailyLog, fetchTodayLog, fetchDailyLogHistory } from '../api/calculatorApi';

export const logDailyCarbon = async (payload) => {
  const response = await submitDailyLog(payload);
  return response.data;
};

export const getTodayLog = async () => {
  const response = await fetchTodayLog();
  return response.data;
};

export const getDailyLogHistory = async (params = {}) => {
  const response = await fetchDailyLogHistory(params);
  return response.data;
};
