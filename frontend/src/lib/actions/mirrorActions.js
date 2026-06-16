import { fetchCarbonMirror, calculateWhatIf } from '../api/mirrorApi';

export const getCarbonMirror = async () => {
  const response = await fetchCarbonMirror();
  return response.data;
};

export const getWhatIfScenario = async (payload) => {
  const response = await calculateWhatIf(payload);
  return response.data;
};
