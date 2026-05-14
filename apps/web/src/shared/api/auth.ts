import axios from 'axios';
import type { AuthSession, LoginRequest } from '@quizparty/shared';
import { useAppStore } from '../model/app-store';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api';

const authHttp = axios.create({
  baseURL,
  timeout: 8_000,
  withCredentials: true,
});

export async function loginAdmin(credentials: LoginRequest): Promise<AuthSession> {
  const { data } = await authHttp.post<AuthSession>('/auth/login', credentials);
  useAppStore.getState().setAuth(data.accessToken, data.user);
  return data;
}

export async function refreshAdminSession(): Promise<AuthSession> {
  const { data } = await authHttp.post<AuthSession>('/auth/refresh');
  useAppStore.getState().setAuth(data.accessToken, data.user);
  return data;
}

export async function logoutAdmin(): Promise<void> {
  try {
    await authHttp.post('/auth/logout');
  } finally {
    useAppStore.getState().clearAuth();
  }
}
