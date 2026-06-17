import { fetchActivePlan, generateMitigationPlan, fetchPlanHistory } from '../api/mitigationPlanApi';

export const getActivePlan = async () => {
  const response = await fetchActivePlan();
  return response.data?.data ?? null;
};

export const generatePlan = async () => {
  const response = await generateMitigationPlan();
  return response.data?.data ?? null;
};

export const getPlanHistory = async () => {
  const response = await fetchPlanHistory();
  return response.data?.data ?? [];
};
