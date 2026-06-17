import { fetchActivePlan, generateMitigationPlan, fetchPlanHistory } from '../api/mitigationPlanApi';

export const getActivePlan = async () => {
  const response = await fetchActivePlan();
  return response.data;
};

export const generatePlan = async () => {
  const response = await generateMitigationPlan();
  return response.data;
};

export const getPlanHistory = async () => {
  const response = await fetchPlanHistory();
  return response.data;
};
