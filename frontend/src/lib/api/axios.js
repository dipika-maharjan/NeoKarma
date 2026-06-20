import axios from 'axios';
import { getCookie } from './cookie';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  const token = getCookie('token') || localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-unauthorized'));
      }
    }
    if (error.response?.data) {
      return Promise.reject({
        ...error.response.data,
        status: error.response.status
      });
    }
    return Promise.reject({
      message: error.message || 'Unknown error',
      status: error.response?.status,
      code: error.code
    });
  }
);

export default apiClient;
