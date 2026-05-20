import type { CreateAxiosDefaults } from 'axios';

export const axiosConfig: CreateAxiosDefaults = {
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 8_000,
  withCredentials: true,
};
