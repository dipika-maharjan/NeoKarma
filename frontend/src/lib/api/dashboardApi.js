import apiClient from './axios';

export const fetchDashboardSummary = () => apiClient.get('/dashboard/summary');
