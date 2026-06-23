import apiClient from './axios';
import { AUTH_LOGIN, AUTH_PROFILE, AUTH_REGISTER, AUTH_FORGOT_PASSWORD, AUTH_RESET_PASSWORD } from './endpoints';

export const registerUser = (userData) => apiClient.post(AUTH_REGISTER, userData);
export const loginUser = (credentials) => apiClient.post(AUTH_LOGIN, credentials);
export const fetchUserProfile = () => apiClient.get(AUTH_PROFILE);
export const updateUserProfile = (profileData) => apiClient.patch(AUTH_PROFILE, profileData);
export const forgotPassword = (email) => apiClient.post(AUTH_FORGOT_PASSWORD, { email });
export const resetPassword = (resetData) => apiClient.post(AUTH_RESET_PASSWORD, resetData);
