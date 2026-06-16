import apiClient from './axios';
import { CARBON_MIRROR, CARBON_MIRROR_WHAT_IF } from './endpoints';

export const fetchCarbonMirror = () => apiClient.get(CARBON_MIRROR);
export const calculateWhatIf = (payload) => apiClient.post(CARBON_MIRROR_WHAT_IF, payload);
