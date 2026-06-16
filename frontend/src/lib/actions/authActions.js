import { registerUser, loginUser, fetchUserProfile, updateUserProfile } from '../api/authApi';
import { setCookie, removeCookie } from '../api/cookie';

export const register = async (userData) => {
  const response = await registerUser(userData);
  const { token, user } = response.data;
  setCookie('neokarma_token', token);
  return { user, token };
};

export const login = async (credentials) => {
  const response = await loginUser(credentials);
  const { token, user } = response.data;
  setCookie('neokarma_token', token);
  return { user, token };
};

export const logout = () => {
  removeCookie('neokarma_token');
};

export const getProfile = async () => {
  const response = await fetchUserProfile();
  return response.data;
};

export const editProfile = async (profileUpdates) => {
  const response = await updateUserProfile(profileUpdates);
  return response.data;
};
