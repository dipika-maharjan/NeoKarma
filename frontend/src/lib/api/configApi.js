import apiClient from './axios';

export const fetchAppConfig = () => apiClient.get('/config');
