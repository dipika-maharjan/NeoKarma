import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

const getCookies = () => {
  if (typeof window === 'undefined') return null;
  return require('js-cookie');
};

apiClient.interceptors.request.use((config) => {
  const Cookies = getCookies();
  const token = Cookies?.get('neokarma_token');

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error.response?.data || error.message || 'Unknown error')
);

export const setAuthToken = (token) => {
  const Cookies = getCookies();
  if (!Cookies) return;

  if (token) {
    Cookies.set('neokarma_token', token, {
      expires: 7,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
  } else {
    Cookies.remove('neokarma_token');
  }
};

export const clearAuthToken = () => setAuthToken(null);

export default apiClient;
