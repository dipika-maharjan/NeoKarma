import apiClient from './axios';
import { DAILY_LOG_HISTORY, DAILY_LOG_SUBMIT, DAILY_LOG_TODAY } from './endpoints';

export const submitDailyLog = (payload) => apiClient.post(DAILY_LOG_SUBMIT, payload);
export const fetchTodayLog = () => apiClient.get(DAILY_LOG_TODAY);
export const fetchDailyLogHistory = (params = {}) => apiClient.get(DAILY_LOG_HISTORY, { params });
