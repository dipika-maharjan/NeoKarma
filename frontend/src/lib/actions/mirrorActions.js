import { fetchCarbonMirror, calculateWhatIf } from '../api/mirrorApi';

export const getCarbonMirror = async (locale = 'en') => {
  const response = await fetchCarbonMirror(locale);
  return response.data;
};

export const getWhatIfScenario = async (payload) => {
  const response = await calculateWhatIf(payload);
  return response.data;
};
