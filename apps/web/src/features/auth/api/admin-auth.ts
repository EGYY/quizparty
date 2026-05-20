import axios from 'axios';
import type { AuthSession, LoginRequest } from '@quizparty/shared';
import { axiosConfig } from '@shared/api/client-config';
import { useAppStore } from '@shared/model/app-store';

const authHttp = axios.create(axiosConfig);

export async function loginAdmin(credentials: LoginRequest): Promise<AuthSession> {
  const { data } = await authHttp.post<AuthSession>('/auth/login', credentials);
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
