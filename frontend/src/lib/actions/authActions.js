import { registerUser, loginUser, fetchUserProfile, updateUserProfile } from '../api/authApi';
import { setCookie, removeCookie } from '../api/cookie';

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
