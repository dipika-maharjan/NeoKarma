import apiClient from './axios';
import { STREAK } from './endpoints';

export const fetchStreak = () => apiClient.get(STREAK);
