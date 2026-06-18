import apiClient from '../api/axios';

const SHARE_GENERATE = '/share/generate';
const SHARE_GET = '/share/:shareId';

export const generateShare = async (customMessage = null) => {
  const response = await apiClient.post(SHARE_GENERATE, {
    customMessage
  });
  return response.data;
};

export const getShareProfile = async (shareId) => {
  const response = await apiClient.get(`/share/${shareId}`);
  return response.data;
};

export const disableShare = async (shareId) => {
  const response = await apiClient.delete(`/share/${shareId}`);
  return response.data;
};
