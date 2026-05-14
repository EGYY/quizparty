import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { refreshAdminSession } from './auth';
import { useAppStore } from '../model/app-store';

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 8_000,
  withCredentials: true,
});

let refreshPromise: Promise<string> | undefined;

http.interceptors.request.use((config) => {
  const token = useAppStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableRequestConfig | undefined;
    const shouldRefresh =
      error.response?.status === 401 && config && !config._retry && !config.url?.includes('/auth/');

    if (!shouldRefresh || !config) {
      throw error;
    }

    config._retry = true;

    try {
      refreshPromise ??= refreshAdminSession()
        .then((session) => session.accessToken)
        .finally(() => {
          refreshPromise = undefined;
        });
      const token = await refreshPromise;
      config.headers.Authorization = `Bearer ${token}`;
      return http(config);
    } catch (refreshError) {
      useAppStore.getState().clearAuth();
      throw refreshError;
    }
  },
);
