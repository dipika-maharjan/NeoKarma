import apiClient from './axios';

export const fetchActivePlan = () => apiClient.get('/mitigation-plan');
export const generateMitigationPlan = () => apiClient.post('/mitigation-plan/generate');
export const fetchPlanHistory = () => apiClient.get('/mitigation-plan/history');
