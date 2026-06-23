import apiClient from './axios';

export const fetchAdminDashboard = (days = '30') =>
  apiClient.get('/admin/dashboard', { params: { days } });

export const fetchAdminReports = (days = '30') =>
  apiClient.get('/admin/reports', { params: { days } });
