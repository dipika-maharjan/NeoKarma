import apiClient from './axios';
import { CARBON_MIRROR, CARBON_MIRROR_WHAT_IF } from './endpoints';

export const fetchCarbonMirror = (locale = 'en') => apiClient.get(CARBON_MIRROR, { params: { locale } });
export const calculateWhatIf = (payload) => apiClient.post(CARBON_MIRROR_WHAT_IF, payload);
