import { fetchAppConfig } from '@/lib/api/configApi';

export const getAppConfig = async () => {
  const response = await fetchAppConfig();
  return response.data?.data || {};
};
