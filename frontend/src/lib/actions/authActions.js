import { registerUser, loginUser, fetchUserProfile, updateUserProfile, forgotPassword, resetPassword } from '../api/authApi';
import { setCookie, removeCookie } from '../api/cookie';
import { mutate } from 'swr';

export const register = async (userData) => {
  const response = await registerUser(userData);
  const { token, user, role } = response.data.data;
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
  setCookie('token', token);
  setCookie('role', role || user?.role || 'student');
  return { user, token, role };
};

export const login = async (credentials) => {
  const response = await loginUser(credentials);
  const { token, user, role } = response.data.data;
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
  setCookie('token', token);
  setCookie('role', role || user?.role || 'student');
  return { user, token, role };
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    // Clear SWR cache globally to prevent state leakage across user sessions
    mutate(() => true, undefined, { revalidate: false }).catch(() => {});
  }
  removeCookie('token');
  removeCookie('role');
};

export const getProfile = async () => {
  const response = await fetchUserProfile();
  return response.data.data;
};

export const editProfile = async (profileUpdates) => {
  const response = await updateUserProfile(profileUpdates);
  return response.data.data;
};

export const forgotPasswordAction = async (email) => {
  const response = await forgotPassword(email);
  return response.data;
};

export const resetPasswordAction = async (resetData) => {
  const response = await resetPassword(resetData);
  return response.data;
};
