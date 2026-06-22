import apiClient from './axios';

export const fetchDashboardSummary = (locale = 'en') => apiClient.get('/dashboard/summary', { params: { locale } });
